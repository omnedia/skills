// Pure layout and time evaluation: all indices are local to the original sentence.
export const brunsonDefaults = {
  sizes: {headline: 200, script: 125, default: 54},
  anchors: {upper: {x:.5,y:.25}, lower: {x:.5,y:.65}, default: {x:.5,y:.62}},
  entranceMs:160, travel:130, motionBlur:10, easing:'ease-out-cubic', maxWidthRatio:.85,
};
const check = (ok, message) => {if(!ok) throw Error(`Brunson Red Script: ${message}`);};
const finite = n => Number.isFinite(n);
const positive = n => finite(n) && n > 0;
const nonnegative = n => finite(n) && n >= 0;
const clamp = n => Math.max(0,Math.min(1,n));
export function brunsonLayout(sentences, measure, width, height, options={}, colors={}) {
  const d={...brunsonDefaults,...options,sizes:{...brunsonDefaults.sizes,...options.sizes},anchors:{...brunsonDefaults.anchors,...options.anchors}};
  check(positive(d.maxWidthRatio)&&d.maxWidthRatio<=.85,'maxWidthRatio must be at most .85');
  const scale=Math.min(width,height)/1080;
  const segments=sentences.map((sentence,phraseIndex)=>{
    const words=sentence.words, p=options.phrases?.[phraseIndex]??{mode:'default'};
    check(words.length>0,'empty sentence');
    words.forEach((w,i)=>check(nonnegative(w.startMs)&&w.endMs>w.startMs&&(!i||w.startMs>=words[i-1].endMs),'invalid or overlapping word timestamps'));
    const mode=p.mode??'default';
    check(['hero','default'].includes(mode),'mode must be hero or default');
    const authored=p.groups??(mode==='default'?words.map((_,i)=>({from:i,to:i+1,role:'default'})):[]);
    check(authored.length>0,'hero needs explicitly authored groups');
    let expected=0;
    const groups=authored.map((g,index)=>{
      check(g.from===expected&&Number.isInteger(g.to)&&g.to>g.from&&g.to<=words.length,'groups must cover stable word indices once in transcript order');expected=g.to;
      const role=g.role??(mode==='default'?'default':'headline');
      check(mode==='default'?role==='default':['headline','script'].includes(role),'role does not match presentation mode');
      const originalText=words.slice(g.from,g.to).map(w=>w.text).join('').trim();
      const text=role==='script'?originalText:originalText.toLocaleUpperCase('de-DE');
      const size=(g.size??d.sizes[role])*scale;
      const entrance= g.entrance??(role==='default'?'instant':'rise-fade');
      const entranceMs=g.entranceMs??d.entranceMs, travel=(g.travel??d.travel)*scale, motionBlur=(g.motionBlur??d.motionBlur)*scale;
      const easing=g.easing??d.easing;
      check(positive(size)&&nonnegative(entranceMs)&&nonnegative(travel)&&nonnegative(motionBlur),'invalid size or entrance parameters');
      check(entrance===(role==='default'?'instant':'rise-fade'),'default is instant; hero uses rise-fade');
      check(['ease-out-cubic','ease-out-quart'].includes(easing),'unsupported ease-out curve');
      const color=g.color??colors[role]??(role==='headline'?'#EA1315':'#FFFFFF');
      check(/^#[0-9a-f]{6}$/i.test(color),'invalid solid color');
      const breaks=g.breakAfter??[];
      check(!breaks.length||(mode==='default'&&breaks.length===1&&Number.isInteger(breaks[0])&&breaks[0]>g.from&&breaks[0]<g.to),'two-line override needs one interior absolute word index');
      const ranges=[g.from,...breaks,g.to];
      const lines=ranges.slice(0,-1).map((from,i)=>{
        const raw=words.slice(from,ranges[i+1]).map(w=>w.text).join('').trim();
        const t=role==='script'?raw:raw.toLocaleUpperCase('de-DE');
        const m=measure(t,role,size);
        check([m.width,m.left,m.right,m.ascent,m.descent].every(finite),'invalid glyph metrics');
        return {text:t,...m,inkWidth:m.left+m.right};
      });
      const inkWidth=Math.max(...lines.map(l=>l.inkWidth));
      const gap=(g.lineGap??8)*scale;
      const inkHeight=lines.reduce((h,l)=>h+l.ascent+l.descent,0)+gap*(lines.length-1);
      const endMs=g.endMs??words[g.to-1].endMs;
      check(endMs>=words[g.to-1].endMs&&finite(endMs),'unit end must include its words');
      const shadow=g.shadow??null;
      if(shadow)check(/^#[0-9a-f]{6}$/i.test(shadow.color)&&nonnegative(shadow.blur)&&finite(shadow.x)&&finite(shadow.y)&&nonnegative(shadow.opacity)&&shadow.opacity<=1,'invalid shadow');
      return {...g,index,role,text,originalText,size,entrance,entranceMs,travel,motionBlur,easing,color,lines,gap,inkWidth,inkHeight,shadow,
        startMs:words[g.from].startMs,endMs,region:g.region??(role==='default'?'default':'lower'),line:g.line??0,zIndex:g.zIndex??(role==='script'?2:1)};
    });
    check(expected===words.length,'unassigned transcript words');
    const endMs=p.endMs??words.at(-1).endMs;
    check(finite(endMs)&&endMs>=Math.max(...groups.map(g=>g.endMs)),'composition end must include all units');
    // Regions have independent anchors; complete rows are measured before any reveal.
    const place=(items,anchor,align='center',rowGap=12)=>{
      check(anchor&&finite(anchor.x)&&finite(anchor.y)&&['left','center','right'].includes(align),'invalid anchor or alignment');
      const rows=[...new Set(items.map(g=>g.line))].sort((a,b)=>a-b).map(line=>{
        check(Number.isInteger(line)&&line>=0,'invalid line');
        const gs=items.filter(g=>g.line===line); const spacing=(p.regions?.[gs[0].region]?.wordGap??18)*scale;
        check(nonnegative(spacing)&&nonnegative(rowGap),'invalid region spacing');
        return {gs,spacing,w:gs.reduce((n,g)=>n+g.inkWidth,0)+spacing*(gs.length-1),h:Math.max(...gs.map(g=>g.inkHeight))};
      });
      const total=rows.reduce((n,r)=>n+r.h,0)+(rows.length-1)*rowGap*scale;
      let y=height*anchor.y-total/2;
      for(const row of rows){
        check(row.w<=width*d.maxWidthRatio,`line "${row.gs.map(g=>g.text).join(' ')}" (${Math.round(row.w)} px) exceeds safe width; split at a semantic boundary or explicitly revise size`);
        let x=width*anchor.x-(align==='center'?row.w/2:align==='right'?row.w:0);
        for(const g of row.gs){
          g.boxX=x+(g.offset?.x??0)*scale;g.boxY=y+(g.offset?.y??0)*scale;
          check(g.boxX>=width*.04&&g.boxX+g.inkWidth<=width*.96&&g.boxY>=0&&g.boxY+g.inkHeight<=height,'text ink exceeds frame bounds');
          let ly=g.boxY;
          for(const l of g.lines){l.x=g.boxX+(g.inkWidth-l.inkWidth)/2+l.left;l.y=ly+l.ascent;ly+=l.ascent+l.descent+g.gap;}
          x+=g.inkWidth+row.spacing;
        }
        y+=row.h+rowGap*scale;
      }
    };
    if(mode==='default')groups.forEach((g,i)=>{
      check(g.endMs<=(groups[i+1]?.startMs??endMs),'default unit overlaps next caption');
      place([g],g.anchor??p.anchor??d.anchors.default,g.align??'center');
    });
    else for(const region of new Set(groups.map(g=>g.region))){
      const r=p.regions?.[region]??{};
      place(groups.filter(g=>g.region===region),r.anchor??d.anchors[region],r.align??'center',r.rowGap??12);
    }
    return {phraseIndex,mode,startMs:words[0].startMs,endMs,groups};
  });
  segments.forEach((s,i)=>check(s.endMs<=(segments[i+1]?.startMs??Infinity),'composition overlaps next sentence'));
  return segments;
}
export function brunsonState(segments,timeMs){
  const s=segments.find(s=>timeMs>=s.startMs&&timeMs<s.endMs);
  if(!s)return null;
  return {...s,groups:s.groups.map((g,i)=>{
    const visible=timeMs>=g.startMs&&(s.mode==='hero'||timeMs<g.endMs);
    const duration=Math.min(g.entranceMs,g.endMs-g.startMs,(s.groups[i+1]?.startMs??s.endMs)-g.startMs);
    const t=g.entrance==='instant'||duration<=0?1:clamp((timeMs-g.startMs)/duration);
    const progress=1-(1-t)**(g.easing==='ease-out-quart'?4:3);
    return {...g,opacity:visible?progress:0,dy:g.entrance==='instant'?0:g.travel*(1-progress),blur:g.entrance==='instant'?0:g.motionBlur*(1-progress)};
  }).filter(g=>g.opacity>0).sort((a,b)=>a.zIndex-b.zIndex||a.index-b.index)};
}
