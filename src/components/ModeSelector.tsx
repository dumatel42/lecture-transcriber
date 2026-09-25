import React, { useState } from 'react';
import { TranscriptionMode } from '../types';
import { TRANSCRIPTION_PRESETS, buildPresetPrompt } from '../constants/presets';
import { Sliders, ChevronDown, ChevronUp, Sparkles, Users, BookOpen, GraduationCap, Edit3, Clock } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ModeSelectorProps {
  currentMode: TranscriptionMode;
  onModeChange: (mode: TranscriptionMode) => void;
  promptText: string;
  onPromptChange: (newPrompt: string) => void;
  includeTimestamps: boolean;
  onToggleTimestamps: (enabled: boolean) => void;
  disabled: boolean;
  lang: Language;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  promptText,
  onPromptChange,
  includeTimestamps,
  onToggleTimestamps,
  disabled,
  lang
}) => {
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const t = translations[lang].modeSelector;

  const getIcon = (mode: TranscriptionMode) => {
    switch (mode) {
      case 'vaishnava_english':
        return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'bilingual_split':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'vaishnava_with_summary':
        return <BookOpen className="w-5 h-5 text-cyan-400" />;
      case 'general_english':
        return <GraduationCap className="w-5 h-5 text-indigo-400" />;
      case 'custom':
        return <Edit3 className="w-5 h-5 text-emerald-400" />;
    }
  };

  const handleSelectMode = (mode: TranscriptionMode) => {
    if (disabled) return;
    onModeChange(mode);
    onPromptChange(buildPresetPrompt(mode, includeTimestamps));
  };

  const handleTimestampToggle = (newVal: boolean) => {
    if (disabled) return;
    onToggleTimestamps(newVal);
    onPromptChange(buildPresetPrompt(currentMode, newVal));
  };

  const presetKeys: TranscriptionMode[] = [
    'vaishnava_english',
    'bilingual_split',
    'vaishnava_with_summary',
    'general_english'
  ];

  return (
    <div className="border border-slate-800 bg-slate-900/50 rounded-2xl p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white">{t.title}</h3>
        </div>

        {/* Timestamps lever/switch & prompt toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Timestamp Lever Switch (Default OFF) */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium select-none">{t.timestamps}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => handleTimestampToggle(!includeTimestamps)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                includeTimestamps ? 'bg-amber-500' : 'bg-slate-700'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  includeTimestamps ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[11px] text-slate-500 select-none">
              {includeTimestamps ? t.timestampsOn : t.timestampsOff}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <span>{showPromptEditor ? t.hidePrompt : t.inspectPrompt}</span>
            {showPromptEditor ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Preset cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {presetKeys.map((modeKey) => {
          const localizedPreset = t.presets[modeKey] || TRANSCRIPTION_PRESETS[modeKey];
          const isSelected = currentMode === modeKey;

          return (
            <div
              key={modeKey}
              onClick={() => handleSelectMode(modeKey)}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-800/40'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
                    {getIcon(modeKey)}
                  </div>
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {localizedPreset.badge}
                  </span>
                </div>

                <h4 className="font-semibold text-sm text-white mb-1.5 leading-snug">{localizedPreset.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{localizedPreset.description}</p>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2 border-t border-amber-500/20 flex items-center gap-1.5 text-[11px] text-amber-300 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span>{t.activeEngine}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expandable Prompt Editor */}
      {showPromptEditor && (
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">
              {t.systemPromptTitle}
            </label>
            <button
              onClick={() => onPromptChange(buildPresetPrompt(currentMode, includeTimestamps))}
              className="text-[11px] text-amber-400 hover:underline cursor-pointer"
            >
              {t.resetDefault}
            </button>
          </div>
          <textarea
            value={promptText}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={disabled}
            rows={7}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500/80 transition-colors"
            placeholder="Neural prompt instructions..."
          />
        </div>
      )}
    </div>
  );
};
