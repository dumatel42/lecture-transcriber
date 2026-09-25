import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Trash2, Clipboard, Check, Sparkles } from 'lucide-react';
import mammoth from 'mammoth';
import { Language, translations } from '../i18n/translations';

interface TextUploaderProps {
  text: string;
  fileName?: string;
  onTextChange: (text: string, fileName?: string) => void;
  onAudioFileDropped?: (file: File) => void;
  disabled: boolean;
  lang: Language;
}

export const TextUploader: React.FC<TextUploaderProps> = ({
  text,
  fileName,
  onTextChange,
  onAudioFileDropped,
  disabled,
  lang
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang].textUploader;

  const wordsCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charsCount = text.length;

  const handleFile = async (file: File) => {
    // Check if user accidentally dropped an audio file
    if (file.type.startsWith('audio/') || /\.(mp3|m4a|wav|aac|ogg|webm|flac|mp4)$/i.test(file.name)) {
      if (onAudioFileDropped) {
        onAudioFileDropped(file);
        return;
      }
    }

    setIsReadingFile(true);
    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        onTextChange(result.value, file.name);
      } else {
        const content = await file.text();
        onTextChange(content, file.name);
      }
    } catch (err: any) {
      console.error('Failed to read file:', err);
      alert((lang === 'en' ? 'Failed to read file: ' : 'Не удалось прочитать файл: ') + (err.message || err));
    } finally {
      setIsReadingFile(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onTextChange(clipText, fileName || (lang === 'en' ? 'Pasted text' : 'Вставленный текст'));
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 1500);
      }
    } catch {
      // Browser permission prompt or fallback
    }
  };

  const handleClear = () => {
    onTextChange('', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.markdown,.docx,text/plain,text/markdown"
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
          }
        }}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border rounded-2xl transition-all duration-300 bg-slate-900/50 backdrop-blur ${
          isDragging
            ? 'border-cyan-500 bg-cyan-500/10 ring-2 ring-cyan-500/30'
            : 'border-slate-800 hover:border-slate-700'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 rounded-t-2xl text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText className="w-4 h-4" />
            </div>
            {fileName ? (
              <span className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs" title={fileName}>
                {fileName}
              </span>
            ) : (
              <span className="text-slate-400 font-medium">
                {t.headerPlaceholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Upload File Button */}
            <button
              type="button"
              disabled={disabled || isReadingFile}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isReadingFile ? t.reading : t.uploadFile}</span>
            </button>

            {/* Paste Button */}
            {!text && (
              <button
                type="button"
                disabled={disabled}
                onClick={handlePasteFromClipboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/25 transition-colors cursor-pointer"
              >
                {copiedNotification ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Clipboard className="w-3.5 h-3.5" />}
                <span>{copiedNotification ? t.pasted : t.paste}</span>
              </button>
            )}

            {/* Clear Button */}
            {text && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-800/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.clear}</span>
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 sm:p-5">
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value, fileName)}
            disabled={disabled}
            rows={text ? 10 : 7}
            placeholder={t.placeholder}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm leading-relaxed resize-y focus:outline-none font-sans"
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-800/60 bg-slate-950/30 rounded-b-2xl text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400/90 font-medium">
              <Sparkles className="w-3 h-3" /> {t.badgeStatus}
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline text-[11px] text-slate-500">
              {t.formatsNote}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span>{wordsCount.toLocaleString()} {t.wordsCount}</span>
            <span>•</span>
            <span>{charsCount.toLocaleString()} {t.charsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
