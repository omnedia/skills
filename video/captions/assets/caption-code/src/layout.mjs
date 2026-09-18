// Pure, frame-independent layout and timeline mechanics shared by tests and renderer.
export function layoutSentences(sentences, measure, maxWidth) {
  const segments = [];
  for (const sentence of sentences) {
    let pending = [...sentence.words];
    while (pending.length) {
      const lines = [];
      for (let line = 0; line < 2 && pending.length; line++) {
        let count = 0;
        while (count < pending.length && measure(pending.slice(0, count + 1).map(w => w.text.replace(/\s+/gu, ' ')).join('').trim()) <= maxWidth) count++;
        if (!count) throw new Error(`Word exceeds safe width: ${pending[0].text}. Use a smaller project fontSize or review segmentation.`);
        // Prefer an actual phrase boundary near the end of a full block.
        if (line === 1 && count < pending.length) {
          for (let i = count - 1; i >= Math.floor(count / 2); i--) {
            if (/[,;:.!?][”"')]*\s*$/.test(pending[i].text)) { count = i + 1; break; }
          }
        }
        lines.push(pending.splice(0, count));
      }
      const words = lines.flat();
      segments.push({lines, startMs: words[0].startMs, endMs: words.at(-1).endMs});
    }
  }
  return segments;
}

export function segmentState(segments, timeMs, fadeMs = 120) {
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const nextStart = segments[i + 1]?.startMs ?? Infinity;
    const tail = Math.max(0, Math.min(fadeMs, nextStart - segment.endMs));
    if (timeMs < segment.startMs || timeMs >= segment.endMs + tail) continue;
    const intro = Math.min(fadeMs, (segment.endMs - segment.startMs) / 2);
    const opacity = timeMs < segment.endMs
      ? Math.min(1, (timeMs - segment.startMs) / Math.max(1, intro))
      : 1 - (timeMs - segment.endMs) / tail;
    return {segment, opacity, active: segment.lines.flat().find(w => timeMs >= w.startMs && timeMs < w.endMs) ?? null};
  }
  return null;
}
