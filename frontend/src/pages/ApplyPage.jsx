import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft, Zap, Copy, CheckCircle, Mail, MessageSquare,
  Lightbulb, FileText, RefreshCw, ChevronDown, ChevronUp,
  User, Briefcase, Code2, Globe,
} from 'lucide-react';
import { Link } from 'wouter';
import { useTheme } from '@/lib/theme';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };
  return (
    <button onClick={copy} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all"
      style={{ background: copied ? 'rgba(48,209,88,0.15)' : 'rgba(255,255,255,0.07)', color: copied ? '#30d158' : 'rgba(255,255,255,0.45)', border: `1px solid ${copied ? 'rgba(48,209,88,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
      {copied ? <><CheckCircle size={9} />Copied!</> : <><Copy size={9} />Copy</>}
    </button>
  );
}

function Section({ title, icon, color, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="liquid-glass rounded-3xl overflow-hidden" style={{ border: `1px solid ${color}25` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-5 py-3.5"
        style={{ background: `${color}08`, borderBottom: open ? `1px solid ${color}15` : 'none' }}>
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wide flex-1 text-left" style={{ color }}>{title}</span>
        {open ? <ChevronUp size={14} style={{ color }} /> : <ChevronDown size={14} style={{ color }} />}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

export default function ApplyPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [jobDescription, setJobDescription] = useState('');
  const [userName, setUserName] = useState('');
  const [userExperience, setUserExperience] = useState('');
  const [userSkills, setUserSkills] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [streamText, setStreamText] = useState('');
  const [error, setError] = useState('');
  const abortRef = useRef(null);

  const textPrimary = isDark ? '#ffffff' : '#0a0f1e';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,15,30,0.5)';
  const pageBg = isDark ? '#000000' : '#eef2f7';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const surfaceBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const inputStyle = { background: surfaceBg, border: `1px solid ${surfaceBorder}`, color: textPrimary, outline: 'none', borderRadius: '16px' };

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const uName = localStorage.getItem('userName');
    if (role === 'candidate' && uName) {
      setUserName(uName);
    }
  }, []);

  const handleGenerate = async () => {
    if (!jobDescription.trim() || jobDescription.trim().length < 20) { 
      setError('Please paste the job description (at least 20 characters)'); 
      return; 
    }
    setError(''); setGenerating(true); setResult(null); setStreamText('');
    abortRef.current = new AbortController();
    
    try {
      const res = await fetch('/api/apply/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, userName, userExperience, userSkills }),
        signal: abortRef.current.signal,
      });
      
      if (!res.ok || !res.body) throw new Error('Generation failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedFull = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep last incomplete line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(trimmed.slice(6));
            if (data.error) throw new Error(data.error);
            
            if (data.delta) {
              accumulatedFull += data.delta;
              setStreamText(accumulatedFull);
            }
            
            if (data.done) {
              const fullContent = data.full || accumulatedFull;
              try {
                const cleaned = fullContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                const start = cleaned.indexOf('{');
                const end = cleaned.lastIndexOf('}') + 1;
                const parsed = JSON.parse(start >= 0 ? cleaned.slice(start, end) : cleaned);
                setResult(parsed);
                setStreamText('');
              } catch (err) {
                console.error('Final parse error:', err);
                setError('Failed to parse AI output. Try again.');
              }
            }
          } catch (e) {
            console.warn('Individual line parse error:', e);
          }
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'Generation failed');
    } finally { 
      setGenerating(false); 
    }
  };

  return (
    <div className="min-h-screen grid-bg relative overflow-x-hidden" style={{ background: pageBg }}>
      <div className="fixed top-0 left-1/3 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,102,255,0.06) 0%, transparent 70%)', filter: 'blur(60px)' }} />



      <div className="relative z-10 max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-3" style={{ color: textPrimary }}>
            Apply <span className="gradient-text-purple">Smarter.</span>
          </h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: textMuted }}>
            Paste a job description — AI writes your cover letter, email, and interview prep in seconds.
          </p>
        </div>

        {/* Input Form */}
        {!result && !generating && (
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: textMuted }}>
                <FileText size={12} /> Job Description <span className="text-red-400">*</span>
              </label>
              <textarea value={jobDescription} onChange={(e) => { setJobDescription(e.target.value); setError(''); }}
                placeholder="Paste the full job description here..."
                className="w-full h-52 text-sm p-4 resize-none"
                style={{ ...inputStyle, padding: '16px' }} />
              <p className="text-[10px] mt-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)' }}>
                {jobDescription.length} chars — more detail = better output
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-4" style={{ border: `1px solid ${surfaceBorder}` }}>
              <p className="text-xs font-semibold mb-3 flex items-center gap-1.5" style={{ color: textMuted }}>
                <User size={12} /> Your Details <span style={{ color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)', fontWeight: 400 }}>(optional but improves quality)</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Your Name', icon: <User size={11} />, placeholder: 'e.g. Rahul Sharma', value: userName, onChange: setUserName },
                  { label: 'Years of Experience', icon: <Briefcase size={11} />, placeholder: 'e.g. 4 years in React dev', value: userExperience, onChange: setUserExperience },
                ].map(({ label, icon, placeholder, value, onChange }) => (
                  <div key={label}>
                    <label className="flex items-center gap-1 text-[10px] font-semibold mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>
                      {icon} {label}
                    </label>
                    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full text-xs px-3 py-2.5" style={inputStyle} />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <label className="flex items-center gap-1 text-[10px] font-semibold mb-1.5" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.4)' }}>
                  <Code2 size={11} /> Key Skills
                </label>
                <input value={userSkills} onChange={(e) => setUserSkills(e.target.value)} placeholder="e.g. React, TypeScript, Node.js, AWS" className="w-full text-xs px-3 py-2.5" style={inputStyle} />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-2xl text-xs" style={{ background: 'rgba(255,55,95,0.08)', border: '1px solid rgba(255,55,95,0.2)', color: '#ff375f' }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button onClick={handleGenerate} disabled={jobDescription.trim().length < 20}
              className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #0055cc, #00d4ff)', color: '#fff', boxShadow: jobDescription.trim().length >= 20 ? '0 0 30px rgba(0,85,204,0.3)' : 'none' }}>
              <Zap size={16} /> Generate Application Content
            </button>
          </div>
        )}

        {/* Loading */}
        {generating && (
          <div className="space-y-4">
            <div className="liquid-glass rounded-3xl p-6" style={{ border: '1px solid rgba(0,85,204,0.2)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="glass-pulse w-2.5 h-2.5 rounded-full" style={{ background: '#0055cc' }} />
                <span className="text-sm font-semibold" style={{ color: isDark ? '#00d4ff' : '#0055cc' }}>Writing your application...</span>
              </div>
              {streamText && (
                <div className="text-xs font-mono leading-relaxed max-h-48 overflow-hidden" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)', maskImage: 'linear-gradient(to bottom, black 60%, transparent)' }}>
                  {streamText.slice(-500)}<span className="terminal-cursor" />
                </div>
              )}
              {!streamText && (
                <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-4 rounded" style={{ width: `${70 + (i * 8)}%` }} />)}</div>
              )}
            </div>
            {[
              { label: 'Analyzing job requirements...', color: '#0055cc' },
              { label: 'Writing cover letter...', color: '#bf5af2' },
              { label: 'Crafting email template...', color: '#00d4ff' },
              { label: 'Building interview prep...', color: '#30d158' },
            ].map((item, i) => (
              <div key={i} className="liquid-glass rounded-2xl p-4" style={{ border: `1px solid ${item.color}20` }}>
                <div className="flex items-center gap-2">
                  <div className="skeleton w-8 h-8 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-3.5 rounded" style={{ width: '70%' }} />
                    <div className="skeleton h-2.5 rounded" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !generating && (
          <div className="space-y-4">
            <div className="liquid-glass rounded-3xl p-5" style={{ border: '1px solid rgba(48,209,88,0.2)', background: isDark ? 'rgba(48,209,88,0.04)' : 'rgba(48,209,88,0.03)' }}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={16} style={{ color: '#30d158' }} />
                <span className="font-bold" style={{ color: textPrimary }}>Application Ready!</span>
              </div>
              {result.job_title && (
                <p className="text-sm" style={{ color: textMuted }}>
                  <span className="font-semibold" style={{ color: isDark ? '#00d4ff' : '#0055cc' }}>{result.job_title}</span>
                  {result.company_name ? ` at ${result.company_name}` : ''}
                </p>
              )}
            </div>

            <Section title="Cover Letter" icon={<FileText size={13} />} color="#bf5af2">
              <div className="flex justify-end mb-2"><CopyButton text={result.cover_letter} /></div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textPrimary }}>{result.cover_letter}</p>
            </Section>

            <Section title="Email Template" icon={<Mail size={13} />} color={isDark ? '#00d4ff' : '#0055cc'}>
              <div className="mb-3 p-3 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#f6f8fb', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: isDark ? '#00d4ff' : '#0055cc' }}>Subject Line</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: textPrimary }}>{result.email_subject}</p>
                  <CopyButton text={result.email_subject} />
                </div>
              </div>
              <div className="flex justify-end mb-2"><CopyButton text={result.email_body} /></div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: textPrimary }}>{result.email_body}</p>
            </Section>

            {result.key_requirements?.length > 0 && (
              <Section title="Key Job Requirements" icon={<Briefcase size={13} />} color="#ffd60a" defaultOpen={false}>
                <div className="space-y-1.5">
                  {result.key_requirements.map((req, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: textMuted }}>
                      <span className="font-bold shrink-0 mt-0.5" style={{ color: '#ffd60a' }}>{i + 1}.</span>
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.talking_points?.length > 0 && (
              <Section title="Interview Talking Points" icon={<MessageSquare size={13} />} color="#30d158">
                <div className="space-y-2">
                  {result.talking_points.map((tp, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-xl text-xs"
                      style={{ background: 'rgba(48,209,88,0.04)', border: '1px solid rgba(48,209,88,0.12)', color: textMuted }}>
                      <span className="font-black shrink-0 mt-0.5 text-[10px]" style={{ color: '#30d158' }}>{i + 1}</span>
                      <span className="leading-relaxed">{tp}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.suggested_questions?.length > 0 && (
              <Section title="Smart Questions to Ask" icon={<Lightbulb size={13} />} color="#ff9500" defaultOpen={false}>
                <div className="space-y-2">
                  {result.suggested_questions.map((q, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: textMuted }}>
                      <span className="font-bold shrink-0 mt-0.5" style={{ color: '#ff9500' }}>Q{i + 1}.</span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.tips?.length > 0 && (
              <Section title="Application Tips" icon={<Globe size={13} />} color="#ff375f" defaultOpen={false}>
                <div className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs" style={{ color: textMuted }}>
                      <span className="text-[#ff375f] shrink-0 mt-0.5 font-bold">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <button onClick={() => { setResult(null); setStreamText(''); }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`, color: textMuted }}>
              <RefreshCw size={14} /> Try Different Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
