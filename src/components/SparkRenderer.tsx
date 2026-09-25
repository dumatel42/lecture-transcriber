import React from 'react';
import { Quote, Clock, BookOpen, User, Calendar, MapPin, Sparkles } from 'lucide-react';

interface SparkRendererProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Renders inline markdown: **bold**, *italic*, `code`
 */
function renderInlineContent(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|_.*?_|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const matchedStr = match[0];
    const key = `inline-${lastIndex}-${match.index}`;

    if (matchedStr.startsWith('***') && matchedStr.endsWith('***')) {
      parts.push(
        <strong key={key} className="font-bold italic text-amber-200">
          {matchedStr.slice(3, -3)}
        </strong>
      );
    } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      parts.push(
        <strong key={key} className="font-semibold text-slate-100">
          {matchedStr.slice(2, -2)}
        </strong>
      );
    } else if ((matchedStr.startsWith('*') && matchedStr.endsWith('*')) || (matchedStr.startsWith('_') && matchedStr.endsWith('_'))) {
      parts.push(
        <em key={key} className="italic text-amber-300/90 font-serif">
          {matchedStr.slice(1, -1)}
        </em>
      );
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      parts.push(
        <code key={key} className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 text-xs font-mono">
          {matchedStr.slice(1, -1)}
        </code>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export const SparkRenderer: React.FC<SparkRendererProps> = ({ content, isStreaming }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let i = 0;
  let metaCard: { [key: string]: string } = {};
  let hasMeta = false;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // Divider line
    if (/^={5,}|^-{3,}|^\*{3,}$/.test(trimmed)) {
      if (Object.keys(metaCard).length > 0 && !hasMeta) {
        hasMeta = true;
        elements.push(
          <div
            key={`meta-card-${i}`}
            className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/20 shadow-xl mb-6 space-y-2.5"
          >
            {metaCard['TITLE'] && (
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-amber-300 tracking-tight">
                {metaCard['TITLE']}
              </h2>
            )}
            {metaCard['SUBTITLE'] && (
              <p className="text-sm text-slate-300 italic font-serif leading-relaxed">
                {metaCard['SUBTITLE']}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-400 border-t border-amber-500/10">
              {metaCard['SPEAKER'] && (
                <span className="flex items-center gap-1.5 font-medium text-amber-400/90">
                  <User className="w-3.5 h-3.5" />
                  <span>{metaCard['SPEAKER']}</span>
                </span>
              )}
              {metaCard['DATE'] && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{metaCard['DATE']}</span>
                </span>
              )}
              {metaCard['VENUE'] && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{metaCard['VENUE']}</span>
                </span>
              )}
              <span className="ml-auto inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono">
                <Sparkles className="w-3 h-3" /> Spark Edition
              </span>
            </div>
          </div>
        );
        metaCard = {};
      }
      i++;
      continue;
    }

    // Metadata lines (English & Russian)
    if (trimmed.startsWith('LECTURE TITLE:') || trimmed.startsWith('НАЗВАНИЕ ЛЕКЦИИ:')) {
      metaCard['TITLE'] = trimmed.replace(/^(?:LECTURE TITLE:|НАЗВАНИЕ ЛЕКЦИИ:)/, '').trim();
      i++;
      continue;
    }
    if (trimmed.startsWith('SUBTITLE:') || trimmed.startsWith('ПОДЗАГОЛОВОК:')) {
      metaCard['SUBTITLE'] = trimmed.replace(/^(?:SUBTITLE:|ПОДЗАГОЛОВОК:)/, '').trim();
      i++;
      continue;
    }
    if (trimmed.startsWith('SPEAKER:') || trimmed.startsWith('ДОКЛАДЧИК:')) {
      metaCard['SPEAKER'] = trimmed.replace(/^(?:SPEAKER:|ДОКЛАДЧИК:)/, '').trim();
      i++;
      continue;
    }
    if (trimmed.startsWith('DATE:') || trimmed.startsWith('ДАТА:')) {
      metaCard['DATE'] = trimmed.replace(/^(?:DATE:|ДАТА:)/, '').trim();
      i++;
      continue;
    }
    if (trimmed.startsWith('VENUE:') || trimmed.startsWith('МЕСТО:')) {
      metaCard['VENUE'] = trimmed.replace(/^(?:VENUE:|МЕСТО:)/, '').trim();
      i++;
      continue;
    }

    // Heading 1 (# Heading)
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      elements.push(
        <h2
          key={`h1-${i}`}
          className="text-xl sm:text-2xl font-serif font-bold text-amber-400 pt-6 pb-2 border-b border-slate-800 tracking-wide"
        >
          {trimmed.replace(/^#\s+/, '')}
        </h2>
      );
      i++;
      continue;
    }

    // Chapter Headings with Timestamps: ## [HH:MM:SS] TITLE or [HH:MM:SS] TITLE (English & Russian)
    const headingMatch = trimmed.match(/^(?:##\s+)?(\[?\d{1,2}:\d{2}(?::\d{2})?\]?)\s*(.*)$/);
    if (headingMatch && (headingMatch[1].startsWith('[') || headingMatch[2].length > 0 || (i + 1 < lines.length && lines[i + 1].trim().length > 0))) {
      let timestamp = headingMatch[1];
      if (!timestamp.startsWith('[')) timestamp = `[${timestamp}]`;
      let title = headingMatch[2] || '';

      if (!title && i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].trim().startsWith('[')) {
        i++;
        title = lines[i].trim();
      }

      const isHeadingCandidate =
        trimmed.startsWith('##') ||
        (title.length > 0 && (title === title.toUpperCase() || /^[\p{Lu}0-9\s:—\-,'()]+$/u.test(title)));

      if (isHeadingCandidate && title.length > 0) {
        elements.push(
          <div key={`chapter-${i}`} className="pt-6 pb-2 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Clock className="w-3 h-3 text-amber-400" />
                {timestamp.replace(/[\[\]]/g, '')}
              </span>
              <h3 className="font-serif font-bold text-slate-100 text-base sm:text-lg tracking-wide">
                {title}
              </h3>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-amber-500/30 via-slate-800 to-transparent" />
          </div>
        );
        i++;
        continue;
      }
    }

    // Blockquote / Sanskrit Verses
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }

      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-4 pl-4 pr-3 py-3 rounded-r-xl border-l-4 border-amber-500 bg-amber-500/5 text-amber-100/90 font-serif space-y-1 shadow-sm"
        >
          {quoteLines.map((qLine, qIdx) => {
            const isRef = qLine.startsWith('—') || qLine.startsWith('--');
            return (
              <div
                key={`q-${qIdx}`}
                className={isRef ? 'text-xs text-amber-400 font-sans font-semibold pt-1' : 'italic leading-relaxed text-sm'}
              >
                {renderInlineContent(qLine)}
              </div>
            );
          })}
        </blockquote>
      );
      continue;
    }

    // Bullet points
    if (/^[•\-\*]\s+/.test(trimmed)) {
      const bulletText = trimmed.replace(/^[•\-\*]\s+/, '');
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-2.5 my-1.5 pl-2 text-sm leading-relaxed text-slate-200">
          <span className="text-amber-400 font-bold select-none">•</span>
          <div>{renderInlineContent(bulletText)}</div>
        </div>
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-sm leading-relaxed text-slate-200 font-sans my-2.5">
        {renderInlineContent(trimmed)}
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-1 prose-print">
      {elements}
      {isStreaming && (
        <span className="inline-block w-2.5 h-4 ml-1 bg-amber-400 animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
};
