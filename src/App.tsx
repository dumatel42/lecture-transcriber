import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { AudioUploader } from './components/AudioUploader';
import { ModeSelector } from './components/ModeSelector';
import { ProgressCard } from './components/ProgressCard';
import { TranscriptionViewer } from './components/TranscriptionViewer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { TextUploader } from './components/TextUploader';
import { TranscriptionMode, ProgressState, InputSourceMode } from './types';
import { TRANSCRIPTION_PRESETS, buildPresetPrompt } from './constants/presets';
import {
  uploadAudioToGemini,
  waitForAudioProcessing,
  streamTranscription,
  translateTranscriptToRussian,
  formatTranscriptSparkStyle,
  cleanupGoogleFile,
  getActiveDefaultKey
} from './services/gemini';
import { Language, translations } from './i18n/translations';
import mammoth from 'mammoth';
import {
  Play,
  Sparkles,
  RefreshCw,
  FileText,
  Radio,
  Languages,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export const App: React.FC = () => {
  // Language state (default: 'en')
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('vanivoice_lang');
    return saved === 'ru' || saved === 'en' ? saved : 'en';
  });

  const handleToggleLang = () => {
    const next: Language = lang === 'en' ? 'ru' : 'en';
    setLang(next);
    localStorage.setItem('vanivoice_lang', next);
  };

  const t = translations[lang];

  // Key state
  const [customKey, setCustomKey] = useState<string>(() => {
    return localStorage.getItem('lectorclean_custom_api_key') || '';
  });
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const activeKey = customKey || getActiveDefaultKey();

  // Input Source: 'audio' vs 'text'
  const [inputSourceMode, setInputSourceMode] = useState<InputSourceMode>('audio');
  const [inputText, setInputText] = useState<string>('');
  const [textFileName, setTextFileName] = useState<string | undefined>(undefined);

  // Audio file & mode
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioDurationSeconds, setAudioDurationSeconds] = useState<number | null>(null);
  
  // Timestamps toggle: OFF by default
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  
  const [currentMode, setCurrentMode] = useState<TranscriptionMode>('vaishnava_english');
  const [promptText, setPromptText] = useState<string>(() => buildPresetPrompt('vaishnava_english', false));

  // Cached upload info
  const [cachedFile, setCachedFile] = useState<{ name: string; uri: string; mimeType: string } | null>(null);

  // Progress & Execution
  const [progress, setProgress] = useState<ProgressState>({
    stage: 'idle',
    percent: 0,
    message: ''
  });
  const [transcript, setTranscript] = useState<string>('');
  const [russianTranslation, setRussianTranslation] = useState<string>('');
  const [sparkTranscript, setSparkTranscript] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSparkFormatting, setIsSparkFormatting] = useState(false);
  const timerRef = useRef<any>(null);

  // Elapsed time tracker
  useEffect(() => {
    if (
      progress.stage === 'uploading' ||
      progress.stage === 'processing_audio' ||
      progress.stage === 'transcribing' ||
      progress.stage === 'translating'
    ) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setProgress((prev) => ({ ...prev, elapsedSeconds: elapsed }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [progress.stage]);

  const handleSaveCustomKey = (key: string) => {
    setCustomKey(key);
    if (key) {
      localStorage.setItem('lectorclean_custom_api_key', key);
    } else {
      localStorage.removeItem('lectorclean_custom_api_key');
    }
  };

  const handleFileChange = (file: File | null) => {
    if (cachedFile && activeKey) {
      cleanupGoogleFile(cachedFile.name, activeKey);
    }
    setCachedFile(null);
    setSelectedFile(file);
    if (!file) {
      handleReset();
    }
  };

  const handleStart = async () => {
    if (!selectedFile) return;

    if (!activeKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setTranscript('');
    setRussianTranslation('');
    setSparkTranscript('');
    setIsStreaming(false);
    setIsTranslating(false);
    setIsSparkFormatting(false);

    try {
      setProgress({
        stage: 'uploading',
        percent: 0,
        message: lang === 'en' ? 'Uploading audio stream...' : 'Передача аудио в облако...',
        bytesUploaded: 0,
        totalBytes: selectedFile.size,
        elapsedSeconds: 0
      });

      const uploadedFile = await uploadAudioToGemini(
        selectedFile,
        activeKey,
        (percent, loaded, total) => {
          setProgress((prev) => ({
            ...prev,
            stage: 'uploading',
            percent,
            bytesUploaded: loaded,
            totalBytes: total,
            message: lang === 'en'
              ? `Uploading: ${percent}% (${(loaded / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024).toFixed(1)} MB)...`
              : `Загрузка: ${percent}% (${(loaded / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024).toFixed(1)} МБ)...`
          }));
        }
      );

      setProgress({
        stage: 'processing_audio',
        percent: 100,
        message: lang === 'en' ? 'Indexing audio in cloud...' : 'Индексация аудиопотока...',
        bytesUploaded: selectedFile.size,
        totalBytes: selectedFile.size
      });

      await waitForAudioProcessing(uploadedFile.name, activeKey, (statusMsg) => {
        setProgress((prev) => ({ ...prev, message: statusMsg }));
      });

      setProgress({
        stage: 'transcribing',
        percent: 100,
        message: lang === 'en' ? 'Streaming verbatim lecture transcript...' : 'Потоковое распознавание лекции...',
        bytesUploaded: selectedFile.size,
        totalBytes: selectedFile.size
      });
      setIsStreaming(true);

      await streamTranscription(
        uploadedFile.uri,
        uploadedFile.mimeType,
        promptText,
        activeKey,
        (chunkText) => {
          setTranscript((prev) => prev + chunkText);
        },
        (model) => {
          setProgress((prev) => ({
            ...prev,
            message: `${model} active`
          }));
        },
        () => {}
      );

      setIsStreaming(false);
      setProgress({
        stage: 'completed',
        percent: 100,
        message: lang === 'en' ? 'Lecture transcribed successfully!' : 'Лекция успешно распознана!'
      });

      cleanupGoogleFile(uploadedFile.name, activeKey).catch(() => {});
    } catch (err: any) {
      console.error(err);
      setIsStreaming(false);
      setProgress({
        stage: 'error',
        percent: 0,
        message: err.message || (lang === 'en' ? 'An error occurred during audio processing.' : 'Произошла ошибка при обработке аудио.')
      });
    }
  };

  const handleTranslateToRussian = async () => {
    const textToTranslate = transcript;
    if (!textToTranslate.trim()) return;

    setIsTranslating(true);
    setRussianTranslation('');

    setProgress({
      stage: 'translating',
      percent: 100,
      message: lang === 'en' ? 'Translating to Russian with Vaishnava terms...' : 'Перевод на русский язык с сиддхантой и терминами...'
    });

    try {
      await translateTranscriptToRussian(
        textToTranslate,
        activeKey,
        (chunk) => {
          setRussianTranslation((prev) => prev + chunk);
        }
      );

      setIsTranslating(false);
      setProgress({
        stage: 'completed',
        percent: 100,
        message: lang === 'en' ? 'Translation complete!' : 'Перевод успешно завершен!'
      });
    } catch (err: any) {
      console.error(err);
      setIsTranslating(false);
      setProgress({
        stage: 'completed',
        percent: 100,
        message: err.message || (lang === 'en' ? 'Failed to translate transcript.' : 'Ошибка при переводе.')
      });
    }
  };

  const handleFormatSparkStyle = async () => {
    if (!transcript.trim()) return;

    setIsSparkFormatting(true);
    setSparkTranscript('');

    try {
      await formatTranscriptSparkStyle(
        transcript,
        activeKey,
        (chunk) => {
          setSparkTranscript((prev) => prev + chunk);
        }
      );
      setIsSparkFormatting(false);
    } catch (err: any) {
      console.error('Book formatting error:', err);
      setIsSparkFormatting(false);
      alert((lang === 'en' ? 'Failed to format book: ' : 'Ошибка при вёрстке книги: ') + (err.message || err));
    }
  };

  const handleTranslateTextDocument = async () => {
    if (!inputText.trim()) return;

    if (!activeKey) {
      setIsKeyModalOpen(true);
      return;
    }

    setTranscript(inputText);
    setRussianTranslation('');
    setSparkTranscript('');
    setIsStreaming(false);
    setIsTranslating(true);
    setIsSparkFormatting(false);

    setProgress({
      stage: 'translating',
      percent: 100,
      message: lang === 'en'
        ? 'Unabridged literary translation to Russian...'
        : 'Литературный перевод на русский (сиддханта, термины, шлоки)...',
      elapsedSeconds: 0
    });

    try {
      await translateTranscriptToRussian(
        inputText,
        activeKey,
        (chunk) => {
          setRussianTranslation((prev) => prev + chunk);
        }
      );

      setIsTranslating(false);
      setProgress({
        stage: 'completed',
        percent: 100,
        message: lang === 'en'
          ? 'Translation complete! Open in reader panel.'
          : 'Перевод завершен! Открыт в панели чтения.'
      });
    } catch (err: any) {
      console.error('Text translation failed:', err);
      setIsTranslating(false);
      setProgress({
        stage: 'error',
        percent: 0,
        message: err.message || (lang === 'en' ? 'Failed to translate text document.' : 'Ошибка при переводе текста.')
      });
    }
  };

  const handleTextFileDroppedOnAudio = async (file: File) => {
    setInputSourceMode('text');
    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setInputText(result.value);
        setTextFileName(file.name);
      } else {
        const content = await file.text();
        setInputText(content);
        setTextFileName(file.name);
      }
    } catch (err: any) {
      console.error(err);
      alert((lang === 'en' ? 'Failed to read file: ' : 'Ошибка при чтении файла: ') + (err.message || err));
    }
  };

  const handleAudioFileDroppedOnText = (file: File) => {
    setInputSourceMode('audio');
    handleFileChange(file);
  };

  const handleReset = () => {
    if (cachedFile && activeKey) {
      cleanupGoogleFile(cachedFile.name, activeKey);
    }
    setCachedFile(null);
    setSelectedFile(null);
    setInputText('');
    setTextFileName(undefined);
    setAudioDurationSeconds(null);
    setTranscript('');
    setRussianTranslation('');
    setSparkTranscript('');
    setIsStreaming(false);
    setIsTranslating(false);
    setIsSparkFormatting(false);
    setProgress({
      stage: 'idle',
      percent: 0,
      message: ''
    });
  };

  const isBusy =
    progress.stage === 'uploading' ||
    progress.stage === 'processing_audio' ||
    progress.stage === 'transcribing' ||
    progress.stage === 'translating';

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Navbar (Hidden on print) */}
      <div className="no-print">
        <Navbar
          hasCustomKey={!!customKey}
          onOpenKeyModal={() => setIsKeyModalOpen(true)}
          lang={lang}
          onToggleLang={handleToggleLang}
        />
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section (Hidden on print) */}
        <div className="no-print text-center space-y-4 pt-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {t.hero.titleMain}{' '}
            <span className="block text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400 bg-clip-text text-transparent mt-1">
              {t.hero.titleGradient}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          {/* 2 Core Capabilities Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-3xl mx-auto pt-1 text-left">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-amber-500/30 hover:border-amber-500/50 transition-colors shadow-lg shadow-amber-950/20">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm mb-1.5">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>{t.hero.feature1Title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.hero.feature1Desc}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-500/50 transition-colors shadow-lg shadow-cyan-950/20">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm mb-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{t.hero.feature2Title}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.hero.feature2Desc}
              </p>
            </div>
          </div>
        </div>

        {/* Upload & Controls */}
        <div className="space-y-6">
          <div className="no-print space-y-6">
            {/* Zen Source Switcher: Audio vs Text Document */}
            <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 max-w-md mx-auto shadow-xl">
              <button
                type="button"
                onClick={() => setInputSourceMode('audio')}
                disabled={isBusy}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  inputSourceMode === 'audio'
                    ? 'bg-gradient-to-r from-amber-500/25 to-orange-500/25 text-amber-300 border border-amber-500/40 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-4 h-4 text-amber-400" />
                <span>{t.modes.audioTab}</span>
              </button>
              <button
                type="button"
                onClick={() => setInputSourceMode('text')}
                disabled={isBusy}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  inputSourceMode === 'text'
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/25 text-cyan-300 border border-cyan-500/40 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>{t.modes.textTab}</span>
              </button>
            </div>

            {inputSourceMode === 'audio' ? (
              <>
                <AudioUploader
                  selectedFile={selectedFile}
                  onFileSelect={handleFileChange}
                  onDurationChange={setAudioDurationSeconds}
                  onTextFileDropped={handleTextFileDroppedOnAudio}
                  disabled={isBusy}
                  lang={lang}
                />

                {/* Mode Selector with Timestamps Switch */}
                <ModeSelector
                  currentMode={currentMode}
                  onModeChange={setCurrentMode}
                  promptText={promptText}
                  onPromptChange={setPromptText}
                  includeTimestamps={includeTimestamps}
                  onToggleTimestamps={setIncludeTimestamps}
                  disabled={isBusy}
                  lang={lang}
                />

                {/* Audio Action Button */}
                {selectedFile && !isBusy && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleStart}
                      className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:from-amber-500 hover:via-orange-500 hover:to-indigo-500 shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                    >
                      {progress.stage === 'completed' ? (
                        <>
                          <RefreshCw className="w-5 h-5 text-white" />
                          <span>{t.actions.rerunAudio}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-white" />
                          <span>{t.actions.startAudio}</span>
                          <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <TextUploader
                  text={inputText}
                  fileName={textFileName}
                  onTextChange={(newText, name) => {
                    setInputText(newText);
                    if (name !== undefined) setTextFileName(name);
                  }}
                  onAudioFileDropped={handleAudioFileDroppedOnText}
                  disabled={isBusy}
                  lang={lang}
                />

                {/* Text Action Button */}
                {inputText.trim() && !isBusy && (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleTranslateTextDocument}
                      className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500 shadow-xl shadow-cyan-600/25 hover:shadow-cyan-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                    >
                      <Languages className="w-5 h-5 text-white" />
                      <span>{progress.stage === 'completed' ? t.actions.retranslateText : t.actions.translateText}</span>
                      <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Progress Card */}
            <ProgressCard
              progress={progress}
              onRetry={inputSourceMode === 'audio' ? handleStart : handleTranslateTextDocument}
              lang={lang}
            />
          </div>

          {/* Transcription Viewer & Russian Translator */}
          <TranscriptionViewer
            transcript={transcript}
            russianTranslation={russianTranslation}
            sparkTranscript={sparkTranscript}
            isStreaming={isStreaming}
            isTranslating={isTranslating}
            isSparkFormatting={isSparkFormatting}
            onTranslateToRussian={handleTranslateToRussian}
            onFormatSparkStyle={handleFormatSparkStyle}
            onReset={handleReset}
            fileName={inputSourceMode === 'text' ? (textFileName || 'document.txt') : (selectedFile?.name || 'lecture.mp3')}
            audioDurationSeconds={audioDurationSeconds}
            lang={lang}
          />
        </div>

        {/* Feature Highlights Grid (Cleaned of all tech jargon & cognitive noise) */}
        {progress.stage === 'idle' && !transcript && (
          <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800/60">
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Radio className="w-4 h-4" />
                <span>{t.features.clarityTitle}</span>
              </div>
              <p className="text-xs text-slate-400">
                {t.features.clarityDesc}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                <BookOpen className="w-4 h-4" />
                <span>{t.features.translationTitle}</span>
              </div>
              <p className="text-xs text-slate-400">
                {t.features.translationDesc}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <FileText className="w-4 h-4" />
                <span>{t.features.exportTitle}</span>
              </div>
              <p className="text-xs text-slate-400">
                {t.features.exportDesc}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer (Hidden on print) */}
      <footer className="no-print border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>{t.footer.text}</p>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        customKey={customKey}
        onSaveCustomKey={handleSaveCustomKey}
        hasDefaultKey={true}
        lang={lang}
      />
    </div>
  );
};
