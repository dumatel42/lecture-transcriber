/**
 * Client-Side Microsoft Word (.docx) Export Engine
 * Generates beautifully styled, publication-ready documents directly in the browser.
 * Features:
 * - Publication-grade Georgia typography
 * - Thematic chapter headings with timestamps
 * - Styled Sanskrit verse callout blocks (with tinted background and amber left border)
 * - Metadata header (Title, Speaker, Date, Audio Source)
 * - Indented bullet lists for philosophical attributes
 * - 100% client-side (Zero server payload, works offline, instant download)
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  BorderStyle,
  ShadingType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  PageOrientation,
  AlignmentType
} from 'docx';

export interface DocxExportOptions {
  fileName: string;
  activeTab?: 'english' | 'russian' | 'bilingual';
  englishTranscript?: string;
  russianTranslation?: string;
}

/**
 * Parses inline markdown like **bold**, *italic*, ***bold-italic***
 */
function parseInlineRuns(text: string, baseColor = '1E293B', isQuote = false): TextRun[] {
  const runs: TextRun[] = [];
  const pattern = /(\*\*\*.*?\*\*\*|\*\*.*?\*\*|\*.*?\*|_.*?_|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const plainText = text.substring(lastIndex, match.index);
      runs.push(
        new TextRun({
          text: plainText,
          font: 'Georgia',
          size: isQuote ? 21 : 22,
          color: baseColor,
          italics: isQuote
        })
      );
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('***') && matchedStr.endsWith('***')) {
      runs.push(
        new TextRun({
          text: matchedStr.slice(3, -3),
          font: 'Georgia',
          size: isQuote ? 21 : 22,
          bold: true,
          italics: true,
          color: baseColor
        })
      );
    } else if (matchedStr.startsWith('**') && matchedStr.endsWith('**')) {
      runs.push(
        new TextRun({
          text: matchedStr.slice(2, -2),
          font: 'Georgia',
          size: isQuote ? 21 : 22,
          bold: true,
          italics: isQuote,
          color: baseColor
        })
      );
    } else if ((matchedStr.startsWith('*') && matchedStr.endsWith('*')) || (matchedStr.startsWith('_') && matchedStr.endsWith('_'))) {
      runs.push(
        new TextRun({
          text: matchedStr.slice(1, -1),
          font: 'Georgia',
          size: isQuote ? 21 : 22,
          italics: true,
          color: baseColor
        })
      );
    } else if (matchedStr.startsWith('`') && matchedStr.endsWith('`')) {
      runs.push(
        new TextRun({
          text: matchedStr.slice(1, -1),
          font: 'Consolas',
          size: 20,
          color: '9A3412',
          shading: {
            type: ShadingType.CLEAR,
            fill: 'F1F5F9'
          }
        })
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    runs.push(
      new TextRun({
        text: text.substring(lastIndex),
        font: 'Georgia',
        size: isQuote ? 21 : 22,
        color: baseColor,
        italics: isQuote
      })
    );
  }

  return runs.length > 0
    ? runs
    : [
        new TextRun({
          text,
          font: 'Georgia',
          size: isQuote ? 21 : 22,
          color: baseColor,
          italics: isQuote
        })
      ];
}

/**
 * Converts formatted markdown lines into structured docx Paragraphs
 */
function markdownToDocxParagraphs(markdownText: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = markdownText.split('\n');

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 1. Divider / Separator line
    if (/^={5,}|^-{3,}|^\*{3,}$/.test(trimmed)) {
      i++;
      continue;
    }

    // 2. Metadata Lines (English & Russian)
    const isMetaTitle = trimmed.startsWith('LECTURE TITLE:') || trimmed.startsWith('НАЗВАНИЕ ЛЕКЦИИ:');
    const isMetaSubtitle = trimmed.startsWith('SUBTITLE:') || trimmed.startsWith('ПОДЗАГОЛОВОК:');
    const isOtherMeta =
      trimmed.startsWith('SPEAKER:') || trimmed.startsWith('ДОКЛАДЧИК:') ||
      trimmed.startsWith('DATE:') || trimmed.startsWith('ДАТА:') ||
      trimmed.startsWith('VENUE:') || trimmed.startsWith('МЕСТО:') ||
      trimmed.startsWith('SOURCE FILE:') || trimmed.startsWith('ИСТОЧНИК:') ||
      trimmed.startsWith('ПОЛНЫЙ ПЕРЕВОД') || trimmed.startsWith('VERBATIM TRANSCRIPT') ||
      trimmed.startsWith('Spark Edition') || trimmed.startsWith('Версия Spark');

    if (isMetaTitle || isMetaSubtitle || isOtherMeta) {
      const colonIdx = trimmed.indexOf(':');
      const label = colonIdx !== -1 ? trimmed.substring(0, colonIdx + 1) : '';
      const val = colonIdx !== -1 ? trimmed.substring(colonIdx + 1).trim() : trimmed;

      if (isMetaTitle) {
        paragraphs.push(
          new Paragraph({
            heading: HeadingLevel.TITLE,
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({
                text: val,
                bold: true,
                size: 36, // 18pt
                color: '7C2D12',
                font: 'Georgia'
              })
            ]
          })
        );
      } else if (isMetaSubtitle) {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 0, after: 240 },
            children: [
              new TextRun({
                text: val,
                italics: true,
                size: 24, // 12pt
                color: '475569',
                font: 'Georgia'
              })
            ]
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              ...(label ? [
                new TextRun({
                  text: `${label} `,
                  bold: true,
                  size: 20, // 10pt
                  color: '64748B',
                  font: 'Georgia'
                })
              ] : []),
              new TextRun({
                text: val,
                size: 20,
                color: '334155',
                font: 'Georgia'
              })
            ]
          })
        );
      }
      i++;
      continue;
    }

    // 3. Main Headings: # Heading 1
    if (trimmed.startsWith('# ') && !trimmed.startsWith('## ')) {
      const headingText = trimmed.replace(/^#\s+/, '');
      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 180 },
          children: [
            new TextRun({
              text: headingText,
              bold: true,
              size: 32,
              color: '7C2D12',
              font: 'Georgia'
            })
          ]
        })
      );
      i++;
      continue;
    }

    // 4. Chapter Headings with Timestamps:
    // [HH:MM:SS] TITLE or ## [HH:MM:SS] TITLE or HH:MM:SS TITLE
    const timestampHeadingMatch = trimmed.match(/^(?:##\s+)?(\[?\d{1,2}:\d{2}(?::\d{2})?\]?)\s*(.*)$/);
    if (timestampHeadingMatch && (timestampHeadingMatch[1].startsWith('[') || timestampHeadingMatch[2].length > 0 || (i + 1 < lines.length && lines[i + 1].trim().length > 0))) {
      let timestamp = timestampHeadingMatch[1];
      if (!timestamp.startsWith('[')) timestamp = `[${timestamp}]`;
      let title = timestampHeadingMatch[2] || '';

      // If timestamp is on its own line, consume the next line as heading title
      if (!title && i + 1 < lines.length && lines[i + 1].trim() && !lines[i + 1].trim().startsWith('[')) {
        i++;
        title = lines[i].trim();
      }

      paragraphs.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 360, after: 140 },
          children: [
            new TextRun({
              text: `${timestamp} `,
              bold: true,
              size: 22,
              color: 'B45309', // Amber-700
              font: 'Georgia'
            }),
            new TextRun({
              text: title,
              bold: true,
              size: 24,
              color: '1E293B',
              font: 'Georgia'
            })
          ]
        })
      );
      i++;
      continue;
    }

    // 5. Blockquotes / Sanskrit Verses (Lines starting with >)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const cleanQuoteLine = lines[i].trim().replace(/^>\s*/, '');
        quoteLines.push(cleanQuoteLine);
        i++;
      }

      quoteLines.forEach((qLine, idx) => {
        const isAttribution = qLine.startsWith('—') || qLine.startsWith('--');
        paragraphs.push(
          new Paragraph({
            border: {
              left: {
                color: 'D97706',
                space: 14,
                style: BorderStyle.SINGLE,
                size: 24
              }
            },
            shading: {
              type: ShadingType.CLEAR,
              fill: 'FAF7F2'
            },
            indent: { left: 400, right: 300 },
            spacing: {
              before: idx === 0 ? 140 : 40,
              after: idx === quoteLines.length - 1 ? 160 : 40,
              line: 280
            },
            children: parseInlineRuns(
              qLine,
              isAttribution ? '78350F' : '1E293B',
              !isAttribution
            )
          })
        );
      });
      continue;
    }

    // 6. Bullet Points (Lines starting with •, -, *)
    if (/^[•\-\*]\s+/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^[•\-\*]\s+/, '');
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 60, after: 60, line: 276 },
          children: parseInlineRuns(bulletContent)
        })
      );
      i++;
      continue;
    }

    // 7. Standard Body Paragraphs
    const bodyTimestampMatch = trimmed.match(/^(\[\d{1,2}:\d{2}(?::\d{2})?\])\s*(.*)$/);
    if (bodyTimestampMatch) {
      const timestamp = bodyTimestampMatch[1];
      const rest = bodyTimestampMatch[2];
      paragraphs.push(
        new Paragraph({
          spacing: { before: 120, after: 160, line: 280 },
          children: [
            new TextRun({
              text: `${timestamp} `,
              bold: true,
              size: 20,
              color: 'B45309',
              font: 'Georgia'
            }),
            ...parseInlineRuns(rest)
          ]
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          spacing: { before: 80, after: 160, line: 280 },
          children: parseInlineRuns(trimmed)
        })
      );
    }

    i++;
  }

  return paragraphs;
}

/**
 * Builds and downloads a professional Word (.docx) document
 */
export async function downloadDocxTranscript(options: DocxExportOptions): Promise<void> {
  const { fileName, activeTab = 'english', englishTranscript = '', russianTranslation = '' } = options;
  const baseName = fileName.replace(/\.[^/.]+$/, '');

  if (activeTab === 'bilingual' || (englishTranscript && russianTranslation && activeTab !== 'russian')) {
    const enBlocks = englishTranscript.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const ruBlocks = russianTranslation.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const maxRows = Math.max(enBlocks.length, ruBlocks.length);

    const titleParas = [
      new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { before: 100, after: 80 },
        children: [
          new TextRun({
            text: `${baseName}`,
            bold: true,
            size: 32,
            color: '1E3A8A',
            font: 'Georgia'
          })
        ]
      }),
      new Paragraph({
        spacing: { before: 0, after: 200 },
        children: [
          new TextRun({
            text: 'Parallel Bilingual Edition: Verbatim English Discourse & Canonical Russian Translation (Vedabase.io Standard)',
            italics: true,
            size: 19,
            color: '64748B',
            font: 'Georgia'
          })
        ]
      })
    ];

    const tableRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'ORIGINAL VERBATIM ENGLISH DISCOURSE',
                    bold: true,
                    size: 20,
                    color: 'FFFFFF',
                    font: 'Georgia'
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: '1E3A8A', type: ShadingType.CLEAR },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: 'ПОЛНЫЙ ДОСЛОВНЫЙ ПЕРЕВОД (VEDABASE.IO)',
                    bold: true,
                    size: 20,
                    color: 'FFFFFF',
                    font: 'Georgia'
                  })
                ]
              })
            ]
          })
        ]
      })
    ];

    for (let idx = 0; idx < maxRows; idx++) {
      const enText = enBlocks[idx] || '';
      const ruText = ruBlocks[idx] || '';
      const isHeader =
        enText.startsWith('#') ||
        ruText.startsWith('#') ||
        enText.startsWith('[') ||
        ruText.startsWith('[') ||
        enText.startsWith('Part') ||
        ruText.startsWith('Часть');

      const enParas = markdownToDocxParagraphs(enText);
      const ruParas = markdownToDocxParagraphs(ruText);

      tableRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: isHeader ? { fill: 'FEF3C7', type: ShadingType.CLEAR } : undefined,
              children: enParas.length > 0 ? enParas : [new Paragraph('')]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              shading: isHeader ? { fill: 'FEF3C7', type: ShadingType.CLEAR } : undefined,
              children: ruParas.length > 0 ? ruParas : [new Paragraph('')]
            })
          ]
        })
      );
    }

    const bilingualTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows
    });

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Georgia', size: 21, color: '1E293B' },
            paragraph: { spacing: { line: 260, after: 100 } }
          }
        }
      },
      sections: [
        {
          properties: {
            page: {
              size: { orientation: PageOrientation.LANDSCAPE },
              margin: { top: 900, right: 900, bottom: 900, left: 900 }
            }
          },
          children: [...titleParas, bilingualTable]
        }
      ]
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseName}_bilingual.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  const paragraphs = activeTab === 'russian'
    ? markdownToDocxParagraphs(russianTranslation)
    : markdownToDocxParagraphs(englishTranscript);

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Georgia',
            size: 22,
            color: '1E293B'
          },
          paragraph: {
            spacing: { line: 280, after: 140 }
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: paragraphs
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${baseName}_${activeTab}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
