import React, { useEffect, useState } from 'react';

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [isHover, setIsHover] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable custom cursor on devices that support hover
    if (!window.matchMedia('(hover: hover)').matches) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('.cursor-pointer') ||
        target.closest('input') ||
        target.closest('select')
      ) {
        setIsHover(true);
      } else {
        setIsHover(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    let rafId: number;
    const updateRing = () => {
      setRingPos((prev) => ({
        x: prev.x + (pos.x - prev.x) * 0.15,
        y: prev.y + (pos.y - prev.y) * 0.15,
      }));
      rafId = requestAnimationFrame(updateRing);
    };
    rafId = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(rafId);
    };
  }, [pos.x, pos.y]);

  if (!isVisible) return null;

  return (
    <>
      <div
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-[#C9A84C] rounded-full pointer-events-none z-[99999] transition-transform duration-75 ease-out"
        style={{
          transform: `translate3d(${pos.x - 5}px, ${pos.y - 5}px, 0)`,
        }}
      />
      <div
        className={`fixed top-0 left-0 rounded-full border-2 border-[#C9A84C]/60 pointer-events-none z-[99998] transition-all duration-300 ease-out ${
          isHover
            ? 'w-14 h-14 border-[#C9A84C] bg-[#C9A84C]/10'
            : 'w-9 h-9'
        }`}
        style={{
          transform: `translate3d(${ringPos.x - (isHover ? 28 : 18)}px, ${
            ringPos.y - (isHover ? 28 : 18)
          }px, 0)`,
        }}
      />
    </>
  );
}

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'gold';
  title: string;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss?: (id: string) => void;
  onRemoveToast?: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss, onRemoveToast }: ToastContainerProps) {
  const handleRemove = (id: string) => {
    if (onRemoveToast) onRemoveToast(id);
    else if (onDismiss) onDismiss(id);
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-[#1A1A2E]/95 backdrop-blur-md border border-[#C9A84C]/40 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3 transform transition-all duration-300 translate-y-0"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A07830] to-[#C9A84C] text-[#1A1A2E] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
            ✓
          </div>
          <div className="flex-1">
            <div className="font-bold text-sm text-[#E4C675]">{toast.title}</div>
            <div className="text-xs text-white/80 mt-0.5 leading-relaxed">
              {toast.message}
            </div>
          </div>
          <button
            onClick={() => handleRemove(toast.id)}
            className="text-white/40 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
