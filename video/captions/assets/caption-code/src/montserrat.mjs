// Pure, seek-safe layout. A slot reserves the maximum ink bounds of every alternative.
const clamp = n => Math.max(0, Math.min(1, n));
const finite = (n, min = 0) => Number.isFinite(n) && n >= min;
export const montserratDefaults = {thinWeight: 200, supportSize: 76, emphasisSize: 126,
  numberSize: 290, reveal: 'fade-ltr', revealMs: 200, exitMs: 0, maxWidthRatio: .86,
  position: {x: .5, y: .22}};
export function montserratLayout(sentences, measure, width, height, options = {}, colors = {}) {
  const defaults = {...montserratDefaults, ...options};
  const scale = Math.min(width, height) / 1080;
  if (!finite(defaults.maxWidthRatio, .1) || defaults.maxWidthRatio > .86) throw Error('Maximum composition width must be at most 86%');
  return sentences.map((sentence, phraseIndex) => {
    const words = sentence.words;
    const p = options.phrases?.[phraseIndex];
    if (!p?.groups?.length || !words.length) throw Error(`Phrase ${phraseIndex}: save explicit groups and layout before rendering`);
    const layout = p.layout ?? 'stacked', behavior = p.behavior ?? 'build';
    if (!['stacked','asymmetric','single','number'].includes(layout) || !['build','replace'].includes(behavior)) throw Error('Invalid layout or persistence');
    let expected = 0;
    const groups = p.groups.map((g, index) => {
      if (g.from !== expected || !Number.isInteger(g.to) || g.to <= g.from || g.to > words.length) throw Error('Groups must cover stable word indices exactly once in transcript order');
      expected = g.to;
      const weight = g.weight ?? (g.emphasis ? 700 : defaults.thinWeight);
      const size = (g.size ?? (g.number ? defaults.numberSize : g.emphasis ? defaults.emphasisSize : defaults.supportSize)) * scale;
      const reveal = layout === 'single' ? (g.reveal ?? p.reveal ?? 'instant') : 'fade-ltr';
      const requestedRevealMs = g.revealMs ?? p.revealMs ?? defaults.revealMs;
      const revealMs = layout !== 'single' && requestedRevealMs === 0 ? montserratDefaults.revealMs : requestedRevealMs;
      const blendMode = g.blendMode ?? (g.emphasis || g.number ? 'difference' : 'normal');
      const color = g.sourceColor ?? colors[g.colorRole ?? (g.emphasis || g.number ? 'accent' : 'base')] ?? (g.emphasis ? '#FF3030' : '#F7F5EF');
      const line = g.line ?? index;
      if (![100,200,300,700].includes(weight) || !finite(size,1) || !finite(revealMs) || !Number.isInteger(line) || line < 0 ||
          !['fade-ltr','instant'].includes(reveal) || !['normal','difference'].includes(blendMode) || !/^#[0-9a-f]{6}$/i.test(color)) throw Error('Invalid Montserrat group typography, reveal, line or color');
      const originalText = words.slice(g.from,g.to).map(w => w.text).join('');
      const text = g.uppercase === false ? originalText.trim() : originalText.trim().toLocaleUpperCase('de-DE');
      const metrics = measure(text, weight, !!g.italic, size);
      const left = Math.max(0, metrics.left), right = Math.max(metrics.width, metrics.right);
      const startMs = words[g.from].startMs, endMs = words[g.to-1].endMs;
      if (!finite(startMs) || !finite(endMs) || endMs <= startMs || (index && startMs < words[p.groups[index-1].from].startMs)) throw Error('Invalid word timing');
      return {...g, index, text, originalText, weight, size, italic: !!g.italic, reveal, revealMs,
        blendMode, color, line, startMs, endMs, left, right, entranceDistance: 12 * scale, ascent: metrics.ascent, descent: metrics.descent,
        slot: behavior === 'replace' ? 'replace' : g.slot ?? `group-${index}`};
    });
    if (expected !== words.length) throw Error('Groups must cover all transcript words');
    const baseColor = (colors.base ?? '#F7F5EF').toUpperCase();
    const accents = new Set(groups.map(g => g.color.toUpperCase()).filter(c => c !== baseColor));
    if (accents.size > 1) throw Error(`Phrase ${phraseIndex}: use only one accent source color plus the base color per display`);
    const slots = [];
    for (const g of groups) {
      let slot = slots.find(s => s.id === g.slot);
      if (!slot) {slot = {id:g.slot, groups:[], line:g.line, width:0, ascent:0, descent:0}; slots.push(slot);}
      if (behavior !== 'replace' && slot.line !== g.line) throw Error('Replacement alternatives must share a line');
      slot.groups.push(g); slot.width = Math.max(slot.width,g.left+g.right);
      slot.ascent = Math.max(slot.ascent,g.ascent); slot.descent = Math.max(slot.descent,g.descent);
    }
    const gap = (p.gap ?? 18)*scale, rowGap = (p.rowGap ?? 12)*scale;
    if (!finite(gap) || !finite(rowGap)) throw Error('Invalid spacing');
    const rows = [...new Set(slots.map(s=>s.line))].sort((a,b)=>a-b).map(line=>{
      const items = slots.filter(s=>s.line===line);
      return {items,width:items.reduce((n,s)=>n+s.width,0)+gap*(items.length-1),ascent:Math.max(...items.map(s=>s.ascent)),descent:Math.max(...items.map(s=>s.descent))};
    });
    if (layout !== 'number' && rows.length > 3) throw Error('Split at a meaningful phrase boundary: at most three lines');
    if (layout === 'single' && slots.length !== 1) throw Error('Single layout needs one slot (use behavior replace for a word sequence)');
    let compositionWidth = Math.max(...rows.map(r=>r.width)), compositionHeight = 0;
    if (layout === 'number') {
      const number = slots[0], sideRows = rows.map(r=>({...r,items:r.items.filter(s=>s!==number)})).filter(r=>r.items.length);
      const sideWidth = Math.max(0,...sideRows.map(r=>r.items.reduce((n,s)=>n+s.width,0)+gap*(r.items.length-1)));
      const sideHeight = sideRows.reduce((n,r)=>n+Math.max(...r.items.map(s=>s.ascent))+Math.max(...r.items.map(s=>s.descent))+rowGap,0)-rowGap;
      compositionWidth = number.width+gap+sideWidth; compositionHeight = Math.max(number.ascent+number.descent,sideHeight);
      number.x=0; number.y=(compositionHeight-number.ascent-number.descent)/2+number.ascent;
      let y=(compositionHeight-sideHeight)/2;
      for (const row of sideRows) {y+=Math.max(...row.items.map(s=>s.ascent));let x=number.width+gap;for(const s of row.items){s.x=x;s.y=y;x+=s.width+gap;}y+=Math.max(...row.items.map(s=>s.descent))+rowGap;}
    } else {
      for (const [i,row] of rows.entries()) {
        compositionHeight += row.ascent;
        let x=layout==='asymmetric'?(i===0?0:i===rows.length-1?compositionWidth-row.width:(compositionWidth-row.width)/2):(compositionWidth-row.width)/2;
        for(const s of row.items){s.x=x;s.y=compositionHeight;x+=s.width+gap;}
        compositionHeight += row.descent+rowGap;
      }
      compositionHeight -= rowGap;
    }
    const position = {...defaults.position,...p.position};
    const x=width*position.x-compositionWidth/2, y=height*position.y-compositionHeight/2;
    if (compositionWidth > width*defaults.maxWidthRatio || x < width*.07 || x+compositionWidth > width*.93 ||
        !finite(x) || !finite(y) || y < height*.06 || y+compositionHeight > height*.94) throw Error(`Phrase ${phraseIndex} exceeds safe bounds; split at a meaningful boundary or explicitly revise size/position. No automatic shrinking.`);
    for(const slot of slots) for(const g of slot.groups) {
      // Alternatives share a fixed left ink anchor; no recentering on replacement.
      g.x=x+slot.x+g.left; g.y=y+slot.y; g.boxX=x+slot.x;g.boxY=y+slot.y-slot.ascent;
      g.boxWidth=slot.width;g.boxHeight=slot.ascent+slot.descent;
    }
    const endMs=p.endMs ?? words.at(-1).endMs, exitMs=p.exitMs ?? defaults.exitMs;
    if (!finite(exitMs) || !finite(endMs) || endMs < words.at(-1).endMs) throw Error('Phrase end must include all words; exit duration must be nonnegative');
    return {groups,startMs:words[0].startMs,endMs,exitMs,phraseIndex};
  }).map((p,i,all)=>{
    const next=all[i+1]?.startMs ?? Infinity;
    if(p.endMs>next) throw Error('Phrase end overlaps next composition');
    return {...p,exitMs:Math.min(p.exitMs,next-p.endMs)};
  });
}
export function montserratState(segments,timeMs) {
  const segment=segments.find(s=>timeMs>=s.startMs && timeMs<s.endMs+s.exitMs);
  if(!segment)return null;
  const opacity=timeMs<segment.endMs?1:clamp(1-(timeMs-segment.endMs)/segment.exitMs);
  return {...segment,groups:segment.groups.map((g,i)=>{
    const replacement=segment.groups.slice(i+1).find(n=>n.slot===g.slot);
    const visible=timeMs>=g.startMs && (!replacement || timeMs<replacement.startMs);
    const duration=Math.min(g.revealMs,g.endMs-g.startMs,(segment.groups[i+1]?.startMs??segment.endMs)-g.startMs);
    const progress=!visible?0:g.reveal==='instant'||duration<=0?1:clamp((timeMs-g.startMs)/duration);
    // Fade the complete group while a short cubic ease-out settles it into its reserved slot.
    const offsetX=g.reveal==='instant'||progress===1?0:-g.entranceDistance*(1-progress)**3;
    return {...g,opacity:visible?opacity*progress:0,progress,offsetX};
  })};
}
