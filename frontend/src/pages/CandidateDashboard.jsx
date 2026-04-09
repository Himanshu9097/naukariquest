import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, CheckCircle, Clock, MapPin, Target, FileText,
  Loader2, BarChart3, Award, Calendar, ExternalLink, BookOpen, Send,
  TrendingUp, Video, AlertCircle, ShieldAlert, LogIn,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/lib/theme';

const STATUS_COLORS = {
  applied:     { bg: 'rgba(0,212,255,0.1)',   color: '#00d4ff',  label: 'Applied',     icon: Send },
  shortlisted: { bg: 'rgba(191,90,242,0.1)',  color: '#bf5af2',  label: 'Shortlisted', icon: Award },
  interview:   { bg: 'rgba(255,214,10,0.1)',  color: '#ffd60a',  label: 'Interview',   icon: Video },
  exam:        { bg: 'rgba(48,209,88,0.1)',   color: '#30d158',  label: 'Exam',        icon: FileText },
  hired:       { bg: 'rgba(48,209,88,0.15)',  color: '#30d158',  label: 'Hired ✓',     icon: CheckCircle },
  rejected:    { bg: 'rgba(255,55,95,0.1)',   color: '#ff375f',  label: 'Rejected',    icon: AlertCircle },
};

function StatCard({ icon: Icon, label, value, color, isDark, subtitle }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value ?? '—'}</div>
      <div className="text-[11px] font-semibold mt-1 opacity-50">{label}</div>
      {subtitle && <div className="text-[10px] mt-0.5 opacity-35">{subtitle}</div>}
    </div>
  );
}

export default function CandidateDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [, setLocation] = useLocation();

  // ── Role Guard ─────────────────────────────────────────────────────────────
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;
  const userId   = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo') : 'demo';

  const [stats, setStats] = useState({});
  const [applications, setApplications] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const T  = isDark ? '#fff' : '#0a0f1e';
  const TM = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(10,15,30,0.45)';
  const SB = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const SBR= isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  // ── Block non-candidate users ──────────────────────────────────────────────
  if (userRole === 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#000' : '#f0f4f8' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.2)' }}>
            <ShieldAlert size={36} className="text-[#ff375f]" />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: T }}>Access Restricted</h1>
          <p className="text-sm mb-6" style={{ color: TM }}>
            This dashboard is for <span className="text-[#00d4ff] font-bold">Candidates</span> only.
            You are logged in as a Company/Recruiter account.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/recruiter">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#bf5af2]">
                Go to Recruiter Dashboard
              </button>
            </Link>
            <Link href="/login">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold" style={{ border: `1px solid ${SBR}`, color: TM }}>
                <LogIn size={14} /> Switch Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#000' : '#f0f4f8' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
            <LogIn size={36} className="text-[#00d4ff]" />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: T }}>Login Required</h1>
          <p className="text-sm mb-6" style={{ color: TM }}>
            Please sign in as a <span className="text-[#00d4ff] font-bold">Candidate</span> to access your dashboard.
          </p>
          <Link href="/login">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#00d4ff] mx-auto">
              <LogIn size={14} /> Login / Sign Up
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const candidateId = userId;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, aRes, scRes] = await Promise.all([
        fetch(`/api/dashboard/candidate/${candidateId}/stats`),
        fetch(`/api/dashboard/candidate/${candidateId}/applications`),
        fetch('/api/dashboard/candidate/schedules'),
      ]);
      setStats(await sRes.json());
      setApplications(await aRes.json());
      setSchedules(await scRes.json());
    } catch {}
    finally { setLoading(false); }
  }, [candidateId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#000' : '#f0f4f8' }}>
      <Loader2 className="w-10 h-10 animate-spin text-[#00d4ff]" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#000' : '#f0f4f8' }}>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black" style={{ color: T }}>Candidate <span className="text-[#00d4ff]">Dashboard</span></h1>
          <p className="text-sm mt-1" style={{ color: TM }}>Track applications, upcoming interviews, and your career progress</p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'apps', label: 'My Applications', icon: Briefcase },
            { key: 'schedule', label: 'Upcoming', icon: Calendar },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
              style={{ background: tab === t.key ? '#00d4ff' : SB, color: tab === t.key ? '#000' : TM, border: `1px solid ${tab === t.key ? '#00d4ff' : SBR}` }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ─────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard icon={Send}        label="Applications" value={stats.totalApps ?? 0} color="#00d4ff" isDark={isDark} />
              <StatCard icon={Award}        label="Shortlisted"  value={stats.shortlisted ?? 0} color="#bf5af2" isDark={isDark} />
              <StatCard icon={Video}        label="Interviews"   value={stats.interviews ?? 0} color="#ffd60a" isDark={isDark} />
              <StatCard icon={CheckCircle}  label="Hired"        value={stats.hired ?? 0} color="#30d158" isDark={isDark} />
              <StatCard icon={FileText}     label="Resumes Scanned" value={stats.analysisCount ?? 0} color="#bf5af2" isDark={isDark} />
              <StatCard icon={Target}       label="Last ATS Score" value={stats.latestAtsScore ?? '—'} color={
                (stats.latestAtsScore ?? 0) >= 80 ? '#30d158' : (stats.latestAtsScore ?? 0) >= 60 ? '#ffd60a' : '#ff375f'
              } isDark={isDark} subtitle="/100" />
            </div>

            {/* Quick Actions */}
            <div className="rounded-2xl p-6" style={{ background: SB, border: `1px solid ${SBR}` }}>
              <h3 className="text-sm font-black mb-4" style={{ color: T }}>Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { href: '/resume-match', label: 'Scan Resume', desc: 'Get your ATS score', icon: Target, color: '#bf5af2' },
                  { href: '/', label: 'Search Jobs', desc: 'Find matching jobs', icon: Briefcase, color: '#00d4ff' },
                  { href: '/courses', label: 'Learn Skills', desc: 'Free & paid courses', icon: BookOpen, color: '#30d158' },
                ].map(a => (
                  <Link key={a.href} href={a.href}>
                    <div className="flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]"
                      style={{ background: `${a.color}08`, border: `1px solid ${a.color}20` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${a.color}15` }}>
                        <a.icon size={18} style={{ color: a.color }} />
                      </div>
                      <div>
                        <p className="text-xs font-black" style={{ color: T }}>{a.label}</p>
                        <p className="text-[10px]" style={{ color: TM }}>{a.desc}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MY APPLICATIONS ──────────────────────────────────────── */}
        {tab === 'apps' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black mb-2" style={{ color: T }}>My Applications</h2>
            {applications.length > 0 ? applications.map(app => {
              const sc = STATUS_COLORS[app.status] || STATUS_COLORS.applied;
              const Icon = sc.icon;
              return (
                <div key={app._id} className="p-4 rounded-xl" style={{ background: SB, border: `1px solid ${SBR}` }}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: sc.bg }}>
                      <Icon size={18} style={{ color: sc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold" style={{ color: T }}>{app.jobId?.title || 'Job Role'}</p>
                      <p className="text-xs mt-0.5" style={{ color: TM }}>
                        {app.jobId?.company} {app.jobId?.location && `• ${app.jobId.location}`}
                        {app.jobId?.salary && ` • ${app.jobId.salary}`}
                      </p>
                      <p className="text-[10px] mt-1" style={{ color: TM }}>Applied {new Date(app.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className="text-[10px] px-3 py-1.5 rounded-full font-black shrink-0" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-16 rounded-2xl" style={{ background: SB, border: `1px solid ${SBR}` }}>
                <Briefcase size={32} className="mx-auto mb-3 opacity-20" style={{ color: T }} />
                <p className="text-sm font-bold" style={{ color: TM }}>You haven't applied to any jobs yet.</p>
                <Link href="/">
                  <button className="mt-4 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00d4ff]">Browse Jobs →</button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── UPCOMING SCHEDULES ──────────────────────────────────── */}
        {tab === 'schedule' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black mb-2" style={{ color: T }}>Upcoming Interviews & Exams</h2>
            {schedules.length > 0 ? schedules.map(s => (
              <div key={s._id} className="p-4 rounded-xl" style={{ background: SB, border: `1px solid ${SBR}` }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: s.type === 'interview' ? 'rgba(255,214,10,0.1)' : 'rgba(0,212,255,0.1)' }}>
                    {s.type === 'interview' ? <Video size={18} style={{ color: '#ffd60a' }} /> : <FileText size={18} style={{ color: '#00d4ff' }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                        style={{ background: s.type === 'interview' ? 'rgba(255,214,10,0.1)' : 'rgba(0,212,255,0.1)', color: s.type === 'interview' ? '#ffd60a' : '#00d4ff' }}>
                        {s.type === 'interview' ? '🎥 Interview' : '📝 Exam'}
                      </span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: T }}>{s.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: TM }}>
                      {s.jobId?.title} at {s.jobId?.company} • {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} {s.time}
                    </p>
                    {s.description && <p className="text-[11px] mt-1" style={{ color: TM }}>{s.description}</p>}
                  </div>
                  {s.link && (
                    <a href={s.link} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00d4ff] shrink-0">
                      <ExternalLink size={12} /> Join
                    </a>
                  )}
                </div>
              </div>
            )) : (
              <div className="text-center py-16 rounded-2xl" style={{ background: SB, border: `1px solid ${SBR}` }}>
                <Calendar size={32} className="mx-auto mb-3 opacity-20" style={{ color: T }} />
                <p className="text-sm font-bold" style={{ color: TM }}>No upcoming interviews or exams.</p>
                <p className="text-[11px] mt-1" style={{ color: TM }}>Once a recruiter schedules one, it will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
