import React from 'react';

interface GavelOverlayProps {
  isOpen: boolean;
  verdictText: string;
}

export const GavelOverlay: React.FC<GavelOverlayProps> = ({ isOpen, verdictText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="relative inline-block">
          <div className="text-7xl animate-bounce">🔨</div>
          <div className="text-4xl -mt-4">🧱</div>
        </div>

        <h1 className="font-serif font-black text-2xl sm:text-3xl text-rose-500 uppercase tracking-widest drop-shadow-[0_0_15px_rgba(244,63,94,0.8)]">
          {verdictText || "PHÁN QUYẾT TÒA ÁN"}
        </h1>
      </div>
    </div>
  );
};
