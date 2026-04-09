import { useState, useCallback, useRef, useEffect } from 'react';
import {
  Search, Mic, MicOff, RefreshCw, Zap, TrendingUp, Brain, ChevronRight,
  ChevronDown, Loader2, Menu, X, LayoutDashboard, IndianRupee, Target,
  Briefcase, BookOpen, Sun, Moon, Send, User,
} from 'lucide-react';
import { Link } from 'wouter';
import JobCard from '@/components/JobCard';
import TerminalLog from '@/components/TerminalLog';
import {
  searchJobsFromAPI, saveJobsToStorage, loadJobsFromStorage,
} from '@/lib/api';
import { useTheme } from '@/lib/theme';

const TRENDING = [
  'React Developer', 'AI Engineer', 'Data Scientist', 'Full Stack Dev',
  'DevOps Engineer', 'Cloud Architect', 'GenAI Engineer', 'Backend Go',
];

const STATS = [
  { label: 'Active Jobs', value: '2.4M+', color: '#00d4ff' },
  { label: 'AI Matches/Day', value: '180K+', color: '#bf5af2' },
  { label: 'Companies', value: '12K+', color: '#30d158' },
  { label: 'Success Rate', value: '94%', color: '#ffd60a' },
];

const SALARY_INSIGHTS = [
  { role: 'React Developer', range: '₹12–35 LPA', trend: '+18%', color: '#00d4ff' },
  { role: 'AI/ML Engineer', range: '₹20–65 LPA', trend: '+42%', color: '#bf5af2' },
  { role: 'DevOps Engineer', range: '₹15–40 LPA', trend: '+22%', color: '#30d158' },
  { role: 'Data Scientist', range: '₹18–45 LPA', trend: '+30%', color: '#ffd60a' },
];

const heroTexts = [
  "India's #1 AI Job Platform",
  "Find Your Dream Tech Job",
  "AI-Powered Career Search",
  "Get Hired Faster with AI",
];

export default function HomePage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState(() => loadJobsFromStorage() || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalDone, setTerminalDone] = useState(!!jobs.length);
  const [listening, setListening] = useState(false);
  const [hasSearched, setHasSearched] = useState(() => !!jobs.length);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState('');
  const [typedText, setTypedText] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const recognitionRef = useRef(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    const interval = setInterval(() => setHeroIdx((i) => (i + 1) % heroTexts.length), 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const text = heroTexts[heroIdx];
    let i = 0;
    setTypedText('');
    const timer = setInterval(() => {
      if (i < text.length) { setTypedText(text.slice(0, i + 1)); i++; }
      else clearInterval(timer);
    }, 55);
    return () => clearInterval(timer);
  }, [heroIdx]);

  const runSearch = useCallback((q) => {
    if (!q.trim()) return;
    setJobs([]);
    setHasMore(false);
    setLoading(true);
    setTerminalActive(true);
    setTerminalDone(false);
    setHasSearched(false);
    setPage(1);
    setCurrentQuery(q);
  }, []);

  const handleTerminalComplete = useCallback(async () => {
    try {
      const result = await searchJobsFromAPI(currentQuery || query, 1, 6);
      setJobs(result.jobs);
      setHasMore(result.hasMore);
      setPage(1);
      saveJobsToStorage(result.jobs);
    } catch { setJobs([]); setHasMore(false); }
    setLoading(false);
    setHasSearched(true);
    setTerminalActive(false);
    setTerminalDone(true);
  }, [currentQuery, query]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await searchJobsFromAPI(currentQuery, nextPage, 6);
      setJobs((prev) => [...prev, ...result.jobs]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } catch { setHasMore(false); }
    setLoadingMore(false);
  };

  const handleVoiceSearch = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { alert('Voice search not supported.'); return; }
    const rec = new SpeechRec();
    recognitionRef.current = rec;
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.onresult = (e) => { const t = e.results[0][0].transcript; setQuery(t); setListening(false); runSearch(t); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  const textPrimary = isDark ? '#ffffff' : '#0a0f1e';
  const textMuted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,15,30,0.45)';
  const textDim = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(10,15,30,0.28)';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.8)';
  const surfaceBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const navBorder = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)';

  return (
    <div className="min-h-screen nq-page-bg grid-bg relative overflow-x-hidden">
      {isDark && <>
        <div className="fixed top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.055) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div className="fixed top-32 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(191,90,242,0.045) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </>}


      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black mb-3 leading-tight">
            <span className="font-mono" style={{ color: '#00d4ff', textShadow: isDark ? '0 0 24px rgba(0,212,255,0.35)' : 'none' }}>
              {typedText}<span className="terminal-cursor ml-0.5" />
            </span>
          </h1>
          <p className="text-sm sm:text-base max-w-md mx-auto" style={{ color: textMuted }}>
            AI agent finds &amp; ranks India's best tech jobs with real apply links in seconds.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="nq-glass rounded-xl p-3 text-center" style={{ borderColor: `${s.color}18` }}>
              <div className="text-xl sm:text-2xl font-black font-mono mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px]" style={{ color: textMuted }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="relative mb-4 rounded-2xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(0,212,255,0.18)' : 'rgba(0,100,210,0.22)'}`, background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)' }}>
          <div className="flex items-center">
            <Search size={16} className="ml-4 shrink-0" style={{ color: 'rgba(0,212,255,0.45)' }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch(query)} placeholder="Search: React, AI, Data Science..." className="flex-1 bg-transparent px-3 py-4 text-sm outline-none" style={{ color: textPrimary }} />
            <button onClick={handleVoiceSearch} className="mr-2 w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ background: listening ? 'rgba(255,55,95,0.15)' : 'rgba(0,212,255,0.07)', border: `1px solid ${listening ? 'rgba(255,55,95,0.35)' : 'rgba(0,212,255,0.18)'}` }}>
              {listening ? <MicOff size={14} color="#ff375f" /> : <Mic size={14} color="#00d4ff" />}
            </button>
            <button onClick={() => runSearch(query)} disabled={loading} className="mr-2 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.9), rgba(0,85,255,0.9))', color: '#000' }}>
              <Zap size={14} /> <span className="hidden sm:inline">{loading ? 'Searching...' : 'AI Search'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-8">
          {TRENDING.map((t) => (
            <button key={t} onClick={() => { setQuery(t); runSearch(t); }} className="text-[11px] px-3 py-1 rounded-full transition-all" style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}`, color: textMuted }}>{t}</button>
          ))}
        </div>

        {!hasSearched && !terminalActive && !terminalDone && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Link href="/courses">
                <div className="nq-glass rounded-xl p-4 cursor-pointer transition-all hover:border-[rgba(48,209,88,0.28)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(48,209,88,0.08)', border: '1px solid rgba(48,209,88,0.18)' }}>
                      <BookOpen size={16} className="text-[#30d158]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: textPrimary }}>Free &amp; Paid Courses</p>
                      <p className="text-[10px]" style={{ color: textMuted }}>AI curates courses by your interest</p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link href="/resume-match">
                <div className="nq-glass rounded-xl p-4 cursor-pointer transition-all hover:border-[rgba(191,90,242,0.28)]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(191,90,242,0.08)', border: '1px solid rgba(191,90,242,0.18)' }}>
                      <Target size={16} className="text-[#bf5af2]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold" style={{ color: textPrimary }}>Resume Match AI</p>
                      <p className="text-[10px]" style={{ color: textMuted }}>Paste resume → AI finds best-fit jobs</p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="nq-glass rounded-2xl p-5 mb-6" style={{ borderColor: 'rgba(255,215,0,0.1)' }}>
              <div className="flex items-center gap-2 mb-4">
                <IndianRupee size={14} className="text-[#ffd60a]" />
                <span className="text-sm font-bold" style={{ color: textPrimary }}>2025 India Tech Salary Benchmark</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {SALARY_INSIGHTS.map((s) => (
                  <div key={s.role} className="flex items-center justify-between p-2.5 rounded-xl" style={{ background: `${s.color}06`, border: `1px solid ${s.color}15` }}>
                    <div>
                      <p className="text-xs font-medium" style={{ color: textPrimary }}>{s.role}</p>
                      <p className="text-[10px] font-mono" style={{ color: s.color }}>{s.range}</p>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold" style={{ background: 'rgba(48,209,88,0.1)', color: '#30d158' }}>{s.trend}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {(terminalActive || terminalDone) && (
          <div className="mb-6">
            <TerminalLog active={terminalActive} onComplete={handleTerminalComplete} keepAlive={terminalDone} />
          </div>
        )}

        {loading && jobs.length === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="liquid-glass rounded-2xl p-4 space-y-3">
                <div className="skeleton h-12 w-12 rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded-lg" />
                <div className="skeleton h-3 w-1/2 rounded-lg" />
                <div className="skeleton h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        )}

        {hasSearched && jobs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <span className="text-sm" style={{ color: textMuted }}><span className="text-[#00d4ff] font-bold">{jobs.length}</span> jobs found</span>
              <button onClick={() => currentQuery && runSearch(currentQuery)} className="text-xs transition-colors" style={{ color: textMuted }}><RefreshCw size={11} className="inline mr-1" /> Refresh</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job, i) => (
                <JobCard key={i} job={job} index={i} highlight={i === 0} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <button onClick={handleLoadMore} disabled={loadingMore} className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.18)', color: '#00d4ff' }}>
                  {loadingMore ? <Loader2 size={15} className="animate-spin" /> : <ChevronDown size={15} />}
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
