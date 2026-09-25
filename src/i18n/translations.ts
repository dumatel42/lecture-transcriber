export type Language = 'en' | 'ru';

export interface Translations {
  navbar: {
    title: string;
    subtitle: string;
    customKey: string;
    defaultKey: string;
    switchLang: string;
  };
  hero: {
    titleMain: string;
    titleGradient: string;
    subtitle: string;
    feature1Title: string;
    feature1Desc: string;
    feature2Title: string;
    feature2Desc: string;
  };
  modes: {
    audioTab: string;
    textTab: string;
  };
  audioUploader: {
    dropTitle: string;
    dropSubtitle: string;
    formats: string;
    ready: string;
    replaceFile: string;
  };
  modeSelector: {
    title: string;
    timestamps: string;
    timestampsOn: string;
    timestampsOff: string;
    inspectPrompt: string;
    hidePrompt: string;
    systemPromptTitle: string;
    resetDefault: string;
    activeEngine: string;
    customScriptureLabel: string;
    customScripturePlaceholder: string;
    customScriptureHint: string;
    presets: {
      vaishnava_english: {
        name: string;
        badge: string;
        description: string;
      };
      bilingual_split: {
        name: string;
        badge: string;
        description: string;
      };
      vaishnava_with_summary: {
        name: string;
        badge: string;
        description: string;
      };
      general_english: {
        name: string;
        badge: string;
        description: string;
      };
      custom: {
        name: string;
        badge: string;
        description: string;
      };
    };
  };
  textUploader: {
    headerPlaceholder: string;
    uploadFile: string;
    reading: string;
    paste: string;
    pasted: string;
    clear: string;
    placeholder: string;
    badgeStatus: string;
    formatsNote: string;
    wordsCount: string;
    charsCount: string;
  };
  actions: {
    startAudio: string;
    rerunAudio: string;
    translateText: string;
    retranslateText: string;
  };
  progress: {
    uploadingTitle: string;
    processingAudioTitle: string;
    transcribingTitle: string;
    translatingTitle: string;
    completedTitle: string;
    errorTitle: string;
    elapsed: string;
    transferred: string;
    step1: string;
    step2: string;
    step3: string;
    tryAgain: string;
  };
  viewer: {
    title: string;
    transcribingProgress: string;
    translatingStatus: string;
    formattingStatus: string;
    wordsCount: string;
    charsCount: string;
    readTimeMin: string;
    tabEnglish: string;
    tabRussian: string;
    tabParallel: string;
    editionRaw: string;
    editionBook: string;
    formatBookBtn: string;
    formatBookProgress: string;
    translateBtn: string;
    retranslateBtn: string;
    translatingProgress: string;
    copyBtn: string;
    copiedBtn: string;
    newLectureBtn: string;
    searchPlaceholder: string;
    showTimestamps: string;
    autoscroll: string;
    enOriginalHeader: string;
    ruTranslationHeader: string;
    cleanReadingSub: string;
    termsSub: string;
    completed100: string;
  };
  features: {
    clarityTitle: string;
    clarityDesc: string;
    translationTitle: string;
    translationDesc: string;
    exportTitle: string;
    exportDesc: string;
  };
  footer: {
    text: string;
  };
  apiKeyModal: {
    title: string;
    subtitle: string;
    statusLabel: string;
    customActive: string;
    poolActive: string;
    capacityNotice: string;
    description: string;
    inputLabel: string;
    needKey: string;
    getKeyLink: string;
    resetPool: string;
    cancel: string;
    save: string;
    saved: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    navbar: {
      title: 'VaniVoice AI',
      subtitle: 'Lecture transcription & translation',
      customKey: 'Custom API Key',
      defaultKey: 'API Key',
      switchLang: 'Русский'
    },
    hero: {
      titleMain: 'Lecture Audio Transcription',
      titleGradient: '& Book-Ready Russian Translation',
      subtitle: 'Specialized AI platform for long-form spiritual, philosophical, and academic discourses.',
      feature1Title: '1. Audio to Clean Text',
      feature1Desc: 'Transcribes lectures up to 2 hours. Automatically filters out simultaneous interpreters, restores precise Sanskrit and philosophical terms (IAST), and produces clean readable text.',
      feature2Title: '2. Text to Russian Translation',
      feature2Desc: 'Unabridged literary translation of English transcripts and Word (.docx) files. Retains 100% of content, chapter structure, scriptural verses, and book layout.'
    },
    modes: {
      audioTab: '1. Audio to Text',
      textTab: '2. Text to Russian'
    },
    audioUploader: {
      dropTitle: 'Drop your lecture audio here',
      dropSubtitle: 'Lectures up to 2 hours • MP3, M4A, WAV, AAC, OGG, WEBM, FLAC',
      formats: 'MP3, M4A, WAV, AAC, OGG, WEBM, FLAC',
      ready: 'Ready',
      replaceFile: 'Replace file'
    },
    modeSelector: {
      title: 'Transcription Settings',
      timestamps: 'Timestamps',
      timestampsOn: 'On (~5m)',
      timestampsOff: 'Off (Clean text)',
      inspectPrompt: 'Inspect Prompt',
      hidePrompt: 'Hide Prompt',
      systemPromptTitle: 'System Instructions for Gemini Engine (Customizable):',
      resetDefault: 'Reset to default',
      activeEngine: 'Active Engine',
      customScriptureLabel: 'Focus Scripture / Topic (Optional)',
      customScripturePlaceholder: 'e.g., Jaiva-dharma, Bhakti-rasāmṛta-sindhu, Bhagavad-gītā...',
      customScriptureHint: 'Prioritizes rare terms, specific verses and philosophical context from this work.',
      presets: {
        vaishnava_english: {
          name: 'Vaishnava / Vedic Lecture',
          badge: 'Recommended',
          description: 'Full Sanskrit mantras in IAST, authentic honorifics, live conversational speech and clean publication formatting.'
        },
        bilingual_split: {
          name: 'Both Speakers (Lecturer + Interpreter)',
          badge: 'Dual Speaker',
          description: 'Transcribes both voices chronologically with automatic language detection: [Lecturer (EN)] and [Interpreter].'
        },
        vaishnava_with_summary: {
          name: 'Lecture + Study Notes',
          badge: 'Study Guide',
          description: 'Provides a structured executive study guide (key verses, terms) followed by the complete verbatim transcript.'
        },
        general_english: {
          name: 'General Academic Lecture',
          badge: 'Academic',
          description: 'Standard verbatim transcription for science, academic, or general lectures. Removes foreign-language interpreter.'
        },
        custom: {
          name: 'Custom Prompt (Manual Input)',
          badge: 'Custom',
          description: 'Write your own custom instructions for special recordings.'
        }
      }
    },
    textUploader: {
      headerPlaceholder: 'Text Document or Transcript (English)',
      uploadFile: 'Upload File',
      reading: 'Reading...',
      paste: 'Paste',
      pasted: 'Pasted!',
      clear: 'Clear',
      placeholder: 'Paste your English lecture transcript here, or drag & drop a file (.docx, .txt, .md)...\n\nThe engine will produce a complete literary Russian translation with chapters, scripture verses with IAST diacritics, and export to Microsoft Word.',
      badgeStatus: 'Full Unabridged Translation',
      formatsNote: 'Supports .docx, .txt, .md',
      wordsCount: 'words',
      charsCount: 'chars'
    },
    actions: {
      startAudio: 'Start Transcription',
      rerunAudio: 'Rerun in Selected Mode',
      translateText: 'Translate to Russian',
      retranslateText: 'Translate Again'
    },
    progress: {
      uploadingTitle: 'Uploading lecture audio...',
      processingAudioTitle: 'Preparing audio stream...',
      transcribingTitle: 'Transcribing lecture...',
      translatingTitle: 'Translating transcript to Russian...',
      completedTitle: 'Processing complete!',
      errorTitle: 'An error occurred',
      elapsed: 'Elapsed:',
      transferred: 'transferred',
      step1: '1. Direct Upload',
      step2: '2. Processing',
      step3: '3. Streaming',
      tryAgain: 'Try Again'
    },
    viewer: {
      title: 'Transcript & Publication',
      transcribingProgress: 'Transcribing',
      translatingStatus: 'Translating to Russian...',
      formattingStatus: 'Formatting Book...',
      wordsCount: 'words',
      charsCount: 'chars',
      readTimeMin: 'min read',
      tabEnglish: 'English',
      tabRussian: 'Russian',
      tabParallel: 'Parallel',
      editionRaw: 'Raw Text',
      editionBook: 'Proofread Edition',
      formatBookBtn: 'Proofread & Polish',
      formatBookProgress: 'Proofreading...',
      translateBtn: 'Translate to Russian',
      retranslateBtn: 'Translate Again',
      translatingProgress: 'Translating...',
      copyBtn: 'Copy',
      copiedBtn: 'Copied!',
      newLectureBtn: 'New Lecture',
      searchPlaceholder: 'Search in text (terms, topics)...',
      showTimestamps: 'Show Timestamps',
      autoscroll: 'Autoscroll',
      enOriginalHeader: 'English Original',
      ruTranslationHeader: 'Russian Translation',
      cleanReadingSub: 'Clean Reading',
      termsSub: 'Vaishnava Terminology',
      completed100: 'Transcription 100% Complete'
    },
    features: {
      clarityTitle: 'Speaker Clarity',
      clarityDesc: 'Filters out simultaneous interpreters to deliver a clean verbatim English transcript with verified Sanskrit terms.',
      translationTitle: 'Complete Literary Translation',
      translationDesc: 'Full, unabridged Russian translation preserving theological depth, scripture verses, and IAST diacritics.',
      exportTitle: 'Word & Markdown Export',
      exportDesc: 'Download formatted Microsoft Word (.docx) and Markdown files with chapters, ready for publication.'
    },
    footer: {
      text: 'VaniVoice AI • Speech to Text & Russian Translation'
    },
    apiKeyModal: {
      title: 'API Key Configuration',
      subtitle: 'Built-in capacity & personal keys',
      statusLabel: 'Current Status:',
      customActive: 'Custom User Key Active',
      poolActive: 'Built-in Key Pool Active',
      capacityNotice: 'High-speed processing with automatic failover and rotation.',
      description: 'By default, the service uses the shared key pool. If you have your own personal Google AI Studio API key and want dedicated quota, you can enter it below.',
      inputLabel: 'Personal Gemini API Key (Optional):',
      needKey: 'Need a free key?',
      getKeyLink: 'Get free key at Google AI Studio',
      resetPool: 'Reset to Pool',
      cancel: 'Cancel',
      save: 'Save Key',
      saved: 'Saved!'
    }
  },
  ru: {
    navbar: {
      title: 'VaniVoice AI',
      subtitle: 'Транскрибация и перевод лекций',
      customKey: 'Свой API ключ',
      defaultKey: 'API ключ',
      switchLang: 'English'
    },
    hero: {
      titleMain: 'Транскрибация аудио в текст',
      titleGradient: '& Литературный перевод лекций на русский',
      subtitle: 'Специализированная нейросетевая платформа для духовных, философских и академических лекций.',
      feature1Title: '1. Аудио в чистый текст',
      feature1Desc: 'Распознавание лекций до 2 часов. Отсекает синхронных переводчиков, восстанавливает сакральную терминологию (санскрит IAST, сиддханта) и выдаёт связный текст без лишних таймкодов.',
      feature2Title: '2. Перевод текста на русский',
      feature2Desc: 'Глубокий литературный перевод английских транскриптов и файлов Word (.docx). 100% сохранение объёма без сокращений, главы, оригинальные шлоки и книжная вёрстка.'
    },
    modes: {
      audioTab: '1. Аудио в текст',
      textTab: '2. Текст на русский'
    },
    audioUploader: {
      dropTitle: 'Перетащите аудио лекции сюда',
      dropSubtitle: 'Лекции до 2 часов • MP3, M4A, WAV, AAC, OGG, WEBM, FLAC',
      formats: 'MP3, M4A, WAV, AAC, OGG, WEBM, FLAC',
      ready: 'Готов',
      replaceFile: 'Заменить файл'
    },
    modeSelector: {
      title: 'Настройки транскрибации',
      timestamps: 'Таймкоды',
      timestampsOn: 'Вкл (~5 мин)',
      timestampsOff: 'Выкл (Чистый текст)',
      inspectPrompt: 'Посмотреть промпт',
      hidePrompt: 'Скрыть промпт',
      systemPromptTitle: 'Инструкции для нейросети (Gemini):',
      resetDefault: 'Сбросить по умолчанию',
      activeEngine: 'Активный режим',
      customScriptureLabel: 'Специфика / Писание лекции (опционально)',
      customScripturePlaceholder: 'напр., Джайва-дхарма, Бхакти-расамрита-синдху, Бхагавад-гита...',
      customScriptureHint: 'Помогает ИИ распознавать редкие термины, цитаты и контекст этого произведения.',
      presets: {
        vaishnava_english: {
          name: 'Вайшнавская / Ведическая лекция',
          badge: 'Рекомендуется',
          description: 'Полные санскритские мантры в IAST, точные титулы, живая речь с юмором и чистое книжное форматирование.'
        },
        bilingual_split: {
          name: 'Оба спикера (Лектор + Переводчик)',
          badge: '2 Спикера',
          description: 'Поочерёдное распознавание обоих голосов с определением языка: [Lecturer (EN)] и [Interpreter].'
        },
        vaishnava_with_summary: {
          name: 'Лекция + Конспект',
          badge: 'Конспект + Текст',
          description: 'Структурированный аналитический конспект (ключевые шлоки, термины) и полный текст лекции.'
        },
        general_english: {
          name: 'Академическая лекция',
          badge: 'Общий',
          description: 'Стандартная дословная расшифровка академических и общих лекций. Удаляет переводчика.'
        },
        custom: {
          name: 'Свой промпт (Ручной ввод)',
          badge: 'Свой',
          description: 'Напишите свои инструкции для специфических записей.'
        }
      }
    },
    textUploader: {
      headerPlaceholder: 'Текстовый документ или расшифровка (English)',
      uploadFile: 'Загрузить файл',
      reading: 'Чтение...',
      paste: 'Вставить',
      pasted: 'Вставлено!',
      clear: 'Очистить',
      placeholder: 'Вставьте английский текст лекции или перетащите файл (.docx, .txt, .md)...\n\nСистема выполнит полный литературный перевод на русский язык с главами, цитатами шлок с IAST-диакритикой и возможностью экспорта в Microsoft Word.',
      badgeStatus: 'Полный перевод без сокращений',
      formatsNote: 'Поддерживаются форматы .docx, .txt, .md',
      wordsCount: 'слов',
      charsCount: 'символов'
    },
    actions: {
      startAudio: 'Начать транскрибацию',
      rerunAudio: 'Запустить заново',
      translateText: 'Перевести на русский',
      retranslateText: 'Перевести заново'
    },
    progress: {
      uploadingTitle: 'Загрузка аудио лекции...',
      processingAudioTitle: 'Подготовка аудиопотока...',
      transcribingTitle: 'Распознавание лекции...',
      translatingTitle: 'Перевод транскрипта на русский...',
      completedTitle: 'Обработка завершена!',
      errorTitle: 'Произошла ошибка',
      elapsed: 'Прошло:',
      transferred: 'передано',
      step1: '1. Загрузка',
      step2: '2. Обработка',
      step3: '3. Поток',
      tryAgain: 'Повторить'
    },
    viewer: {
      title: 'Транскрипт и перевод',
      transcribingProgress: 'Распознавание',
      translatingStatus: 'Перевод на русский...',
      formattingStatus: 'Вёрстка книги...',
      wordsCount: 'слов',
      charsCount: 'символов',
      readTimeMin: 'мин чтения',
      tabEnglish: 'Английский',
      tabRussian: 'Русский',
      tabParallel: 'Параллельный',
      editionRaw: 'Сырой текст',
      editionBook: 'Вычитанный вид',
      formatBookBtn: 'Вычитка редактором',
      formatBookProgress: 'Вычитка текста...',
      translateBtn: 'Перевести на русский',
      retranslateBtn: 'Перевести заново',
      translatingProgress: 'Перевод...',
      copyBtn: 'Копировать',
      copiedBtn: 'Скопировано!',
      newLectureBtn: 'Новая лекция',
      searchPlaceholder: 'Поиск по тексту (термины, темы)...',
      showTimestamps: 'Показывать таймкоды',
      autoscroll: 'Автопрокрутка',
      enOriginalHeader: 'Английский оригинал',
      ruTranslationHeader: 'Русский перевод',
      cleanReadingSub: 'Чистый текст',
      termsSub: 'Вайшнавская терминология',
      completed100: 'Распознавание завершено'
    },
    features: {
      clarityTitle: 'Чистая речь лектора',
      clarityDesc: 'Отсекает синхронных переводчиков и выдаёт чистый английский текст с выверенными санскритскими терминами.',
      translationTitle: 'Полный литературный перевод',
      translationDesc: 'Литературный русский перевод без сокращений, с сохранением сиддханты, шлок и диакритики IAST.',
      exportTitle: 'Экспорт в Word и Markdown',
      exportDesc: 'Скачивание готового файла Microsoft Word (.docx) или Markdown со структурированными главами для публикации.'
    },
    footer: {
      text: 'VaniVoice AI • Распознавание речи и перевод на русский язык'
    },
    apiKeyModal: {
      title: 'Настройка API ключа',
      subtitle: 'Встроенный пул и персональные ключи',
      statusLabel: 'Текущий статус:',
      customActive: 'Активен личный ключ',
      poolActive: 'Активен встроенный пул ключей',
      capacityNotice: 'Высокая скорость обработки с авто-ротацией ключей.',
      description: 'По умолчанию сервис работает через встроенный пул ключей. Если у вас есть личный ключ Google AI Studio, вы можете указать его ниже.',
      inputLabel: 'Личный ключ Gemini API (опционально):',
      needKey: 'Нужен бесплатный ключ?',
      getKeyLink: 'Получить ключ в Google AI Studio',
      resetPool: 'Сбросить на общий пул',
      cancel: 'Отмена',
      save: 'Сохранить ключ',
      saved: 'Сохранено!'
    }
  }
};
