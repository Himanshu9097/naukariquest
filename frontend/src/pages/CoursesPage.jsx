import { useState, useCallback, useEffect } from 'react';
import {
  BookOpen, ChevronLeft, ExternalLink, Award, Users, Clock, Star, Zap, Filter, Loader2, ChevronRight,
  Code2, Database, Brain, Cloud, Layers, Shield, Smartphone, Cpu, Blocks, Layout, BarChart3, Settings2,
} from 'lucide-react';
import { Link, useSearch } from 'wouter';
import TerminalLog from '@/components/TerminalLog';
import { searchCoursesFromAPI } from '@/lib/api';
import { useTheme } from '@/lib/theme';

const INTERESTS = [
  { label: 'React / Frontend', icon: <Layout size={13} />, color: '#00d4ff' },
  { label: 'Python', icon: <Code2 size={13} />, color: '#30d158' },
  { label: 'AI / Machine Learning', icon: <Brain size={13} />, color: '#bf5af2' },
  { label: 'Data Science', icon: <BarChart3 size={13} />, color: '#ffd60a' },
  { label: 'DevOps / Cloud', icon: <Cloud size={13} />, color: '#00d4ff' },
  { label: 'Full Stack', icon: <Layers size={13} />, color: '#0066ff' },
  { label: 'Cybersecurity', icon: <Shield size={13} />, color: '#ff375f' },
  { label: 'iOS / Swift', icon: <Smartphone size={13} />, color: '#ff9500' },
  { label: 'Android / Kotlin', icon: <Smartphone size={13} />, color: '#30d158' },
  { label: 'GenAI / LLMs', icon: <Cpu size={13} />, color: '#bf5af2' },
  { label: 'Blockchain / Web3', icon: <Blocks size={13} />, color: '#ffd60a' },
  { label: 'System Design', icon: <Settings2 size={13} />, color: '#00d4ff' },
  { label: 'Databases / SQL', icon: <Database size={13} />, color: '#ff9500' },
];

const COURSE_LOGS = [
  '$ Analyzing interest profile...', '$ Querying AI course index...', '$ Fetching from Udemy, Coursera, edX...',
  '$ Scanning YouTube, freeCodeCamp, NPTEL...', '$ Indexing free vs. paid options...', '$ Ranking by relevance & ratings...',
  '$ Filtering India-accessible content...', '$ Generating personalized recommendations...',
];

const PROVIDER_COLORS = {
  Udemy: '#a435f0', Coursera: '#0056d2', edX: '#444', freeCodeCamp: '#0a0a23', YouTube: '#ff0000',
  NPTEL: '#00509e', 'Great Learning': '#e94560', Simplilearn: '#f58220', Scaler: '#6c5ecf',
  Alison: '#2ea44f', 'MIT OpenCourseWare': '#8b1a1a', 'Google Developers': '#4285f4',
  'Microsoft Learn': '#0078d4', 'AWS Training': '#ff9900',
};

function CourseCard({ course, index, isDark }) {
  const providerColor = PROVIDER_COLORS[course.provider] || '#00d4ff';
  const isFree = course.type === 'free';
  const cardBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.92)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const textPrimary = isDark ? '#ffffff' : '#0a0f1e';
  const textMuted = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(10,15,30,0.5)';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const tagColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(10,15,30,0.5)';
  const tagBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <div data-testid={`course-card-${index}`}
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(12px)', boxShadow: isDark ? 'none' : '0 2px 12px rgba(0,0,0,0.04)' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${providerColor}35`; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = cardBorder; e.currentTarget.style.transform = 'translateY(0)'; }}>
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${providerColor}, ${providerColor}40)` }} />
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: `${providerColor}18`, border: `1px solid ${providerColor}35`, color: providerColor }}>
            {course.provider.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-1.5 justify-between">
              <h3 className="text-sm font-bold leading-snug line-clamp-2 flex-1" style={{ color: textPrimary }}>{course.title}</h3>
              <span className="shrink-0 text-[9px] px-2 py-0.5 rounded-full font-bold ml-1"
                style={isFree
                  ? { background: 'rgba(48,209,88,0.12)', color: '#30d158', border: '1px solid rgba(48,209,88,0.25)' }
                  : { background: 'rgba(255,149,0,0.12)', color: '#ff9500', border: '1px solid rgba(255,149,0,0.25)' }}>
                {isFree ? 'FREE' : 'PAID'}
              </span>
            </div>
            <p className="text-xs font-semibold mt-0.5" style={{ color: providerColor }}>{course.provider}</p>
          </div>
        </div>
        <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: textMuted }}>{course.description}</p>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { icon: <Star size={9} style={{ color: '#ffd60a' }} />, val: course.rating },
            { icon: <Users size={9} style={{ color: '#00d4ff' }} />, val: course.students },
            { icon: <Clock size={9} style={{ color: '#bf5af2' }} />, val: course.duration },
            { icon: <Zap size={9} style={{ color: '#30d158' }} />, val: course.level },
          ].map(({ icon, val }, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: textMuted }}>{icon} {val}</div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mb-4">
          {course.skills?.slice(0, 3).map((skill) => (
            <span key={skill} className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ background: surfaceBg, border: `1px solid ${tagBorder}`, color: tagColor }}>{skill}</span>
          ))}
          {course.certificate && <span className="text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ background: 'rgba(255,215,0,0.07)', border: '1px solid rgba(255,215,0,0.18)', color: '#ffd60a' }}><Award size={8} /> Cert</span>}
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm" style={{ color: isFree ? '#30d158' : '#ff9500' }}>{course.price}</span>
          <a href={course.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: `${providerColor}15`, border: `1px solid ${providerColor}30`, color: providerColor }}>
            <ExternalLink size={11} /> Enroll Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage({ initialInterest = '' }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const searchStr = useSearch();
  const qParam = new URLSearchParams(searchStr).get('q') || initialInterest;

  const [selected, setSelected] = useState(qParam);
  const [customInterest, setCustomInterest] = useState('');
  const [filter, setFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalDone, setTerminalDone] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeInterest, setActiveInterest] = useState(qParam);

  useEffect(() => {
    if (qParam) { setActiveInterest(qParam); setLoading(true); setTerminalActive(true); setTerminalDone(false); setHasSearched(false); setCourses([]); }
  }, []);

  const textPrimary = isDark ? '#ffffff' : '#0a0f1e';
  const textMuted = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(10,15,30,0.5)';
  const textDim = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(10,15,30,0.28)';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const surfaceBorder = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const pageBg = isDark ? '#000000' : '#f0f4f8';
  const navBg = isDark ? 'rgba(0,0,0,0.6)' : 'rgba(240,244,248,0.88)';

  const handleSearch = (interestOverride) => {
    const interest = interestOverride || customInterest.trim() || selected;
    if (!interest) return;
    setActiveInterest(interest); setLoading(true); setTerminalActive(true); setTerminalDone(false); setHasSearched(false); setCourses([]);
  };

  const handleTerminalComplete = useCallback(async () => {
    try {
      const results = await searchCoursesFromAPI(activeInterest, filter);
      setCourses(results);
    } catch { setCourses([]); }
    setLoading(false); setHasSearched(true); setTerminalActive(false); setTerminalDone(true);
  }, [activeInterest, filter]);

  const filteredCourses = courses.filter((c) => filter === 'all' || c.type === filter);
  const freeCourses = filteredCourses.filter((c) => c.type === 'free');
  const paidCourses = filteredCourses.filter((c) => c.type === 'paid');

  return (
    <div className="min-h-screen grid-bg relative overflow-x-hidden" style={{ background: pageBg }}>
      {isDark && <div className="fixed bottom-0 left-1/3 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(48,209,88,0.05) 0%, transparent 70%)', filter: 'blur(60px)' }} />}



      <div className="relative z-10 max-w-4xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-3" style={{ color: textPrimary }}>Learn Anything. <span className="gradient-text-green">Get Hired.</span></h1>
          <p className="text-sm max-w-md mx-auto" style={{ color: textMuted }}>Pick an interest and AI curates the best free &amp; paid courses from top platforms worldwide.</p>
        </div>

        <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: textDim }}><Zap size={11} style={{ color: '#ffd60a' }} /> Pick your learning interest</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {INTERESTS.map((item) => (
            <button key={item.label} onClick={() => { setSelected(item.label); setCustomInterest(''); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={selected === item.label
                ? { background: `${item.color}18`, border: `1px solid ${item.color}45`, color: item.color }
                : { background: surfaceBg, border: `1px solid ${surfaceBorder}`, color: textMuted }}>
              <span style={{ color: selected === item.label ? item.color : textDim }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 rounded-xl overflow-hidden" style={{ border: 'solid 1px rgba(48,209,88,0.22)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.85)' }}>
            <input value={customInterest} onChange={(e) => { setCustomInterest(e.target.value); if (e.target.value) setSelected(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Or type: 'Rust', 'Game Dev', 'DSA', 'Docker'..."
              className="w-full bg-transparent px-4 py-3.5 text-sm outline-none" style={{ color: textPrimary }} />
          </div>
          <button data-testid="find-courses-btn" onClick={() => handleSearch()} disabled={loading || (!selected && !customInterest.trim())}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, rgba(48,209,88,0.9), rgba(0,212,255,0.9))', color: '#000' }}>
            {loading ? <Loader2 size={15} className="animate-spin" /> : <BookOpen size={15} />}
            Find Courses
          </button>
        </div>

        {(hasSearched || terminalActive || terminalDone) && (
          <div className="flex items-center gap-2 mb-5">
            <Filter size={12} style={{ color: textDim }} />
            {['all', 'free', 'paid'].map((f) => (
              <button key={f} data-testid={`filter-${f}`} onClick={() => setFilter(f)}
                className="text-xs px-3 py-1.5 rounded-full transition-all capitalize"
                style={filter === f
                  ? { background: f === 'free' ? 'rgba(48,209,88,0.18)' : f === 'paid' ? 'rgba(255,149,0,0.18)' : 'rgba(0,212,255,0.18)', border: `1px solid ${f === 'free' ? 'rgba(48,209,88,0.35)' : f === 'paid' ? 'rgba(255,149,0,0.35)' : 'rgba(0,212,255,0.35)'}`, color: f === 'free' ? '#30d158' : f === 'paid' ? '#ff9500' : '#00d4ff' }
                  : { background: surfaceBg, border: `1px solid ${surfaceBorder}`, color: textMuted }}>
                {f === 'free' ? 'Free Only' : f === 'paid' ? 'Paid Only' : 'All Courses'}
              </button>
            ))}
          </div>
        )}

        {(terminalActive || terminalDone) && (
          <div className="mb-5">
            <TerminalLog active={terminalActive} onComplete={handleTerminalComplete} customLogs={COURSE_LOGS} keepAlive={terminalDone} />
          </div>
        )}

        {loading && courses.length === 0 && (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="glass-pulse w-2 h-2 rounded-full" style={{ background: '#30d158' }} />
              <span className="text-sm font-semibold" style={{ color: isDark ? '#30d158' : '#1a7a3c' }}>AI curating best courses for you...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="liquid-glass rounded-2xl overflow-hidden" style={{ border: isDark ? '1px solid rgba(48,209,88,0.08)' : '1px solid rgba(0,100,60,0.08)', animationDelay: `${i * 0.08}s` }}>
                  <div className="h-1 skeleton" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="skeleton h-3.5 rounded-lg" style={{ width: '70%' }} />
                        <div className="skeleton h-2.5 rounded-lg" style={{ width: '45%' }} />
                      </div>
                      <div className="skeleton w-12 h-6 rounded-full shrink-0" />
                    </div>
                    <div className="skeleton h-2.5 rounded-lg w-full" />
                    <div className="skeleton h-2.5 rounded-lg" style={{ width: '85%' }} />
                    <div className="skeleton h-9 rounded-xl w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSearched && filteredCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm" style={{ color: textMuted }}>
                  <span className="font-semibold" style={{ color: '#30d158' }}>{filteredCourses.length}</span> courses for{' '}
                  <span className="font-medium" style={{ color: textPrimary }}>&ldquo;{activeInterest}&rdquo;</span>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-[#30d158] font-medium">{freeCourses.length} free</span>
                <span style={{ color: textDim }}>·</span>
                <span className="text-[#ff9500] font-medium">{paidCourses.length} paid</span>
              </div>
            </div>

            {(filter === 'all' || filter === 'free') && freeCourses.length > 0 && (
              <div className="mb-8">
                {filter === 'all' && (
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen size={13} style={{ color: '#30d158' }} />
                    <h2 className="text-sm font-bold" style={{ color: '#30d158' }}>Free Courses</h2>
                    <div className="flex-1 h-px" style={{ background: 'rgba(48,209,88,0.1)' }} />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freeCourses.map((course, i) => (
                    <div key={i} className="slide-up" style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: 'forwards' }}>
                      <CourseCard course={course} index={i} isDark={isDark} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(filter === 'all' || filter === 'paid') && paidCourses.length > 0 && (
              <div>
                {filter === 'all' && (
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={13} style={{ color: '#ff9500' }} />
                    <h2 className="text-sm font-bold" style={{ color: '#ff9500' }}>Paid Courses</h2>
                    <div className="flex-1 h-px" style={{ background: 'rgba(255,149,0,0.1)' }} />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paidCourses.map((course, i) => (
                    <div key={i} className="slide-up" style={{ animationDelay: `${i * 0.06}s`, opacity: 0, animationFillMode: 'forwards' }}>
                      <CourseCard course={course} index={freeCourses.length + i} isDark={isDark} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-8 p-5 rounded-2xl" style={{ background: isDark ? 'rgba(0,212,255,0.04)' : 'rgba(0,100,210,0.04)', border: isDark ? '1px solid rgba(0,212,255,0.1)' : '1px solid rgba(0,100,210,0.12)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm mb-0.5" style={{ color: textPrimary }}>Skills ready? Find tech jobs!</p>
                  <p className="text-xs" style={{ color: textMuted }}>AI-matched roles with real apply links</p>
                </div>
                <Link href="/"><button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.22)', color: '#00d4ff' }}>
                  Search Jobs <ChevronRight size={12} />
                </button></Link>
              </div>
            </div>
          </div>
        )}

        {hasSearched && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: textDim }}>No courses found. Try a different interest or filter.</p>
          </div>
        )}

        {!hasSearched && !terminalActive && !terminalDone && (
          <div className="text-center py-10">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5 float-anim" style={{ background: 'rgba(48,209,88,0.05)', border: '1px solid rgba(48,209,88,0.15)' }}>
              <BookOpen size={34} style={{ color: '#30d158', opacity: 0.4 }} />
            </div>
            <p className="text-sm" style={{ color: textDim }}>Pick an interest above to discover AI-curated courses</p>
            <p className="text-xs mt-1 font-mono" style={{ color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,15,30,0.2)' }}>Free: freeCodeCamp, YouTube, NPTEL · Paid: Udemy, Coursera, Scaler</p>
          </div>
        )}
      </div>
    </div>
  );
}
