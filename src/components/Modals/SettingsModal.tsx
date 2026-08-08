import React, { useState } from 'react';
import { sound } from '../../services/audio';
import { Settings, Volume2, VolumeX, Globe, Palette, Copy, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'danger' | 'warning') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  showToast
}) => {
  const [bgmVol, setBgmVol] = useState(0.4);
  const [sfxVol, setSfxVol] = useState(0.6);
  const [isMutedBgm, setIsMutedBgm] = useState(false);
  const [isMutedSfx, setIsMutedSfx] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'hacker'>('dark');

  if (!isOpen) return null;

  const handleBgmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setBgmVol(val);
    sound.setVolumes(val, sfxVol);
  };

  const handleSfxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    sound.setVolumes(bgmVol, val);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value as 'dark' | 'light' | 'hacker';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
  };

  const handleCopyStk = () => {
    sound.playSFX('click');
    navigator.clipboard.writeText("1208856666");
    showToast("Đã sao chép số tài khoản BIDV!", "success");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121218] border border-amber-500 rounded-2xl p-5 max-w-sm w-full text-left space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-serif font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Settings className="w-4 h-4" />
            <span>CÀI ĐẶT HỆ THỐNG</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* BGM Volume */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>🎵 NHẠC NỀN (BGM)</span>
            <button
              onClick={() => setIsMutedBgm(sound.toggleMuteBgm())}
              className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-400"
            >
              {isMutedBgm ? "Bật BGM" : "Tắt BGM"}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={bgmVol}
            onChange={handleBgmChange}
            className="w-full accent-amber-500"
          />
        </div>

        {/* SFX Volume */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>🔊 HIỆU ỨNG ÂM THANH (SFX)</span>
            <button
              onClick={() => setIsMutedSfx(sound.toggleMuteSfx())}
              className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-400"
            >
              {isMutedSfx ? "Bật SFX" : "Tắt SFX"}
            </button>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={sfxVol}
            onChange={handleSfxChange}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Theme Selector */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            🎨 THEME GIAO DIỆN
          </label>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="w-full bg-[#050507] border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
          >
            <option value="dark">Theme Tối Gothic (Mặc định)</option>
            <option value="light">Theme Sáng Dịu</option>
            <option value="hacker">Theme Hacker Ma Trận</option>
          </select>
        </div>

        {/* Donate Developer Box */}
        <div className="bg-[#050507] border border-dashed border-amber-500/60 rounded-xl p-3 text-center space-y-2">
          <p className="text-xs font-serif font-bold text-amber-400">
            ✨ Ủng Hộ Nhà Phát Triển ✨
          </p>
          <div className="text-[11px] font-bold text-slate-300">
            BIDV - Thai Thanh Nguyen
          </div>
          <div className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-amber-300 bg-[#121218] py-1.5 px-3 rounded-lg border border-slate-800">
            <span>1208856666</span>
            <button
              onClick={handleCopyStk}
              className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-sans font-bold hover:bg-amber-400 transition"
            >
              Sao chép
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
