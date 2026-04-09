import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Minimize2, Bot, Mic, MicOff, Volume2, VolumeX, Sparkles, MessageCircle } from 'lucide-react';

const QUICK_PROMPTS = [
  'Salary for React dev Bangalore?',
  'Best AI/ML skills for 2025?',
  'How to crack FAANG interviews?',
  'Resume tips for freshers?',
];

const LANGUAGES = [
  { code: 'en-IN', id: 'English', label: 'English' },
  { code: 'hi-IN', id: 'Hindi', label: 'Hindi' },
  { code: 'bn-IN', id: 'Bengali', label: 'Bengali' },
  { code: 'bho-IN', id: 'Bhojpuri', label: 'Bhojpuri' },
  { code: 'te-IN', id: 'Telugu', label: 'Telugu' },
  { code: 'ta-IN', id: 'Tamil', label: 'Tamil' },
  { code: 'mr-IN', id: 'Marathi', label: 'Marathi' },
];

function renderMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#00d4ff">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^• /gm, '<span style="color:#30d158">▸</span> ')
    .replace(/^- /gm, '<span style="color:#30d158">▸</span> ')
    .split('\n')
    .map((line) => `<p style="margin:2px 0">${line || ''}</p>`)
    .join('');
}

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your **AI Career Coach** powered by Meta Llama.\n\nAsk me about salaries, career paths, skills, interview tips, or anything about India's tech market!",
      ts: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [listening, setListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, [messages, open]);

  const speak = useCallback((text) => {
    if (!voiceOutput) return;
    const cleaned = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/[#•▸]/g, '').slice(0, 300);
    const utt = new SpeechSynthesisUtterance(cleaned);
    utt.lang = selectedLang.code;
    utt.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
  }, [voiceOutput]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || streaming) return;

    const userMsg = { role: 'user', content: trimmed, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const aiMsgId = Date.now() + 1;
    setMessages((prev) => [...prev, { role: 'assistant', content: '', ts: aiMsgId, streaming: true }]);

    try {
      abortRef.current = new AbortController();
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language: selectedLang.id }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) throw new Error('API failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.error) throw new Error(data.error);
            if (data.content) {
              fullText += data.content;
              setMessages((prev) => prev.map((m) => m.ts === aiMsgId ? { ...m, content: fullText, streaming: true } : m));
            }
            if (data.done) {
              setMessages((prev) => prev.map((m) => m.ts === aiMsgId ? { ...m, content: fullText, streaming: false } : m));
              speak(fullText);
            }
          } catch { /* skip malformed chunk */ }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMessages((prev) => prev.map((m) => m.ts === aiMsgId
        ? { ...m, content: 'Sorry, I\'m having trouble connecting. Please try again.', streaming: false }
        : m
      ));
    }
    setStreaming(false);
  }, [messages, streaming, speak]);

  const handleVoiceInput = () => {
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { alert('Voice input not supported in this browser.'); return; }
    const rec = new SpeechRec();
    recognitionRef.current = rec;
    rec.lang = selectedLang.code;
    rec.interimResults = false;
    rec.onresult = (event) => { const t = event.results[0][0].transcript; setListening(false); sendMessage(t); };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    rec.start();
    setListening(true);
  };

  return (
    <>
      <button
        data-testid="chatbot-toggle"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center z-50 transition-all duration-300"
        style={{ background: open ? 'rgba(255,55,95,0.9)' : 'linear-gradient(135deg, rgba(0,212,255,0.95), rgba(91,55,242,0.95))', boxShadow: open ? '0 0 25px rgba(255,55,95,0.4)' : '0 0 25px rgba(0,212,255,0.4)' }}
      >
        {open ? <X size={20} color="#fff" /> : <MessageCircle size={20} color="#fff" />}
      </button>

      {open && (
        <div
          data-testid="chatbot-window"
          className="fixed bottom-24 right-6 z-50 rounded-2xl overflow-hidden flex flex-col"
          style={{ width: '340px', border: '1px solid rgba(0,212,255,0.18)', boxShadow: '0 0 50px rgba(0,212,255,0.12), 0 25px 60px rgba(0,0,0,0.6)', maxHeight: '520px', background: 'rgba(4,4,12,0.97)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(91,55,242,0.08))', borderBottom: '1px solid rgba(0,212,255,0.12)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(91,55,242,0.2))', border: '1px solid rgba(0,212,255,0.25)' }}>
                <Bot size={16} style={{ color: '#00d4ff' }} />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-black" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-tight">NaukriQuest AI</p>
                <div className="flex items-center gap-1">
                  <Sparkles size={9} style={{ color: '#bf5af2' }} />
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>AI Career Coach</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <select 
                value={selectedLang.code}
                onChange={(e) => setSelectedLang(LANGUAGES.find(l => l.code === e.target.value))}
                className="text-[10px] bg-transparent outline-none cursor-pointer appearance-none px-1"
                style={{ color: 'rgba(255,255,255,0.7)' }}>
                {LANGUAGES.map(l => <option key={l.code} value={l.code} style={{ color: '#000' }}>{l.label}</option>)}
              </select>
              <button onClick={() => { const next = !voiceOutput; setVoiceOutput(next); if (!next) window.speechSynthesis.cancel(); }} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: voiceOutput ? 'rgba(48,209,88,0.12)' : 'rgba(255,255,255,0.05)' }}>
                {voiceOutput ? <Volume2 size={12} style={{ color: '#30d158' }} /> : <VolumeX size={12} style={{ color: 'rgba(255,255,255,0.35)' }} />}
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Minimize2 size={13} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 0 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.2)' }}>
                    <Bot size={11} style={{ color: '#00d4ff' }} />
                  </div>
                )}
                <div
                  className="max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg, rgba(0,102,255,0.25), rgba(91,55,242,0.2))', border: '1px solid rgba(0,102,255,0.25)', color: 'rgba(255,255,255,0.9)' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.82)' }
                  }
                >
                  {msg.role === 'assistant'
                    ? <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    : msg.content
                  }
                  {msg.streaming && msg.role === 'assistant' && (
                    <span className="inline-block w-1 h-3 ml-0.5 rounded-sm animate-pulse" style={{ background: '#00d4ff' }} />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK_PROMPTS.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} className="text-[10px] px-2 py-1 rounded-lg transition-all" style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.8)' }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 shrink-0" style={{ background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={handleVoiceInput} className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: listening ? 'rgba(255,55,95,0.2)' : 'rgba(0,212,255,0.06)', border: `1px solid ${listening ? 'rgba(255,55,95,0.35)' : 'rgba(0,212,255,0.15)'}` }}>
              {listening ? <MicOff size={13} style={{ color: '#ff375f' }} /> : <Mic size={13} style={{ color: '#00d4ff' }} />}
            </button>
            <input
              data-testid="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={listening ? 'Listening...' : 'Ask about careers, salaries, skills...'}
              disabled={listening}
              className="flex-1 bg-transparent text-xs text-white outline-none"
              style={{ color: 'rgba(255,255,255,0.9)' }}
            />
            <button data-testid="chatbot-send" onClick={() => sendMessage(input)} disabled={streaming || !input.trim()} className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-40" style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.8), rgba(91,55,242,0.8))' }}>
              <Send size={12} style={{ color: '#000' }} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
