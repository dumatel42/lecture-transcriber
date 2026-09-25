import React from 'react';
import { ProgressState } from '../types';
import { CloudUpload, Cpu, Sparkles, AlertCircle, CheckCircle2, Loader2, Languages } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface ProgressCardProps {
  progress: ProgressState;
  onRetry?: () => void;
  lang: Language;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ progress, onRetry, lang }) => {
  const { stage, percent, message, bytesUploaded, totalBytes, elapsedSeconds = 0 } = progress;

  if (stage === 'idle') return null;

  const t = translations[lang].progress;

  const formatMB = (bytes?: number) => {
    if (!bytes) return '0 MB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getStageTitle = () => {
    switch (stage) {
      case 'uploading':
        return t.uploadingTitle;
      case 'processing_audio':
        return t.processingAudioTitle;
      case 'transcribing':
        return t.transcribingTitle;
      case 'translating':
        return t.translatingTitle;
      case 'completed':
        return t.completedTitle;
      case 'error':
        return t.errorTitle;
      default:
        return '';
    }
  };

  return (
    <div className="border border-slate-800 bg-slate-900/70 backdrop-blur rounded-2xl p-6 shadow-xl space-y-5">
      {/* Top status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {stage === 'uploading' && (
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CloudUpload className="w-5 h-5 animate-bounce" />
            </div>
          )}
          {stage === 'processing_audio' && (
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
          )}
          {stage === 'transcribing' && (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
          )}
          {stage === 'translating' && (
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Languages className="w-5 h-5 animate-spin" />
            </div>
          )}
          {stage === 'completed' && (
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {stage === 'error' && (
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}

          <div>
            <h4 className="font-semibold text-white text-base">
              {getStageTitle()}
            </h4>
            <p className="text-xs text-slate-400">{message}</p>
          </div>
        </div>

        {elapsedSeconds > 0 && (
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-500">{t.elapsed}</span>
            <div className="text-sm font-mono text-slate-300">
              {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar (Visible during upload) */}
      {stage === 'uploading' && (
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>{percent}% {t.transferred}</span>
            <span>
              {formatMB(bytesUploaded)} / {formatMB(totalBytes)}
            </span>
          </div>
        </div>
      )}

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${
            stage === 'uploading'
              ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
              : stage === 'processing_audio' || stage === 'transcribing' || stage === 'translating' || stage === 'completed'
              ? 'text-emerald-400'
              : 'text-slate-500'
          }`}
        >
          {stage === 'uploading' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : stage === 'processing_audio' || stage === 'transcribing' || stage === 'translating' || stage === 'completed' ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">
              1
            </div>
          )}
          <span className="font-medium truncate">{t.step1}</span>
        </div>

        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${
            stage === 'processing_audio'
              ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30'
              : stage === 'transcribing' || stage === 'translating' || stage === 'completed'
              ? 'text-emerald-400'
              : 'text-slate-500'
          }`}
        >
          {stage === 'processing_audio' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : stage === 'transcribing' || stage === 'translating' || stage === 'completed' ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">
              2
            </div>
          )}
          <span className="font-medium truncate">{t.step2}</span>
        </div>

        <div
          className={`flex items-center gap-2 p-2 rounded-lg ${
            stage === 'transcribing' || stage === 'translating'
              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
              : stage === 'completed'
              ? 'text-emerald-400'
              : 'text-slate-500'
          }`}
        >
          {stage === 'transcribing' || stage === 'translating' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : stage === 'completed' ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <div className="w-3.5 h-3.5 rounded-full border border-slate-600 flex items-center justify-center text-[9px]">
              3
            </div>
          )}
          <span className="font-medium truncate">{t.step3}</span>
        </div>
      </div>

      {/* Error Retry Button */}
      {stage === 'error' && onRetry && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onRetry}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors cursor-pointer"
          >
            {t.tryAgain}
          </button>
        </div>
      )}
    </div>
  );
};
