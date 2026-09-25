/**
 * Pure JavaScript MPEG Audio Layer III (MP3) Frame Parser & Slicer.
 * Runs in browser and Node without any external dependencies or memory overhead.
 * Splits an MP3 File/Blob into clean, valid standalone MP3 Files along frame boundaries.
 */

export interface AudioChunk {
  file: File;
  index: number;
  totalChunks: number;
  startSec: number;
  endSec: number;
  timeRangeLabel: string;
}

function parseMpegFrameHeader(buf: Uint8Array, offset: number) {
  if (offset + 4 > buf.length) return null;
  // Sync word: 11 bits set (0xFF, upper 3 bits of byte 1)
  if (buf[offset] !== 0xFF || (buf[offset + 1] & 0xE0) !== 0xE0) return null;

  const versionBits = (buf[offset + 1] >> 3) & 3; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
  const hasPadding = (buf[offset + 2] >> 1) & 1;
  const bitrateIdx = (buf[offset + 2] >> 4) & 0x0F;
  const sampleRateIdx = (buf[offset + 2] >> 2) & 3;

  // MPEG-1 Layer 3 Bitrates (kbps)
  const bitratesMpeg1L3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
  // MPEG-2 / 2.5 Layer 3 Bitrates
  const bitratesMpeg2L3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
  
  const sampleRatesMpeg1 = [44100, 48000, 32000, 0];
  const sampleRatesMpeg2 = [22050, 24000, 16000, 0];
  const sampleRatesMpeg25 = [11025, 12000, 8000, 0];

  let bitrate = 0;
  let sampleRate = 0;

  if (versionBits === 3) {
    bitrate = (bitratesMpeg1L3[bitrateIdx] || 0) * 1000;
    sampleRate = sampleRatesMpeg1[sampleRateIdx] || 0;
  } else if (versionBits === 2) {
    bitrate = (bitratesMpeg2L3[bitrateIdx] || 0) * 1000;
    sampleRate = sampleRatesMpeg2[sampleRateIdx] || 0;
  } else if (versionBits === 0) {
    bitrate = (bitratesMpeg2L3[bitrateIdx] || 0) * 1000;
    sampleRate = sampleRatesMpeg25[sampleRateIdx] || 0;
  }

  if (!bitrate || !sampleRate) return null;

  const samplesPerFrame = versionBits === 3 ? 1152 : 576;
  const frameLength = Math.floor(((samplesPerFrame / 8) * bitrate) / sampleRate) + hasPadding;
  const durationSec = samplesPerFrame / sampleRate;

  return { frameLength, durationSec };
}

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${remM.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Slices an audio file into chunks safely below `maxChunkBytes` (default: 2.2 MB for Vercel Edge limit & inline base64)
 * and approx `targetChunkSec` (default: 10 minutes = 600s).
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export async function sliceMp3FileIntoChunks(
  file: File,
  targetChunkSec: number = 10 * 60,
  maxChunkBytes: number = 2.2 * 1024 * 1024
): Promise<AudioChunk[]> {
  const isMp3 = file.name.toLowerCase().endsWith('.mp3') || file.type === 'audio/mp3' || file.type === 'audio/mpeg';
  if (!isMp3) {
    if (file.size <= maxChunkBytes) {
      return [{
        file,
        index: 1,
        totalChunks: 1,
        startSec: 0,
        endSec: 0,
        timeRangeLabel: 'Full Audio'
      }];
    }
    try {
      return await sliceGenericAudioViaWebAudio(file, targetChunkSec, maxChunkBytes);
    } catch (err) {
      console.warn('WebAudio decoding unavailable or failed, returning original file:', err);
      return [{
        file,
        index: 1,
        totalChunks: 1,
        startSec: 0,
        endSec: 0,
        timeRangeLabel: 'Full Audio'
      }];
    }
  }

  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  let offset = 0;
  if (bytes.length > 10 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const id3Size = ((bytes[6] & 0x7F) << 21) |
                    ((bytes[7] & 0x7F) << 14) |
                    ((bytes[8] & 0x7F) << 7) |
                    (bytes[9] & 0x7F);
    offset = 10 + id3Size;
  }

  interface FrameInfo {
    offset: number;
    length: number;
    duration: number;
  }
  const frames: FrameInfo[] = [];
  let totalDuration = 0;
  let scanOffset = offset;

  while (scanOffset < bytes.length) {
    const frame = parseMpegFrameHeader(bytes, scanOffset);
    if (!frame) {
      scanOffset++;
      continue;
    }
    frames.push({ offset: scanOffset, length: frame.frameLength, duration: frame.durationSec });
    totalDuration += frame.durationSec;
    scanOffset += frame.frameLength;
  }

  if ((file.size <= maxChunkBytes && totalDuration <= targetChunkSec) || frames.length === 0) {
    return [{
      file,
      index: 1,
      totalChunks: 1,
      startSec: 0,
      endSec: Math.round(totalDuration),
      timeRangeLabel: `Full Audio (00:00 - ${formatTime(totalDuration)})`
    }];
  }

  const rawChunks: { startOffset: number; endOffset: number; startSec: number; endSec: number }[] = [];
  let currentChunkStartOffset = frames[0].offset;
  let currentChunkStartSec = 0;
  let accumulatedSec = 0;
  let accumulatedBytes = 0;

  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    accumulatedSec += f.duration;
    accumulatedBytes += f.length;

    const isLastFrame = i === frames.length - 1;
    if (accumulatedBytes >= maxChunkBytes || accumulatedSec >= targetChunkSec || isLastFrame) {
      const endOffset = f.offset + f.length;
      const endSec = currentChunkStartSec + accumulatedSec;
      rawChunks.push({
        startOffset: currentChunkStartOffset,
        endOffset,
        startSec: Math.round(currentChunkStartSec),
        endSec: Math.round(endSec)
      });

      if (!isLastFrame && i + 1 < frames.length) {
        currentChunkStartOffset = frames[i + 1].offset;
        currentChunkStartSec = endSec;
        accumulatedSec = 0;
        accumulatedBytes = 0;
      }
    }
  }

  const result: AudioChunk[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  for (let idx = 0; idx < rawChunks.length; idx++) {
    const c = rawChunks[idx];
    const chunkBytes = bytes.subarray(c.startOffset, c.endOffset);
    const chunkBlob = new Blob([chunkBytes], { type: 'audio/mp3' });
    const chunkFile = new File([chunkBlob], `${baseName}_part${idx + 1}.mp3`, { type: 'audio/mp3' });

    result.push({
      file: chunkFile,
      index: idx + 1,
      totalChunks: rawChunks.length,
      startSec: c.startSec,
      endSec: c.endSec,
      timeRangeLabel: `${formatTime(c.startSec)} - ${formatTime(c.endSec)}`
    });
  }

  return result;
}

async function sliceGenericAudioViaWebAudio(
  file: File,
  targetChunkSec: number,
  maxChunkBytes: number
): Promise<AudioChunk[]> {
  const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null;
  if (!AudioContextClass) {
    return [{ file, index: 1, totalChunks: 1, startSec: 0, endSec: 0, timeRangeLabel: 'Full Audio' }];
  }

  const audioCtx = new AudioContextClass({ sampleRate: 16000 });
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  const sampleRate = audioBuffer.sampleRate;
  const channelData = audioBuffer.getChannelData(0);
  const totalSec = audioBuffer.duration;

  // 16kHz 16-bit mono = 32,000 bytes/sec
  const maxSecPerChunk = Math.min(targetChunkSec, Math.max(60, Math.floor((maxChunkBytes - 44) / (sampleRate * 2))));
  const chunks: AudioChunk[] = [];
  const baseName = file.name.replace(/\.[^/.]+$/, '');

  let currentStartSec = 0;
  let chunkIndex = 1;
  const totalChunks = Math.ceil(totalSec / maxSecPerChunk);

  while (currentStartSec < totalSec) {
    const currentEndSec = Math.min(currentStartSec + maxSecPerChunk, totalSec);
    const startSample = Math.floor(currentStartSec * sampleRate);
    const endSample = Math.min(Math.floor(currentEndSec * sampleRate), channelData.length);
    const sliceSamples = channelData.subarray(startSample, endSample);

    const wavBlob = encodeMonoWav(sliceSamples, sampleRate);
    const chunkFile = new File([wavBlob], `${baseName}_part${chunkIndex}.wav`, { type: 'audio/wav' });

    chunks.push({
      file: chunkFile,
      index: chunkIndex,
      totalChunks,
      startSec: Math.round(currentStartSec),
      endSec: Math.round(currentEndSec),
      timeRangeLabel: `${formatTime(currentStartSec)} - ${formatTime(currentEndSec)}`
    });

    currentStartSec = currentEndSec;
    chunkIndex++;
  }

  try {
    await audioCtx.close();
  } catch {}

  return chunks;
}

function encodeMonoWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeAscii(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeAscii(view, 8, 'WAVE');

  // fmt sub-chunk
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * 1 * 2)
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // 16 bits per sample

  // data sub-chunk
  writeAscii(view, 36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeAscii(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
