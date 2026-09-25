import React, { useState } from 'react';
import { Key, X, Check, ExternalLink, ShieldCheck, Trash2, Layers } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  customKey: string;
  onSaveCustomKey: (key: string) => void;
  hasDefaultKey: boolean;
  lang: Language;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  customKey,
  onSaveCustomKey,
  lang
}) => {
  const [inputValue, setInputValue] = useState(customKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const t = translations[lang].apiKeyModal;

  const handleSave = () => {
    onSaveCustomKey(inputValue.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    setInputValue('');
    onSaveCustomKey('');
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">{t.title}</h3>
              <p className="text-xs text-slate-400">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">{t.statusLabel}</span>
            {customKey ? (
              <span className="text-amber-400 font-medium">{t.customActive}</span>
            ) : (
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {t.poolActive}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-emerald-300">
            <Layers className="w-4 h-4 shrink-0" />
            <span>{t.capacityNotice}</span>
          </div>

          <p className="text-slate-400 leading-relaxed">
            {t.description}
          </p>
        </div>

        {/* Custom key input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            {t.inputLabel}
          </label>
          <input
            type="password"
            placeholder="AIzaSy... or AQ.Ab..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        {/* Link to get key */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>{t.needKey}</span>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-amber-400 hover:underline"
          >
            <span>{t.getKeyLink}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          {customKey && (
            <button
              onClick={handleClear}
              className="mr-auto flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.resetPool}</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            {t.cancel}
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl transition-colors shadow-lg shadow-amber-600/20 cursor-pointer"
          >
            {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{savedSuccess ? t.saved : t.save}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
