import { useEffect, useState } from 'react';
import { LogoutIcon } from './Icons';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      // Small delay to allow DOM to paint before triggering transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      // match transition duration
      const timer = setTimeout(() => setIsRendered(false), 200); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <div
        className={`bg-white/75 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl w-[90%] max-w-md p-6 sm:p-7 transition-all duration-200 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-4">
            <LogoutIcon className="w-6 h-6" />
          </div>
          <h2 id="logout-modal-title" className="text-xl sm:text-2xl font-bold text-[#17352D]">
            Log out?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-500 leading-relaxed">
            Are you sure you want to log out of your Smart Solar account?
          </p>
        </div>
        
        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white/70 border border-slate-200 text-[#17352D] rounded-xl px-5 py-2.5 font-medium hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-[#0B5D43] text-white rounded-xl px-5 py-2.5 font-semibold hover:bg-[#084936] transition-colors flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#0B5D43] focus:ring-offset-2"
          >
            <LogoutIcon className="w-4 h-4" />
            Yes, Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
