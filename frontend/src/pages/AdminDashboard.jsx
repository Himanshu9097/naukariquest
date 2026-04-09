import { useState, useRef } from 'react';
import { useTheme } from '@/lib/theme';
import { Upload, User, Briefcase, Code2, Save, FileText, CheckCircle, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState('candidate');
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : 'candidate';

  // Candidate State
  const [file, setFile] = useState(null);
  const [extracting, setExtracting] = useState(false);
  const [savingCandidate, setSavingCandidate] = useState(false);
  const [candidateForm, setCandidateForm] = useState({
    name: '', email: '', phone: '', title: '', experience: '', skills: '', summary: '', linkedin: '', github: '', ats_score: 0
  });
  const fileInputRef = useRef(null);

  // Job State
  const [savingJob, setSavingJob] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '', company: '', location: '', salary: '', skills: '', experience: '', type: 'Full-time', description: '', apply_link: ''
  });

  const textPrimary = isDark ? '#ffffff' : '#0a0f1e';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(10,15,30,0.5)';
  const surfaceBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.85)';
  const surfaceBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setExtracting(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/resume/extract', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.text) {
        // Now analyze it using the same API used for matching
        const anRes = await fetch('/api/resume/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.text })
        });
        const anData = await anRes.json();
        
        // Auto fill form
        setCandidateForm({
          name: anData.name || '',
          email: anData.email || '',
          phone: anData.phone || '',
          title: anData.title || '',
          experience: anData.experience || '',
          skills: anData.skills ? anData.skills.join(', ') : '',
          summary: anData.summary || '',
          linkedin: anData.linkedin || '',
          github: anData.github || '',
          ats_score: anData.ats_score || 0
        });
      }
    } catch (error) {
      console.error('Error extracting resume', error);
      alert('Failed to parse resume');
    } finally {
      setExtracting(false);
    }
  };

  const saveCandidate = async () => {
    setSavingCandidate(true);
    try {
      const formattedSkills = candidateForm.skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await fetch('/api/admin/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...candidateForm, skills: formattedSkills }),
      });
      if (res.ok) {
        alert('Candidate saved successfully!');
        setCandidateForm({ name: '', email: '', phone: '', title: '', experience: '', skills: '', summary: '', linkedin: '', github: '', ats_score: 0 });
        setFile(null);
      }
    } catch (e) {
      console.error(e);
      alert('Error saving candidate');
    } finally {
      setSavingCandidate(false);
    }
  };

  const saveJob = async () => {
    setSavingJob(true);
    try {
      const formattedSkills = jobForm.skills.split(',').map(s => s.trim()).filter(s => s);
      const res = await fetch('/api/admin/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...jobForm, skills: formattedSkills }),
      });
      if (res.ok) {
        alert('Job posted successfully!');
        setJobForm({ title: '', company: '', location: '', salary: '', skills: '', experience: '', type: 'Full-time', description: '', apply_link: '' });
      }
    } catch (e) {
      console.error(e);
      alert('Error saving job');
    } finally {
      setSavingJob(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: isDark ? '#000000' : '#f0f4f8' }}>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-black mb-8" style={{ color: textPrimary }}>Admin Dashboard</h1>

        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('candidate')} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'candidate' ? 'bg-[#00d4ff] text-black' : 'text-gray-500'}`}>Candidate Profiling</button>
          {userRole === 'company' && (
            <button onClick={() => setActiveTab('job')} className={`px-4 py-2 rounded-xl text-sm font-bold ${activeTab === 'job' ? 'bg-[#bf5af2] text-white' : 'text-gray-500'}`}>Post Job</button>
          )}
        </div>

        {activeTab === 'candidate' && (
          <div className="rounded-2xl p-6" style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}` }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: textPrimary }}>Candidate Profile Auto-Fill</h2>
            <div className="mb-6">
              <div onClick={() => fileInputRef.current?.click()} className="h-32 flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all hover:bg-white/5" style={{ borderColor: surfaceBorder }}>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx" />
                {extracting ? <Loader2 size={24} className="animate-spin text-[#00d4ff]" /> : <Upload size={24} style={{ color: textMuted }} />}
                <p className="text-xs mt-2" style={{ color: textMuted }}>{file ? file.name : 'Click to upload resume (Auto-fills below)'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={candidateForm.name} onChange={e => setCandidateForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
              <input value={candidateForm.email} onChange={e => setCandidateForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
              <input value={candidateForm.phone} onChange={e => setCandidateForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
              <input value={candidateForm.title} onChange={e => setCandidateForm(f => ({ ...f, title: e.target.value }))} placeholder="Current Title" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
              <input value={candidateForm.experience} onChange={e => setCandidateForm(f => ({ ...f, experience: e.target.value }))} placeholder="Experience (e.g. 4 years)" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
              <input value={candidateForm.skills} onChange={e => setCandidateForm(f => ({ ...f, skills: e.target.value }))} placeholder="Skills (comma separated)" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
            </div>
            <div className="mt-4">
              <textarea value={candidateForm.summary} onChange={e => setCandidateForm(f => ({ ...f, summary: e.target.value }))} placeholder="Summary" className="w-full h-24 text-sm px-4 py-3 rounded-xl outline-none bg-transparent resize-none" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
            </div>

            <button onClick={saveCandidate} disabled={savingCandidate} className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-[#00d4ff] text-black">
              {savingCandidate ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Candidate Profile
            </button>
          </div>
        )}

        {activeTab === 'job' && (
          <div className="rounded-2xl p-6" style={{ background: surfaceBg, border: `1px solid ${surfaceBorder}` }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: textPrimary }}>Post a New Job</h2>
            <div className="grid grid-cols-1 gap-4">
              <input value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} placeholder="Job Title" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
              <div className="grid grid-cols-2 gap-4">
                <input value={jobForm.company} onChange={e => setJobForm(f => ({ ...f, company: e.target.value }))} placeholder="Company Name" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
                <input value={jobForm.location} onChange={e => setJobForm(f => ({ ...f, location: e.target.value }))} placeholder="Location" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input value={jobForm.salary} onChange={e => setJobForm(f => ({ ...f, salary: e.target.value }))} placeholder="Salary (e.g. ₹15-25 LPA)" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
                <input value={jobForm.experience} onChange={e => setJobForm(f => ({ ...f, experience: e.target.value }))} placeholder="Experience (e.g. 2-5 yrs)" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
                <select value={jobForm.type} onChange={e => setJobForm(f => ({ ...f, type: e.target.value }))} className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }}>
                  <option value="Full-time">Full-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <input value={jobForm.skills} onChange={e => setJobForm(f => ({ ...f, skills: e.target.value }))} placeholder="Skills (comma separated)" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
              <input value={jobForm.apply_link} onChange={e => setJobForm(f => ({ ...f, apply_link: e.target.value }))} placeholder="Apply Link" className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-transparent" style={{ border: `1px solid ${surfaceBorder}`, color: textPrimary }} />
            </div>
            <button onClick={saveJob} disabled={savingJob} className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold bg-[#bf5af2] text-white">
              {savingJob ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Post Job
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
