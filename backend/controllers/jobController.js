const Job = require('../models/Job');
const OpenAI = require('openai');

const ai = new OpenAI({
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/v1`,
  apiKey: process.env.CF_API_TOKEN,
});

// Use Llama 3.3 70B to parse user query and GENERATE mock jobs from external platforms
// Use Llama 3.3 70B to parse user query into structured search terms
async function parseQueryWithAI(q) {
  try {
    const comp = await ai.chat.completions.create({
      model: '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      messages: [
        {
          role: 'user',
          content: `Extract job search terms from: "${q}"

Return ONLY this JSON, no explanation, no markdown:
{"roles":["job title keywords"],"skills":["technical skills"],"keywords":["other terms"]}`
        }
      ],
      max_tokens: 200,
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    let raw = comp.choices[0].message.content || '{}';
    raw = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}') + 1;
    const parsed = JSON.parse(start >= 0 ? raw.slice(start, end) : raw);
    return {
      roles: parsed.roles || [],
      skills: parsed.skills || [],
      keywords: parsed.keywords || []
    };
  } catch (err) {
    console.error('AI parse error:', err.message);
    return { roles: [q], skills: [], keywords: [] };
  }
}

// @desc  AI-powered job search — exclusively local jobs posted by companies
// @route GET /api/jobs/search
const searchJobs = async (req, res) => {
  const { q, page = 1, limit = 8 } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 8;
  const skip = (pageNum - 1) * limitNum;

  try {
    if (!q || !q.trim()) {
      // No query — return recent jobs
      const jobs = await Job.find({}).sort({ createdAt: -1 }).skip(skip).limit(limitNum);
      const total = await Job.countDocuments({});
      return res.json({
        jobs: jobs.map(j => ({ ...j.toObject(), match_score: 'New', source: 'NaukriQuest', why_match: 'Recently posted' })),
        total, query: '', page: pageNum, hasMore: (skip + jobs.length) < total
      });
    }

    // Use AI to parse the query
    const { roles, skills, keywords } = await parseQueryWithAI(q.trim());

    // Build all search terms into regex array
    const allTerms = [...roles, ...skills, ...keywords].filter(Boolean);
    const orClauses = allTerms.flatMap(term => {
      const r = { $regex: term, $options: 'i' };
      return [
        { title: r },
        { description: r },
        { requiredSkills: r },
        { skills: r }
      ];
    });

    // Also add the raw query as a fallback
    const rawRegex = { $regex: q.trim(), $options: 'i' };
    orClauses.push(
      { title: rawRegex },
      { company: rawRegex },
      { description: rawRegex },
      { requiredSkills: rawRegex }
    );

    const searchQuery = { $or: orClauses };

    let allMatches = await Job.find(searchQuery).limit(200);
    
    // Fallback: if no results with strict OR, return latest
    if (allMatches.length === 0) {
      allMatches = await Job.find({}).limit(200);
    }

    // Score each job by how many search terms it matches
    const userTerms = [...roles, ...skills, ...keywords, q.trim()].map(t => t.toLowerCase());
    const scored = allMatches.map(job => {
      const allJobSkills = [...(job.requiredSkills || []), ...(job.skills || [])];
      const jobText = [
        job.title || '',
        job.description || '',
        job.company || '',
        ...allJobSkills
      ].join(' ').toLowerCase();

      let score = 0;
      userTerms.forEach(term => {
        if (term && jobText.includes(term.toLowerCase())) score++;
      });

      // Strong boost if title directly matches a role keyword
      const titleLower = (job.title || '').toLowerCase();
      roles.forEach(role => { if (titleLower.includes(role.toLowerCase())) score += 5; });

      // Boost if skill matches
      skills.forEach(skill => {
        if (allJobSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))) score += 2;
      });

      return { job, score, allJobSkills };
    });

    // Sort by score desc, then by date
    scored.sort((a, b) => b.score - a.score || new Date(b.job.createdAt) - new Date(a.job.createdAt));

    const paginated = scored.slice(skip, skip + limitNum);
    const total = scored.length;
    const maxScore = scored[0]?.score || 1;

    const formattedJobs = paginated.map(({ job, score, allJobSkills }) => {
      const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;
      const matchPct = Math.max(pct, 50); // always show at least 50% for results returned
      const matchedSkills = allJobSkills.filter(s =>
        userTerms.some(t => s.toLowerCase().includes(t))
      );
      return {
        ...job.toObject(),
        match_score: `${matchPct}%`,
        source: 'NaukriQuest',
        why_match: matchedSkills.length > 0
          ? `Matches: ${matchedSkills.slice(0, 3).join(', ')}`
          : `Relevant to "${q}"`
      };
    });

    res.json({ jobs: formattedJobs, total, query: q, page: pageNum, hasMore: (skip + formattedJobs.length) < total });
  } catch (err) {
    console.error('Job search failed:', err.message);
    res.json({ jobs: [], total: 0, query: q || '', page: pageNum, hasMore: false });
  }
};

module.exports = { searchJobs };

