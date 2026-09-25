import React, { useState, useRef } from 'react';
import { UploadCloud, FileAudio, Trash2, Clock, HardDrive, CheckCircle2 } from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface AudioUploaderProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  onDurationChange?: (seconds: number | null) => void;
  onTextFileDropped?: (file: File) => void;
  disabled: boolean;
  lang: Language;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  selectedFile,
  onFileSelect,
  onDurationChange,
  onTextFileDropped,
  disabled,
  lang
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [durationStr, setDurationStr] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang].audioUploader;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    }
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}m ${s}s`;
  };

  const handleFile = (file: File) => {
    if (/\.(txt|md|markdown|docx)$/i.test(file.name) || file.type.startsWith('text/')) {
      if (onTextFileDropped) {
        onTextFileDropped(file);
        return;
      }
    }
    onFileSelect(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);

    const tempAudio = new Audio(url);
    tempAudio.onloadedmetadata = () => {
      if (tempAudio.duration && !isNaN(tempAudio.duration)) {
        setDurationStr(formatDuration(tempAudio.duration));
        onDurationChange?.(tempAudio.duration);
      }
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (/\.(txt|md|markdown|docx)$/i.test(file.name) || file.type.startsWith('text/')) {
        if (onTextFileDropped) {
          onTextFileDropped(file);
          return;
        }
      }
      handleFile(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDurationStr(null);
    onFileSelect(null);
    onDurationChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.m4a,.wav,.aac,.ogg,.webm,.flac"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      {!selectedFile ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-amber-500 bg-amber-500/10 scale-[1.01]'
              : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/70'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-semibold text-white mb-1">
            {t.dropTitle}
          </h3>
          <p className="text-sm text-slate-400 mb-4 max-w-md mx-auto">
            {t.dropSubtitle}
          </p>

          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-300/90 bg-amber-950/60 border border-amber-800/50 px-3 py-1.5 rounded-lg">
            <span>{t.formats}</span>
          </div>
        </div>
      ) : (
        <div className="border border-slate-700/70 bg-slate-900/60 backdrop-blur rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
                <FileAudio className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white truncate max-w-xs sm:max-w-md" title={selectedFile.name}>
                    {selectedFile.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-full shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> {t.ready}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                    {formatFileSize(selectedFile.size)}
                  </span>
                  {durationStr && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {durationStr}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="self-end sm:self-auto flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.replaceFile}</span>
              </button>
            )}
          </div>

          {audioUrl && (
            <div className="pt-2 border-t border-slate-800/70">
              <audio
                controls
                src={audioUrl}
                className="w-full h-9 rounded-lg opacity-85 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
