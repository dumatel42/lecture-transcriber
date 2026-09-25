import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ViewerTab } from '../types';
import {
  Copy,
  Check,
  Download,
  FileText,
  Search,
  RotateCcw,
  Sparkles,
  Languages,
  Columns2,
  Loader2,
  Clock,
  CheckCircle2,
  Printer,
  BookOpen
} from 'lucide-react';
import { downloadDocxTranscript } from '../services/docxExport';
import { SparkRenderer } from './SparkRenderer';
import { Language, translations } from '../i18n/translations';

interface TranscriptionViewerProps {
  transcript: string;
  russianTranslation?: string;
  sparkTranscript?: string;
  isStreaming: boolean;
  isTranslating: boolean;
  isSparkFormatting?: boolean;
  onTranslateToRussian: () => void;
  onFormatSparkStyle: () => void;
  onReset: () => void;
  fileName?: string;
  audioDurationSeconds?: number | null;
  lang: Language;
}

export const TranscriptionViewer: React.FC<TranscriptionViewerProps> = ({
  transcript,
  russianTranslation = '',
  sparkTranscript = '',
  isStreaming,
  isTranslating,
  isSparkFormatting = false,
  onTranslateToRussian,
  onFormatSparkStyle,
  onReset,
  fileName = 'lecture',
  audioDurationSeconds = null,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<ViewerTab>('english');
  const [viewEdition, setViewEdition] = useState<'raw' | 'spark'>('raw');
  const [copied, setCopied] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Autoscroll and timestamps are OFF by default
  const [autoScroll, setAutoScroll] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(false);
  const textEndRef = useRef<HTMLDivElement>(null);

  const t = translations[lang].viewer;

  // Switch to Russian when translation starts
  useEffect(() => {
    if (isTranslating && activeTab === 'english') {
      setActiveTab('russian');
    }
  }, [isTranslating, activeTab]);

  // When spark transcript becomes available, automatically switch to Book view
  useEffect(() => {
    if (sparkTranscript) {
      setViewEdition('spark');
    }
  }, [sparkTranscript]);

  // Strip timestamps if showTimestamps is false
  const cleanTimestamps = (text: string) => {
    return text.replace(/\[\d{1,2}:\d{2}(?::\d{2})?\]\s*/g, '');
  };

  const isSparkActive = viewEdition === 'spark' && sparkTranscript.trim().length > 0;
  const isRussianStructured = useMemo(() => {
    return (
      russianTranslation.includes('НАЗВАНИЕ') ||
      russianTranslation.includes('LECTURE TITLE') ||
      russianTranslation.includes('## [') ||
      russianTranslation.includes('> ') ||
      /\[\d{1,2}:\d{2}/.test(russianTranslation)
    );
  }, [russianTranslation]);

  const currentEnglishText = isSparkActive ? sparkTranscript : transcript;

  const rawActiveText = activeTab === 'russian' ? russianTranslation : currentEnglishText;
  const processedActiveText = showTimestamps || isSparkActive || (activeTab === 'russian' && isRussianStructured) ? rawActiveText : cleanTimestamps(rawActiveText);

  const wordCount = processedActiveText.trim() ? processedActiveText.trim().split(/\s+/).length : 0;
  const charCount = processedActiveText.length;
  const readTimeMin = Math.ceil(wordCount / 180);

  // Calculate live transcription completion percentage
  const transcriptionProgress = useMemo(() => {
    if (!isStreaming && transcript.trim().length > 0) {
      return 100;
    }
    if (!isStreaming) return 0;

    const timestampMatches = [...transcript.matchAll(/\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]/g)];
    if (timestampMatches.length > 0 && audioDurationSeconds && audioDurationSeconds > 0) {
      const lastMatch = timestampMatches[timestampMatches.length - 1];
      let secs = 0;
      if (lastMatch[3] !== undefined) {
        secs = parseInt(lastMatch[1], 10) * 3600 + parseInt(lastMatch[2], 10) * 60 + parseInt(lastMatch[3], 10);
      } else {
        secs = parseInt(lastMatch[1], 10) * 60 + parseInt(lastMatch[2], 10);
      }
      const pct = Math.min(99, Math.round((secs / audioDurationSeconds) * 100));
      return Math.max(5, pct);
    }

    if (audioDurationSeconds && audioDurationSeconds > 0) {
      const totalWordsEstimate = Math.max(50, Math.round((audioDurationSeconds / 60) * 135));
      const currentWords = transcript.trim().split(/\s+/).length;
      const pct = Math.min(99, Math.round((currentWords / totalWordsEstimate) * 100));
      return Math.max(5, pct);
    }

    return Math.min(95, Math.max(10, Math.round(transcript.length / 50)));
  }, [transcript, isStreaming, audioDurationSeconds]);

  useEffect(() => {
    if (autoScroll && (isStreaming || isTranslating || isSparkFormatting) && textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, russianTranslation, sparkTranscript, autoScroll, isStreaming, isTranslating, isSparkFormatting]);

  const handleCopy = async () => {
    try {
      let textToCopy = '';
      if (activeTab === 'bilingual') {
        const en = isSparkActive ? sparkTranscript : (showTimestamps ? transcript : cleanTimestamps(transcript));
        const ru = showTimestamps ? russianTranslation : cleanTimestamps(russianTranslation);
        textToCopy = `--- ENGLISH ORIGINAL ---\n\n${en}\n\n--- RUSSIAN TRANSLATION ---\n\n${ru}`;
      } else {
        textToCopy = processedActiveText;
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownloadTxt = () => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    let content = processedActiveText;
    let suffix = activeTab;

    if (activeTab === 'bilingual') {
      const en = isSparkActive ? sparkTranscript : (showTimestamps ? transcript : cleanTimestamps(transcript));
      const ru = showTimestamps ? russianTranslation : cleanTimestamps(russianTranslation);
      content = `=== ENGLISH ORIGINAL ===\n\n${en}\n\n=== RUSSIAN TRANSLATION ===\n\n${ru}`;
      suffix = 'bilingual';
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_${suffix}${isSparkActive ? '_book' : ''}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadMd = () => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const en = isSparkActive ? sparkTranscript : (showTimestamps ? transcript : cleanTimestamps(transcript));
    const ru = showTimestamps ? russianTranslation : cleanTimestamps(russianTranslation);
    let mdContent = '';

    if (activeTab === 'bilingual' || (transcript && russianTranslation)) {
      mdContent = `# ${baseName} — Bilingual Lecture Transcript\n\n*English Original & Russian Translation (VaniVoice AI)*\n\n---\n\n## 🇬🇧 English Transcript\n\n${en}\n\n---\n\n## 🇷🇺 Russian Translation\n\n${ru}`;
    } else if (activeTab === 'russian') {
      mdContent = `# ${baseName} — Русский перевод лекции\n\n*Литературный перевод (VaniVoice AI)*\n\n---\n\n${ru}`;
    } else {
      mdContent = isSparkActive ? sparkTranscript : `# ${baseName} — English Transcript\n\n*Transcribed via VaniVoice AI*\n\n---\n\n${en}`;
    }

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_${activeTab}${isSparkActive ? '_book' : ''}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      const enText = isSparkActive ? sparkTranscript : transcript;
      await downloadDocxTranscript({
        fileName,
        activeTab,
        englishTranscript: enText,
        russianTranslation
      });
    } catch (err) {
      console.error('Docx export failed:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!transcript && !isStreaming) return null;

  const enDisplay = isSparkActive ? sparkTranscript : (showTimestamps ? transcript : cleanTimestamps(transcript));
  const ruDisplay = showTimestamps ? russianTranslation : cleanTimestamps(russianTranslation);

  return (
    <div className="border border-slate-800 bg-slate-900/80 backdrop-blur rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
      {/* Top action toolbar (Hidden during print) */}
      <div className="no-print flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white text-base">{t.title}</h3>
              {isStreaming && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                  <Sparkles className="w-3 h-3" /> {t.transcribingProgress} ({transcriptionProgress}%)...
                </span>
              )}
              {isTranslating && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> {t.translatingStatus}
                </span>
              )}
              {isSparkFormatting && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> {t.formattingStatus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5 font-mono">
              <span>{wordCount.toLocaleString()} {t.wordsCount}</span>
              <span>•</span>
              <span>{charCount.toLocaleString()} {t.charsCount}</span>
              <span>•</span>
              <span>~{readTimeMin} {t.readTimeMin}</span>
            </div>
          </div>
        </div>

        {/* View Tabs & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs: English / Russian / Side-by-Side */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('english')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === 'english'
                  ? 'bg-amber-500/20 text-amber-300 shadow-sm border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.tabEnglish}
            </button>

            {russianTranslation && (
              <>
                <button
                  onClick={() => setActiveTab('russian')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === 'russian'
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.tabRussian}
                </button>
                <button
                  onClick={() => setActiveTab('bilingual')}
                  className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-all cursor-pointer ${
                    activeTab === 'bilingual'
                      ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Columns2 className="w-3.5 h-3.5" />
                  <span>{t.tabParallel}</span>
                </button>
              </>
            )}
          </div>

          {/* Book Edition Toggle and Format Book Button temporarily disabled per user request */}

          {/* Translation Button */}
          {!isStreaming && transcript.trim().length > 0 && (
            <button
              onClick={onTranslateToRussian}
              disabled={isTranslating}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer ${
                isTranslating
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 cursor-wait'
                  : russianTranslation
                  ? 'bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-800/70 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-600/20 hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>{t.translatingProgress}</span>
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  <span>{russianTranslation ? t.retranslateBtn : t.translateBtn}</span>
                </>
              )}
            </button>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t.copiedBtn : t.copyBtn}</span>
          </button>

          {/* Word .DOCX Download */}
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/70 transition-all shadow-sm cursor-pointer"
            title="Download Microsoft Word (.docx)"
          >
            {isExportingDocx ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>.DOCX</span>
          </button>

          {/* Markdown Download */}
          <button
            onClick={handleDownloadMd}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 transition-colors cursor-pointer"
            title="Download Markdown"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.MD</span>
          </button>

          {/* Plain Text Download */}
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Download Plain Text"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.TXT</span>
          </button>

          {/* Print / PDF Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {!isStreaming && !isTranslating && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.newLectureBtn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Transcription Progress Bar (Hidden during print) */}
      {(isStreaming || (!isStreaming && transcript)) && (
        <div className="no-print p-3.5 rounded-xl bg-slate-950/90 border border-slate-800/90 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  {t.transcribingProgress} ({transcriptionProgress}%)
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.completed100}
                </span>
              )}
            </div>
            <span className="text-slate-400 font-mono text-[11px]">
              {wordCount.toLocaleString()} {t.wordsCount}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isStreaming
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${isStreaming ? transcriptionProgress : 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Search, Timestamps toggle & Autoscroll settings (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Timestamps toggle in Viewer (Default: OFF) */}
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTimestamps}
              onChange={(e) => setShowTimestamps(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{t.showTimestamps}</span>
            </span>
          </label>

          {/* Autoscroll checkbox (Default: OFF) */}
          <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
            />
            <span>{t.autoscroll}</span>
          </label>
        </div>
      </div>

      {/* Main Text Content: Single or Parallel */}
      {activeTab === 'bilingual' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[620px] overflow-y-auto pr-1">
          {/* Left Column: English Original */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-2">
            <div className="no-print flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-amber-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span>🇬🇧 {t.enOriginalHeader}</span>
                {isSparkActive && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    {t.editionBook}
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">{t.cleanReadingSub}</span>
            </div>
            {isSparkActive ? (
              <SparkRenderer content={sparkTranscript} isStreaming={isSparkFormatting} />
            ) : (
              <div className="leading-relaxed text-sm text-slate-200 whitespace-pre-wrap font-sans">
                {enDisplay}
              </div>
            )}
          </div>

          {/* Right Column: Russian Translation */}
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 space-y-2">
            <div className="no-print flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-cyan-400 font-semibold">
              <span className="flex items-center gap-1.5">
                <span>🇷🇺 {t.ruTranslationHeader}</span>
                {isRussianStructured && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                    {t.editionBook}
                  </span>
                )}
              </span>
              <span className="text-[11px] text-slate-500 font-normal">{t.termsSub}</span>
            </div>
            {isRussianStructured ? (
              <SparkRenderer content={russianTranslation} isStreaming={isTranslating} />
            ) : (
              <div className="leading-relaxed text-sm text-slate-200 whitespace-pre-wrap font-sans">
                {ruDisplay}
                {isTranslating && (
                  <span className="inline-block w-2 h-4 ml-1 bg-cyan-400 animate-pulse align-middle" />
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 max-h-[620px] overflow-y-auto leading-relaxed text-sm text-slate-200 font-sans">
          {/* If viewing English with Spark edition enabled */}
          {activeTab === 'english' && isSparkActive ? (
            <SparkRenderer content={sparkTranscript} isStreaming={isSparkFormatting} />
          ) : activeTab === 'russian' && isRussianStructured ? (
            <SparkRenderer content={russianTranslation} isStreaming={isTranslating} />
          ) : (
            <div className="whitespace-pre-wrap leading-relaxed">
              {processedActiveText}
              {(isStreaming || isTranslating || isSparkFormatting) && (
                <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse align-middle" />
              )}
            </div>
          )}
          <div ref={textEndRef} />
        </div>
      )}
    </div>
  );
};
