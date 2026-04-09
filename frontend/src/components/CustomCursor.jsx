import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const glowRef = useRef(null);
  const dotRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      if (dotRef.current) { dotRef.current.style.left = `${e.clientX - 3}px`; dotRef.current.style.top = `${e.clientY - 3}px`; }
      if (glowRef.current) { glowRef.current.style.left = `${e.clientX - 10}px`; glowRef.current.style.top = `${e.clientY - 10}px`; }
    };
    const handleOver = (e) => {
      const target = e.target;
      const isInteractive = target.tagName === 'BUTTON' || target.tagName === 'A' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.closest('button') || target.closest('a');
      if (glowRef.current) {
        if (isInteractive) { glowRef.current.style.width = '35px'; glowRef.current.style.height = '35px'; glowRef.current.style.marginLeft = '-7px'; glowRef.current.style.marginTop = '-7px'; }
        else { glowRef.current.style.width = '20px'; glowRef.current.style.height = '20px'; glowRef.current.style.marginLeft = '0'; glowRef.current.style.marginTop = '0'; }
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseover', handleOver);
    return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseover', handleOver); };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" />
      <div ref={dotRef} className="cursor-dot" />
    </>
  );
}
