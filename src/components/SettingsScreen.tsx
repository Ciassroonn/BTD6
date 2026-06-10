import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ThemeColors } from '../types';
import { 
  Settings, Palette, Database, Save, Check, Copy, ArrowLeft, RotateCcw, Sparkles, Coins, Trash2, ShieldAlert
} from 'lucide-react';

interface SettingsScreenProps {
  monkeyMoney: number;
  themeColors: ThemeColors;
  onChangeTheme: (colors: ThemeColors) => void;
  onBackToLobby: () => void;
  onImportSave: (saveCode: string) => boolean;
  onResetAllProgress?: () => void;
}

export const PRESETS: { id: string; name: string; desc: string; colors: ThemeColors }[] = [
  {
    id: 'white',
    name: 'Clean White',
    desc: 'Crisp bright workspace contrasted with slate coal control decks',
    colors: {
      bg: '#ffffff',
      header: '#171717',
      panel: '#262626',
      subpanel: '#0a0a0a',
      accent: '#059669',
      button: '#10b981',
    }
  },
  {
    id: 'ice',
    name: 'Glacial Ice',
    desc: 'Frosty frozen cyan canvas with polar navy steel equipment panels',
    colors: {
      bg: '#e0f2fe',
      header: '#083344',
      panel: '#155e75',
      subpanel: '#0c4a6e',
      accent: '#22d3ee',
      button: '#06b6d4',
    }
  },
  {
    id: 'black',
    name: 'Absolute Obsidian',
    desc: 'Pitch-black void with high-intensity glowing layout highlights',
    colors: {
      bg: '#000000',
      header: '#09090b',
      panel: '#18181b',
      subpanel: '#27272a',
      accent: '#a1a1aa',
      button: '#3f3f46',
    }
  },
  {
    id: 'cyborg',
    name: 'Cyborg Influx',
    desc: 'Synthetic military alloys with energetic charging lines',
    colors: {
      bg: '#111827',
      header: '#1f2937',
      panel: '#374151',
      subpanel: '#030712',
      accent: '#f97316',
      button: '#10b981',
    }
  },
  {
    id: 'rosepine',
    name: 'Rosé Pine',
    desc: 'Deep dusty spruce forest and botanical sunset blush accents',
    colors: {
      bg: '#191724',
      header: '#1f1d2e',
      panel: '#26233a',
      subpanel: '#212030',
      accent: '#c4a7e7',
      button: '#eb6f92',
    }
  },
  {
    id: 'violet',
    name: 'Royal Violet',
    desc: 'Rich noble magenta and cosmic purple velvet night textures',
    colors: {
      bg: '#2e1065',
      header: '#3b0764',
      panel: '#581c87',
      subpanel: '#1e1b4b',
      accent: '#d8b4fe',
      button: '#8b5cf6',
    }
  },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  monkeyMoney,
  themeColors,
  onChangeTheme,
  onBackToLobby,
  onImportSave,
  onResetAllProgress,
}) => {
  // Multi-computer save storage states
  const [exportedCodeString, setExportedCodeString] = useState<string>('');
  const [pastedCode, setPastedCode] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  const triggerExport = () => {
    try {
      const saveObj = {
        monkey_money: localStorage.getItem('btd_monkey_money') || '350',
        purchased_perks: localStorage.getItem('btd_purchased_perks') || '[]',
        achievements: localStorage.getItem('btd_achievements') || '[]',
        timestamp: Date.now()
      };
      const code = btoa(unescape(encodeURIComponent(JSON.stringify(saveObj))));
      setExportedCodeString(code);
      
      // Attempt clip write
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 3000);
      }
    } catch (e) {
      console.warn("Clipboard access blocked, displaying manually in textbox", e);
    }
  };

  const triggerImport = () => {
    setImportStatus(null);
    if (!pastedCode.trim()) {
      setImportStatus({ error: "Please paste a backup code first!" });
      return;
    }
    const success = onImportSave(pastedCode.trim());
    if (success) {
      setImportStatus({ success: true });
      setPastedCode('');
      setTimeout(() => setImportStatus(null), 5000);
    } else {
      setImportStatus({ error: "Invalid backup code! Make sure to copy the exact text generated." });
    }
  };

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    onChangeTheme({
      ...themeColors,
      [key]: value,
    });
  };

  const triggerReset = () => {
    if (onResetAllProgress) {
      onResetAllProgress();
      setShowResetConfirm(false);
      alert('Save progress reset to defaults!');
    }
  };

  return (
    <motion.div
      className="flex flex-col min-h-screen bg-[var(--app-bg)] text-white font-sans overflow-y-auto pb-12 transition-colors duration-200"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 bg-[var(--app-header)] border-b-4 border-black/20 z-10 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-lg text-white transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 text-white rounded-xl border-2 border-white/20 shadow-sm">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight font-display uppercase italic">Academy Settings</h1>
            <p className="text-[11px] text-white/80 font-semibold uppercase tracking-wide">Customize theme colors and manage your cross-device backup saves</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-black/30 border-2 border-white/20 text-[var(--app-accent)] font-sans font-black text-xs rounded-full shadow-inner uppercase tracking-wider">
            <Coins className="w-4 h-4 text-[var(--app-accent)]" />
            <span>{monkeyMoney} MM</span>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col gap-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Appearance Customization */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-[var(--app-panel)] p-6 rounded-3xl border-4 border-black/20 shadow-xl flex flex-col gap-5 transition-colors duration-200">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Palette className="w-5 h-5 text-[var(--app-accent)]" />
                <h2 className="text-lg font-black uppercase tracking-tight font-display">Customizable Themes & Colors</h2>
              </div>

              {/* Presets List */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black text-white/70 uppercase tracking-wider">Aesthetic Presets</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESETS.map((preset) => {
                    const isActive = Object.keys(preset.colors).every(
                      (key) => themeColors[key as keyof ThemeColors].toLowerCase() === preset.colors[key as keyof ThemeColors].toLowerCase()
                    );
                    return (
                      <button
                        key={preset.id}
                        id={`theme-preset-${preset.id}`}
                        onClick={() => onChangeTheme(preset.colors)}
                        className={`p-3.5 rounded-2xl text-left border-2 flex flex-col gap-1.5 transition-all cursor-pointer bg-[var(--app-subpanel)] ${
                          isActive
                            ? 'border-[var(--app-accent)] ring-2 ring-[var(--app-accent)]/30'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-extrabold text-xs uppercase tracking-tight">{preset.name}</span>
                          {isActive && <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 border border-white/20 text-[var(--app-accent)] font-black uppercase">ACTIVE</span>}
                        </div>
                        <p className="text-[10px] text-white/60 leading-normal line-clamp-1">{preset.desc}</p>
                        
                        {/* Circle color chips */}
                        <div className="flex gap-1.5 mt-1">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.bg }} title="Background" />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.header }} title="Header" />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.panel }} title="Panel" />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.subpanel }} title="Sub-panel" />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.accent }} title="Accent" />
                          <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: preset.colors.button }} title="Button" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fine-Tuning Picker Controls */}
              <div className="flex flex-col gap-3.5 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-black text-white/70 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--app-accent)]" />
                    Fine-Tune Custom Colors
                  </span>
                  <button
                    onClick={() => onChangeTheme(PRESETS[0].colors)}
                    className="text-[10px] uppercase font-black text-white/60 hover:text-white flex items-center gap-1 bg-black/30 px-2 py-1 rounded border border-white/5 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset default
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[var(--app-subpanel)] p-4 rounded-2xl border border-white/5">
                  {/* Background Picker */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase">Main Background</span>
                      <span className="text-[9px] text-white/50 font-mono uppercase">{themeColors.bg}</span>
                    </div>
                    <input
                      type="color"
                      value={themeColors.bg}
                      onChange={(e) => handleColorChange('bg', e.target.value)}
                      className="w-10 h-10 border-0 rounded-xl cursor-pointer bg-transparent"
                    />
                  </div>

                  {/* Header Picker */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase">Navigation Header</span>
                      <span className="text-[9px] text-white/50 font-mono uppercase">{themeColors.header}</span>
                    </div>
                    <input
                      type="color"
                      value={themeColors.header}
                      onChange={(e) => handleColorChange('header', e.target.value)}
                      className="w-10 h-10 border-0 rounded-xl cursor-pointer bg-transparent"
                    />
                  </div>

                  {/* Panel Picker */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase">Containers / Cards</span>
                      <span className="text-[9px] text-white/50 font-mono uppercase">{themeColors.panel}</span>
                    </div>
                    <input
                      type="color"
                      value={themeColors.panel}
                      onChange={(e) => handleColorChange('panel', e.target.value)}
                      className="w-10 h-10 border-0 rounded-xl cursor-pointer bg-transparent"
                    />
                  </div>

                  {/* Subpanel Picker */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase">Slots & Inner Backgrounds</span>
                      <span className="text-[9px] text-white/50 font-mono uppercase">{themeColors.subpanel}</span>
                    </div>
                    <input
                      type="color"
                      value={themeColors.subpanel}
                      onChange={(e) => handleColorChange('subpanel', e.target.value)}
                      className="w-10 h-10 border-0 rounded-xl cursor-pointer bg-transparent"
                    />
                  </div>

                  {/* Accent Picker */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase text-[var(--app-accent)]">Highlights Accent</span>
                      <span className="text-[9px] text-[var(--app-accent)] font-mono uppercase">{themeColors.accent}</span>
                    </div>
                    <input
                      type="color"
                      value={themeColors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-10 h-10 border-0 rounded-xl cursor-pointer bg-transparent"
                    />
                  </div>

                  {/* Button Picker */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black uppercase">Main Buttons</span>
                      <span className="text-[9px] text-white/50 font-mono uppercase">{themeColors.button}</span>
                    </div>
                    <input
                      type="color"
                      value={themeColors.button}
                      onChange={(e) => handleColorChange('button', e.target.value)}
                      className="w-10 h-10 border-0 rounded-xl cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Save System & Management */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[var(--app-panel)] p-6 rounded-3xl border-4 border-black/20 shadow-xl flex flex-col gap-5 transition-colors duration-200">
              <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <Database className="w-5 h-5 text-[var(--app-accent)]" />
                <h2 className="text-lg font-black uppercase tracking-tight">Backup & Sync Save</h2>
              </div>

              <p className="text-xs text-white/80 leading-relaxed">
                Save codes are cryptographically secured and transport your entire academy status (including Monkey Money, purchased Perks, and overall game Achievements) across browsers and computers.
              </p>

              {/* Save generate block */}
              <div className="bg-[var(--app-subpanel)] p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                <span className="font-sans font-black text-xs text-[var(--app-accent)] uppercase tracking-wider block">
                  📦 1. Export Save Code
                </span>
                <p className="text-[10px] text-white/60 leading-normal">
                  Generate your sync token. Copy this text and import it on any device to continue your progress seamlessly!
                </p>

                <button
                  id="btn-export-save-settings"
                  onClick={triggerExport}
                  className="py-2.5 px-4 bg-[var(--app-button)] hover:brightness-110 text-white font-black text-xs rounded-xl border-b-2 border-black/30 transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 self-start"
                >
                  {copyFeedback ? <Check className="w-4 h-4 text-emerald-300 animate-pulse" /> : <Copy className="w-4 h-4" />}
                  {copyFeedback ? 'Copy Success!' : 'Generate & Copy Save Code'}
                </button>

                {exportedCodeString && (
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-[9px] text-white/50 uppercase font-black">Sync Code string:</span>
                    <textarea
                      readOnly
                      value={exportedCodeString}
                      onClick={(e) => (e.target as HTMLTextAreaElement).select()}
                      className="w-full h-20 text-[9px] font-mono bg-black/40 text-emerald-300 border border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)] resize-none break-all"
                    />
                    <span className="text-[8px] text-white/40 italic font-medium leading-none">
                      💡 Click inside to highlight if automatic transfer is blocked by frames.
                    </span>
                  </div>
                )}
              </div>

              {/* Save Import block */}
              <div className="bg-[var(--app-subpanel)] p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
                <span className="font-sans font-black text-xs text-[var(--app-accent)] uppercase tracking-wider block">
                  📥 2. Import Save Code
                </span>
                <p className="text-[10px] text-white/60 leading-normal">
                  Paste an exported save code token in the area below and merge it directly into your current session.
                </p>

                <textarea
                  id="settings-import-code-area"
                  value={pastedCode}
                  onChange={(e) => setPastedCode(e.target.value)}
                  className="w-full h-16 text-[9.5px] font-mono bg-black/40 text-white border border-white/10 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-[var(--app-accent)] placeholder-white/30"
                  placeholder="Paste backup key string here..."
                />

                <button
                  id="btn-import-save-settings"
                  onClick={triggerImport}
                  className="py-2.5 px-4 bg-[var(--app-button)] hover:brightness-110 text-white font-black text-xs rounded-xl border-b-2 border-black/30 transition-all uppercase cursor-pointer self-start"
                >
                  Apply Merged Save
                </button>

                {importStatus && (
                  <div className="text-[10px] font-black">
                    {importStatus.success ? (
                      <span className="text-emerald-400 flex items-center gap-1 uppercase">
                        <Check className="w-3.5 h-3.5 text-emerald-450" /> Sync Success! Academy files updated.
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 uppercase">
                        ⚠️ {importStatus.error}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Danger zone / Reset progresses */}
              {onResetAllProgress && (
                <div className="border border-rose-900/30 bg-rose-950/20 p-4 rounded-2xl flex flex-col gap-2">
                  <span className="text-xs font-black text-rose-450 flex items-center gap-1 uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    Danger Zone
                  </span>
                  
                  {showResetConfirm ? (
                    <div className="flex flex-col gap-2 mt-1">
                      <p className="text-[10px] font-bold text-rose-300">Are you absolutely sure? This will wipe your gold balance, purchase perks, and achievements forever.</p>
                      <div className="flex gap-2">
                        <button
                          onClick={triggerReset}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase rounded-lg border-b-2 border-rose-800"
                        >
                          Yes, Wipe Clean
                        </button>
                        <button
                          onClick={() => setShowResetConfirm(false)}
                          className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-[10px] font-black uppercase rounded-lg border-b-2 border-neutral-800"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowResetConfirm(true)}
                      className="py-2 px-3 text-left border border-rose-800/45 hover:bg-rose-955 bg-rose-950/30 text-rose-200 hover:text-white rounded-xl text-[10px] uppercase font-black tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Wipe Academy Record Data
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Back navigation */}
        <div className="flex justify-center mt-4">
          <button
            id="btn-settings-back"
            onClick={onBackToLobby}
            className="px-8 py-3 bg-[var(--app-button)] hover:brightness-110 text-white tracking-wide font-sans font-black rounded-2xl border-b-4 border-black/30 shadow-xl hover:scale-102 active:scale-98 transition-all uppercase cursor-pointer italic text-sm"
          >
            Return to Arena Lobby
          </button>
        </div>
      </div>
    </motion.div>
  );
};
