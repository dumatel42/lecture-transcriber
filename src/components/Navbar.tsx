import React from 'react';
import { Mic, Key, Globe } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';
import { Language, translations } from '../i18n/translations';

interface NavbarProps {
  hasCustomKey: boolean;
  onOpenKeyModal: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hasCustomKey,
  onOpenKeyModal,
  lang,
  onToggleLang
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-indigo-600 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Mic className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent tracking-tight">
                {t.navbar.title}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.navbar.subtitle}
            </p>
          </div>
        </div>

        {/* Right Actions: GitHub, Language Switcher & Key Modal */}
        <div className="flex items-center gap-2.5">
          {/* GitHub Repository Link */}
          <a
            href="https://github.com/dumatel42/lecture-transcriber"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
            title={lang === 'en' ? 'Open Source on GitHub (Code & Guide)' : 'Открытый исходный код и руководство на GitHub'}
          >
            <GithubIcon className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline font-mono">GitHub</span>
          </a>

          {/* Top-Right Language Switcher */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 hover:border-slate-600 text-slate-200 hover:text-white transition-all shadow-sm cursor-pointer"
            title={lang === 'en' ? 'Переключить на русский язык' : 'Switch to English'}
          >
            <span className="text-sm leading-none" role="img" aria-label="flag">
              {lang === 'en' ? '🇬🇧' : '🇷🇺'}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-wider font-bold">
              {lang.toUpperCase()}
            </span>
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Key Settings */}
          <button
            onClick={onOpenKeyModal}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg transition-all border border-slate-700/80 bg-slate-800/60 hover:bg-slate-700 text-slate-200 hover:text-white cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span>{hasCustomKey ? t.navbar.customKey : t.navbar.defaultKey}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
