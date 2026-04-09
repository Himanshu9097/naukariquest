import { useState, useEffect, useCallback } from 'react';
import {
  Briefcase, Users, Calendar, Plus, Trash2, Edit3, X, Check,
  Clock, MapPin, DollarSign, ChevronDown, ChevronUp, Loader2,
  BarChart3, Award, ClipboardList, Video, FileText, Save, AlertCircle,
  ShieldAlert, LogIn,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useTheme } from '@/lib/theme';

const TABS = [
  { key: 'overview', label: 'Overview',      icon: BarChart3 },
  { key: 'jobs',     label: 'Manage Jobs',   icon: Briefcase },
  { key: 'apps',     label: 'Applications',  icon: ClipboardList },
  { key: 'schedule', label: 'Schedule',       icon: Calendar },
];

const STATUS_COLORS = {
  applied:     { bg: 'rgba(0,212,255,0.1)',   color: '#00d4ff',  label: 'Applied' },
  shortlisted: { bg: 'rgba(191,90,242,0.1)',  color: '#bf5af2',  label: 'Shortlisted' },
  interview:   { bg: 'rgba(255,214,10,0.1)',  color: '#ffd60a',  label: 'Interview' },
  exam:        { bg: 'rgba(48,209,88,0.1)',   color: '#30d158',  label: 'Exam' },
  hired:       { bg: 'rgba(48,209,88,0.15)',  color: '#30d158',  label: 'Hired' },
  rejected:    { bg: 'rgba(255,55,95,0.1)',   color: '#ff375f',  label: 'Rejected' },
};

function StatCard({ icon: Icon, label, value, color, isDark }) {
  return (
    <div className="p-5 rounded-2xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#fff', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}` }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        <span className="text-xs font-semibold opacity-50">{label}</span>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
    </div>
  );
}

export default function RecruiterDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [, setLocation] = useLocation();

  // ── Role Guard ─────────────────────────────────────────────────────────────
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') : null;

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', company: '', location: '', salary: '', experience: '', type: 'Full-time', skills: '', description: '', apply_link: '' });
  const [scheduleForm, setScheduleForm] = useState({ type: 'interview', title: '', description: '', date: '', time: '', location: '', link: '', jobId: '' });

  const T  = isDark ? '#fff' : '#0a0f1e';
  const TM = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(10,15,30,0.45)';
  const SB = isDark ? 'rgba(255,255,255,0.03)' : '#fff';
  const SBR= isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';

  // ── Block non-company users ────────────────────────────────────────────────
  if (userRole !== 'company') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#000' : '#f0f4f8' }}>
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255,55,95,0.1)', border: '1px solid rgba(255,55,95,0.2)' }}>
            <ShieldAlert size={36} className="text-[#ff375f]" />
          </div>
          <h1 className="text-2xl font-black mb-2" style={{ color: T }}>Access Restricted</h1>
          <p className="text-sm mb-6" style={{ color: TM }}>
            This dashboard is only available for <span className="text-[#bf5af2] font-bold">Recruiter / Company</span> accounts.
            {userRole ? ` You are logged in as "${userRole}".` : ' Please login first.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#bf5af2]">
                <LogIn size={14} /> {userRole ? 'Switch Account' : 'Login as Recruiter'}
              </button>
            </Link>
            {userRole === 'candidate' && (
              <Link href="/candidate">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold" style={{ border: `1px solid ${SBR}`, color: TM }}>
                  Go to My Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, jRes, aRes, scRes] = await Promise.all([
        fetch('/api/dashboard/recruiter/stats'), fetch('/api/dashboard/recruiter/jobs'),
        fetch('/api/dashboard/recruiter/applications'), fetch('/api/dashboard/recruiter/schedules'),
      ]);
      setStats(await sRes.json()); setJobs(await jRes.json());
      setApps(await aRes.json()); setSchedules(await scRes.json());
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const submitJob = async () => {
    const body = { ...jobForm, skills: jobForm.skills.split(',').map(s => s.trim()).filter(Boolean) };
    const url = editJob ? `/api/dashboard/recruiter/jobs/${editJob._id}` : '/api/dashboard/recruiter/jobs';
    await fetch(url, { method: editJob ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setShowJobForm(false); setEditJob(null);
    setJobForm({ title: '', company: '', location: '', salary: '', experience: '', type: 'Full-time', skills: '', description: '', apply_link: '' });
    fetchAll();
  };

  const deleteJob = async (id) => {
    await fetch(`/api/dashboard/recruiter/jobs/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const updateAppStatus = async (id, status) => {
    await fetch(`/api/dashboard/recruiter/applications/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    fetchAll();
  };

  const submitSchedule = async () => {
    await fetch('/api/dashboard/recruiter/schedules', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(scheduleForm) });
    setShowScheduleForm(false);
    setScheduleForm({ type: 'interview', title: '', description: '', date: '', time: '', location: '', link: '', jobId: '' });
    fetchAll();
  };

  const deleteSchedule = async (id) => {
    await fetch(`/api/dashboard/recruiter/schedules/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const inputStyle = { background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', border: `1.5px solid ${SBR}`, color: T };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: isDark ? '#000' : '#f0f4f8' }}>
      <Loader2 className="w-10 h-10 animate-spin text-[#bf5af2]" />
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#000' : '#f0f4f8' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black" style={{ color: T }}>Recruiter <span className="text-[#bf5af2]">Dashboard</span></h1>
          <p className="text-sm mt-1" style={{ color: TM }}>Manage jobs, review applications, schedule interviews & exams</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all"
              style={{ background: tab === t.key ? '#bf5af2' : SB, color: tab === t.key ? '#fff' : TM, border: `1px solid ${tab === t.key ? '#bf5af2' : SBR}` }}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ────────────────────────────────────────────────── */}
        {tab === 'overview' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={Briefcase} label="Total Jobs" value={stats.totalJobs ?? 0} color="#00d4ff" isDark={isDark} />
            <StatCard icon={ClipboardList} label="Applications" value={stats.totalApps ?? 0} color="#bf5af2" isDark={isDark} />
            <StatCard icon={Award} label="Shortlisted" value={stats.shortlisted ?? 0} color="#ffd60a" isDark={isDark} />
            <StatCard icon={Video} label="Interviews" value={stats.interviews ?? 0} color="#30d158" isDark={isDark} />
            <StatCard icon={FileText} label="Exams" value={stats.exams ?? 0} color="#00d4ff" isDark={isDark} />
            <StatCard icon={Check} label="Hired" value={stats.hired ?? 0} color="#30d158" isDark={isDark} />
          </div>
        )}

        {/* ── MANAGE JOBS ─────────────────────────────────────────────── */}
        {tab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black" style={{ color: T }}>Posted Jobs</h2>
              <button onClick={() => { setShowJobForm(true); setEditJob(null); setJobForm({ title: '', company: '', location: '', salary: '', experience: '', type: 'Full-time', skills: '', description: '', apply_link: '' }); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#bf5af2]">
                <Plus size={14} /> Post New Job
              </button>
            </div>

            {/* Job Form Modal */}
            {showJobForm && (
              <div className="rounded-2xl p-6 space-y-3" style={{ background: SB, border: `1px solid ${SBR}` }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-black" style={{ color: T }}>{editJob ? 'Edit Job' : 'Create New Job'}</h3>
                  <button onClick={() => setShowJobForm(false)}><X size={16} style={{ color: TM }} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'title', ph: 'Job Title *' }, { key: 'company', ph: 'Company Name *' },
                    { key: 'location', ph: 'Location (e.g. Bangalore, India) *' }, { key: 'salary', ph: 'Salary (e.g. ₹12LPA-18LPA)' },
                    { key: 'experience', ph: 'Experience (e.g. 2-4 years)' }, { key: 'type', ph: 'Type (Full-time / Part-time / Remote)' },
                    { key: 'skills', ph: 'Skills (comma separated)' }, { key: 'apply_link', ph: 'Apply Link (optional)' },
                  ].map(f => (
                    <input key={f.key} value={jobForm[f.key]} onChange={e => setJobForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph} className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
                  ))}
                </div>
                <textarea value={jobForm.description} onChange={e => setJobForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Job Description..." rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
                <button onClick={submitJob} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#bf5af2] w-full justify-center">
                  <Save size={14} /> {editJob ? 'Update Job' : 'Post Job'}
                </button>
              </div>
            )}

            {/* Jobs List */}
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job._id} className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
                  style={{ background: SB, border: `1px solid ${SBR}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: T }}>{job.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: TM }}>{job.company} • {job.location} {job.salary && `• ${job.salary}`}</p>
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {job.skills.slice(0, 5).map(s => <span key={s} className="text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(191,90,242,0.1)', color: '#bf5af2' }}>{s}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => { setEditJob(job); setJobForm({ ...job, skills: (job.skills || []).join(', ') }); setShowJobForm(true); }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.1)' }}>
                      <Edit3 size={13} style={{ color: '#00d4ff' }} />
                    </button>
                    <button onClick={() => deleteJob(job._id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,55,95,0.1)' }}>
                      <Trash2 size={13} style={{ color: '#ff375f' }} />
                    </button>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && <p className="text-center text-sm py-12" style={{ color: TM }}>No jobs posted yet. Click "Post New Job" above.</p>}
            </div>
          </div>
        )}

        {/* ── APPLICATIONS ────────────────────────────────────────────── */}
        {tab === 'apps' && (
          <div className="space-y-3">
            <h2 className="text-lg font-black mb-2" style={{ color: T }}>All Applications</h2>
            {apps.map(app => {
              const sc = STATUS_COLORS[app.status] || STATUS_COLORS.applied;
              return (
                <div key={app._id} className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3"
                  style={{ background: SB, border: `1px solid ${SBR}` }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: T }}>{app.candidateId?.name || 'Candidate'}</p>
                    <p className="text-xs mt-0.5" style={{ color: TM }}>{app.candidateId?.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: TM }}>Applied for: <span className="font-bold">{app.jobId?.title || 'Job'}</span> at {app.jobId?.company}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] px-3 py-1 rounded-full font-black" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                    <select value={app.status} onChange={e => updateAppStatus(app._id, e.target.value)}
                      className="text-[10px] px-2 py-1 rounded-lg outline-none font-bold" style={{ ...inputStyle, fontSize: '10px' }}>
                      {Object.entries(STATUS_COLORS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
            {apps.length === 0 && <p className="text-center text-sm py-12" style={{ color: TM }}>No applications received yet.</p>}
          </div>
        )}

        {/* ── SCHEDULE ────────────────────────────────────────────────── */}
        {tab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black" style={{ color: T }}>Interviews & Exams</h2>
              <button onClick={() => setShowScheduleForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#30d158]">
                <Plus size={14} /> Schedule New
              </button>
            </div>

            {showScheduleForm && (
              <div className="rounded-2xl p-6 space-y-3" style={{ background: SB, border: `1px solid ${SBR}` }}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-black" style={{ color: T }}>Schedule Interview / Exam</h3>
                  <button onClick={() => setShowScheduleForm(false)}><X size={16} style={{ color: TM }} /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select value={scheduleForm.type} onChange={e => setScheduleForm(p => ({ ...p, type: e.target.value }))}
                    className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle}>
                    <option value="interview">🎥 Interview</option>
                    <option value="exam">📝 Exam</option>
                  </select>
                  <select value={scheduleForm.jobId} onChange={e => setScheduleForm(p => ({ ...p, jobId: e.target.value }))}
                    className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle}>
                    <option value="">Select Job *</option>
                    {jobs.map(j => <option key={j._id} value={j._id}>{j.title} - {j.company}</option>)}
                  </select>
                  <input value={scheduleForm.title} onChange={e => setScheduleForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Title (e.g. Round 1 Technical)" className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
                  <input type="date" value={scheduleForm.date} onChange={e => setScheduleForm(p => ({ ...p, date: e.target.value }))}
                    className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
                  <input value={scheduleForm.time} onChange={e => setScheduleForm(p => ({ ...p, time: e.target.value }))}
                    placeholder="Time (e.g. 10:00 AM IST)" className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
                  <input value={scheduleForm.link} onChange={e => setScheduleForm(p => ({ ...p, link: e.target.value }))}
                    placeholder="Meeting / Exam Link" className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
                  <input value={scheduleForm.location} onChange={e => setScheduleForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="Location (or Online)" className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
                <textarea value={scheduleForm.description} onChange={e => setScheduleForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Details / Instructions..." rows={2} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none" style={inputStyle} />
                <button onClick={submitSchedule} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#30d158] w-full justify-center">
                  <Calendar size={14} /> Create Schedule
                </button>
              </div>
            )}

            <div className="space-y-3">
              {schedules.map(s => (
                <div key={s._id} className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
                  style={{ background: SB, border: `1px solid ${SBR}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-black"
                        style={{ background: s.type === 'interview' ? 'rgba(255,214,10,0.1)' : 'rgba(0,212,255,0.1)', color: s.type === 'interview' ? '#ffd60a' : '#00d4ff' }}>
                        {s.type === 'interview' ? '🎥 Interview' : '📝 Exam'}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(48,209,88,0.1)', color: '#30d158' }}>{s.status}</span>
                    </div>
                    <p className="text-sm font-bold" style={{ color: T }}>{s.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: TM }}>
                      {s.jobId?.title} • {new Date(s.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} at {s.time}
                    </p>
                    {s.link && <a href={s.link} target="_blank" rel="noreferrer" className="text-[11px] text-[#00d4ff] underline mt-0.5 inline-block">Join Link →</a>}
                  </div>
                  <button onClick={() => deleteSchedule(s._id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,55,95,0.1)' }}>
                    <Trash2 size={13} style={{ color: '#ff375f' }} />
                  </button>
                </div>
              ))}
              {schedules.length === 0 && <p className="text-center text-sm py-12" style={{ color: TM }}>No interviews or exams scheduled yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
