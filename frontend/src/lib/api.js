/* API helpers — all calls go to /api/* which Vite proxies to http://localhost:5000 */

export async function searchJobsFromAPI(query, page = 1, limit = 6) {
  try {
    const res = await fetch(`/api/jobs/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error('API failed');
    return await res.json();
  } catch (error) {
    console.error('API failed:', error);
    return { jobs: [], total: 0, query, page, hasMore: false };
  }
}

export async function searchCoursesFromAPI(interest, type = 'all') {
  try {
    const res = await fetch(`/api/courses/search?interest=${encodeURIComponent(interest)}&type=${type}`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    return data.courses || [];
  } catch {
    return getFallbackCourses(interest);
  }
}



function getFallbackCourses(interest) {
  const q = encodeURIComponent(interest);
  return [
    { title: `Complete ${interest} Bootcamp 2025`, provider: 'Udemy', url: `https://www.udemy.com/courses/search/?q=${q}`, price: '₹1,499', type: 'paid', level: 'Beginner', duration: '45 hours', rating: '4.7/5', students: '450K students', description: `Master ${interest} from scratch with projects.`, skills: [interest, 'Projects', 'Interview Prep'], certificate: true },
    { title: `${interest} Fundamentals`, provider: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn', price: 'Free', type: 'free', level: 'Beginner', duration: '30 hours', rating: '4.8/5', students: '1.2M students', description: `Learn ${interest} for free with interactive exercises.`, skills: [interest, 'Problem Solving'], certificate: true },
    { title: `${interest} Professional Certificate`, provider: 'Coursera', url: `https://www.coursera.org/search?query=${q}`, price: '₹3,200/month', type: 'paid', level: 'Intermediate', duration: '6 months', rating: '4.6/5', students: '89K students', description: `Industry-recognized ${interest} certificate.`, skills: [interest, 'Portfolio'], certificate: true },
    { title: `${interest} Full Course`, provider: 'YouTube', url: `https://www.youtube.com/results?search_query=${q}+course`, price: 'Free', type: 'free', level: 'Beginner', duration: '12 hours', rating: '4.9/5', students: '2.5M views', description: `Complete ${interest} course free on YouTube.`, skills: [interest, 'Examples'], certificate: false },
    { title: `${interest} by Google`, provider: 'Google Developers', url: 'https://developers.google.com/learn/', price: 'Free', type: 'free', level: 'Intermediate', duration: '20 hours', rating: '4.7/5', students: '500K students', description: `Official Google training for ${interest}.`, skills: [interest, 'Google Tools'], certificate: true },
    { title: `${interest} Masters Program`, provider: 'Scaler', url: 'https://www.scaler.com/courses/', price: '₹1.5L total', type: 'paid', level: 'Advanced', duration: '9 months', rating: '4.8/5', students: '12K students', description: `Job-guaranteed ${interest} program with mentorship.`, skills: [interest, 'System Design', 'DSA'], certificate: true },
  ];
}

export function saveJobsToStorage(jobs) {
  try {
    localStorage.setItem('naukriquest_jobs', JSON.stringify(jobs));
    localStorage.setItem('naukriquest_jobs_ts', Date.now().toString());
  } catch { /* ignore */ }
}

export function loadJobsFromStorage() {
  try {
    const raw = localStorage.getItem('naukriquest_jobs');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
