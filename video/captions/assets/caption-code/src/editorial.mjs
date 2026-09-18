// Pure layout: measure every group before any word is revealed. Indices are local
// to the reviewed phrase; spelling is never used as identity.
const clamp = value => Math.max(0, Math.min(1, value));
const directions = {left: [-1, 0], right: [1, 0], top: [0, -1], bottom: [0, 1]};
export function underlineMetrics(treatment, scale) {
  const thickness = (treatment === 'orange' ? 12 : 5) * scale;
  const gap = 14 * scale;
  const curve = treatment === 'white' ? 4 * scale : 0;
  return {thickness, gap, curve, extraHeight: gap + thickness + curve / 2};
}
export function editorialLayout(sentences, measure, width, height, options = {}) {
  const scale = Math.min(width, height) / 1080;
  const travel = (options.travel ?? 28) * scale;
  const padding = travel + 12 * scale;
  const available = width * .84 - padding * 2;
  const minFitScale = options.minFitScale ?? .65;
  if (available <= 0 || !Number.isFinite(minFitScale) || minFitScale <= 0 || minFitScale > 1) throw Error('Invalid safe width or minFitScale');
  const sizes = {primary: 128, sans: 76, serif: 86, handwritten: 76, ...options.sizes};
  if (!Number.isFinite(travel) || travel < 0 || Object.values(sizes).some(s => !Number.isFinite(s) || s <= 0)) throw Error('Invalid Editorial Kinetic sizes or travel');
  const center = options.centerRatio ?? .60;
  if (!Number.isFinite(center) || center <= 0 || center >= 1) throw Error('Invalid centerRatio');
  return sentences.flatMap((sentence, phraseIndex) => {
    const words = sentence.words;
    if (!words.length) return [];
    const design = options.phrases?.[phraseIndex] ?? {};
    const focus = design.emphasisIndex ?? words.length - 1;
    if (!Number.isInteger(focus) || focus < 0 || focus >= words.length) throw Error('Invalid emphasisIndex');
    // Three stable headline templates: kicker/title, title/deck, or sandwich.
    const template = focus === 0 ? 'title-deck' : focus === words.length - 1 ? 'kicker-title' : 'sandwich';
    const lines = design.lines ?? [
      ...(focus ? [{count: focus, role: focus <= 3 ? 'serif' : 'sans'}] : []),
      {count: 1, role: 'primary'},
      ...(focus < words.length - 1 ? [{count: words.length - focus - 1, role: 'sans'}] : []),
    ];
    if (!lines.length || lines.length > 3 || lines.some(l => !Number.isInteger(l.count) || l.count < 1 || !(l.role in sizes)) || lines.reduce((n, l) => n + l.count, 0) !== words.length) throw Error('Phrase lines must cover all words in order, using at most three lines');
    const gradient = design.gradient ?? 'cream';
    const underline = design.underline ?? 'none';
    if (!['cream', 'pink', 'none'].includes(gradient) || !['orange', 'white', 'none'].includes(underline)) throw Error('Invalid gradient or underline');
    if (design.groupSizes && (design.groupSizes.some(n => !Number.isInteger(n) || n < 1 || n > 3) || design.groupSizes.reduce((a,b) => a+b, 0) !== words.length)) throw Error('groupSizes must partition the phrase into groups of 1–3');
    const groupEnds = new Set();
    let boundary = 0;
    for (const count of design.groupSizes ?? []) {boundary += count; groupEnds.add(boundary);}
    let index = 0;
    const rows = lines.map((line, rowIndex) => {
      const start = index, end = index + line.count;
      const groups = [];
      while (index < end) {
        const from = index++;
        if (design.groupSizes) {
          while (!groupEnds.has(index) && index < end) index++;
          if (!groupEnds.has(index)) throw Error('Entrance groups cannot cross a line boundary');
        } else if (line.count <= 3 && line.role !== 'primary') {
          index = end; // Short supporting phrases move as a single natural group.
        }
        const text = words.slice(from, index).map(w => w.text.replace(/\s+/gu, ' ')).join('');
        const direction = design.directions?.[from] ?? (line.role === 'primary' ? 'bottom' : rowIndex === 0 ? 'left' : 'right');
        if (!(direction in directions)) throw Error('Invalid entrance direction');
        groups.push({from, to: index, text: from === start ? text.trimStart() : text, direction,
          startMs: words[from].startMs, endMs: words[index - 1].endMs,
          emphasis: focus >= from && focus < index, role: line.role});
      }
      return {groups, role: line.role};
    });
    function measured(factor) {
      return rows.map(row => {
        const size = sizes[row.role] * scale * factor;
        let x = 0;
        const groups = row.groups.map(group => {
          const metrics = measure(group.text, row.role, size);
          const g = {...group, ...metrics, size, x};
          x += metrics.width;
          return g;
        });
        const left = Math.min(0, ...groups.map(g => g.x - g.left));
        const right = Math.max(x, ...groups.map(g => g.x + g.right));
        return {groups, size, left, width: right - left,
          ascent: Math.max(...groups.map(g => g.ascent)), descent: Math.max(...groups.map(g => g.descent))};
      });
    }
    let rowsMeasured = measured(1);
    const factor = Math.min(1, available / Math.max(...rowsMeasured.map(r => r.width)));
    if (factor < minFitScale) throw Error(`Editorial phrase ${phraseIndex} exceeds safe width. Regroup at a natural phrase boundary or set smaller project sizes; speech timing must stay unchanged.`);
    if (factor < 1) rowsMeasured = measured(factor);
    let y = 0;
    const groups = [];
    for (const row of rowsMeasured) {
      y += row.ascent;
      const rowX = (width - row.width) / 2 - row.left;
      for (const group of row.groups) groups.push({...group, x: rowX + group.x, y});
      y += row.descent + 12 * scale;
      if (row.groups.some(g => g.emphasis) && underline !== 'none') y += underlineMetrics(underline, scale).extraHeight;
    }
    const top = height * center - y / 2;
    if (top - padding < height * .08 || top + y + padding > height * .92) throw Error('Editorial composition exceeds vertical safe bounds');
    for (const group of groups) group.y += top;
    return [{words, groups, startMs: words[0].startMs, endMs: words.at(-1).endMs,
      template, gradient, underline, travel, scale}];
  });
}

export function editorialState(segments, timeMs, options = {}) {
  const entranceMs = options.entranceMs ?? 220, drawMs = options.drawMs ?? 320;
  const drawDelayMs = options.drawDelayMs ?? 90, exitMs = options.exitMs ?? 140;
  if ([entranceMs, drawMs, drawDelayMs, exitMs].some(n => !Number.isFinite(n) || n < 0)) throw Error('Invalid animation duration');
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const tail = Math.max(0, Math.min(exitMs, (segments[i + 1]?.startMs ?? Infinity) - segment.endMs));
    if (timeMs < segment.startMs || timeMs >= segment.endMs + tail) continue;
    const opacity = timeMs < segment.endMs ? 1 : 1 - (timeMs - segment.endMs) / tail;
    const groups = segment.groups.map((group, j) => {
      const duration = Math.max(0, Math.min(entranceMs, group.endMs - group.startMs,
        (segment.groups[j + 1]?.startMs ?? segment.endMs) - group.startMs));
      const p = timeMs < group.startMs ? 0 : duration === 0 ? 1 : clamp((timeMs - group.startMs) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const [dx, dy] = directions[group.direction];
      const remaining = segment.endMs - group.startMs;
      const delay = Math.min(drawDelayMs, remaining / 2);
      const drawDuration = Math.min(drawMs, Math.max(0, remaining - delay));
      const drawProgress = timeMs < group.startMs + delay ? 0 : drawDuration === 0 ? 1 : clamp((timeMs - group.startMs - delay) / drawDuration);
      const draw = 1 - Math.pow(1 - drawProgress, 2);
      return {...group, opacity: eased, dx: dx * segment.travel * (1 - eased), dy: dy * segment.travel * (1 - eased), draw};
    });
    return {segment, opacity, groups};
  }
  return null;
}
