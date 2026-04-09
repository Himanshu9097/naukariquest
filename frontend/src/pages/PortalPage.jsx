import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { Search } from 'lucide-react';

export default function PortalPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const textPrimary = isDark ? '#ffffff' : '#0a0f1e';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,15,30,0.5)';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const surfaceBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const pageBg = isDark ? '#000000' : '#f0f4f8';

  const fetchJobs = (q = '') => {
    setLoading(true);
    fetch(`/api/jobs/search?q=${encodeURIComponent(q)}&limit=20`)
      .then(res => res.json())
      .then(data => { setJobs(data.jobs || []); setLoading(false); })
      .catch(e => { console.error(e); setLoading(false); });
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    if (!userId || userRole !== 'candidate') {
      alert('Please login as a Candidate to apply for jobs.');
      return;
    }

    try {
      const res = await fetch('/api/dashboard/candidate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, candidateId: userId })
      });
      const data = await res.json();
      if (res.ok) alert('Application submitted successfully!');
      else alert(data.error || 'Failed to apply');
    } catch (e) {
      alert('Error submitting application');
    }
  };

  const handleSearch = () => fetchJobs(searchTerm);

  return (
    <div className="min-h-screen" style={{ background: pageBg }}>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-2" style={{ color: textPrimary }}>Job Portal</h1>
        <p className="text-sm mb-8" style={{ color: textMuted }}>AI-powered job search — India only</p>

        <div className="mb-8 p-3 rounded-full flex items-center gap-2" style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}` }}>
          <Search size={16} style={{ color: textMuted }} className="ml-2 shrink-0" />
          <input
            placeholder="Search jobs by title, skills, company..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: textPrimary }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2 rounded-full font-bold text-sm text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #bf5af2, #7c3aed)' }}
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#bf5af2', borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: textMuted }}>Finding best jobs in India...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-2xl mb-2">🔍</p>
            <p className="font-semibold mb-1" style={{ color: textPrimary }}>No jobs found</p>
            <p className="text-sm" style={{ color: textMuted }}>Try a different search term</p>
          </div>
        ) : (
          <>
            <p className="text-xs mb-4" style={{ color: textMuted }}>{jobs.length} jobs found</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map(job => {
                const allSkills = job.skills?.length ? job.skills : (job.requiredSkills || []);
                const matchNum = parseInt(job.match_score) || 0;
                const matchColor = matchNum >= 80 ? '#30d158' : matchNum >= 60 ? '#00d4ff' : '#ffd60a';
                return (
                  <div key={job._id} className="p-5 rounded-2xl flex flex-col gap-3" style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}` }}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold truncate" style={{ color: textPrimary }}>{job.title}</h3>
                        <p className="text-xs mt-0.5" style={{ color: textMuted }}>{job.company} • {job.location}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-black font-mono" style={{ color: matchColor }}>{job.match_score || 'New'}</div>
                        <div className="text-[9px]" style={{ color: textMuted }}>match</div>
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      {allSkills.slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-0.5 text-[10px] rounded font-mono" style={{ background: 'rgba(191,90,242,0.1)', color: '#bf5af2', border: '1px solid rgba(191,90,242,0.2)' }}>{s}</span>
                      ))}
                      {allSkills.length > 4 && <span className="px-2 py-0.5 text-[10px] rounded" style={{ color: textMuted }}>+{allSkills.length - 4}</span>}
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span style={{ color: '#00d4ff' }}>{job.salary || 'Competitive'}</span>
                      <span style={{ color: textMuted }}>{job.experience || 'Open'}</span>
                    </div>

                    {job.why_match && (
                      <p className="text-[10px] px-2 py-1 rounded" style={{ background: 'rgba(48,209,88,0.07)', color: '#30d158', border: '1px solid rgba(48,209,88,0.15)' }}>
                        ✓ {job.why_match}
                      </p>
                    )}

                    <button
                      onClick={() => handleApply(job._id)}
                      className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #0077ff, #00d4ff)' }}
                    >
                      Apply Now
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
