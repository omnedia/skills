// Transcript planning is persisted by prepareProject; rendering only measures and evaluates it.
export const vermilionDefaults = {
  gapMs:350, maxPhraseWords:8, decorationIntervalMs:10000, holdMs:80, scriptShare:.5,
  maxWidthRatio:.88, anchor:{x:.5,y:.65}, entranceMs:240, exitMs:160,
  roles:{
    hero:{size:280,color:'#EB2F0C',casing:'upper',travel:210,blur:18},
    supporting:{size:150,color:'#EB2F0C',casing:'upper',travel:140,blur:16},
    connector:{size:150,color:'#FFFFFF',casing:'lower',travel:140,blur:16},
    emphasis:{size:230,color:'#FFFFFF',casing:'preserve',travel:160,blur:18},
    ordinary:{size:96,color:'#EB2F0C',casing:'upper',travel:0,blur:0},
    'ordinary-script':{size:120,color:'#FFFFFF',casing:'lower',travel:0,blur:0},
  },
};
const check=(ok,message)=>{if(!ok)throw Error(`Vermilion Brush Editorial: ${message}`);};
const clean=t=>t.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export const isVermilionScript=r=>['connector','emphasis','ordinary-script'].includes(r);
const script=isVermilionScript;
const expressive=new Set(['tension','rhythm','spark','life','wrong','again']);
const connectors=new Set('a an the your you we i it they them our their my his her and or to for with using hear that this these those of in on at as is are was be have will can make come'.split(' '));
const blockAnchors=new Set(['stop','wont','never','dont','because','after','tip','mistake','music','follow','subscribe','save','comment','share']);
// Choose by editorial role first; short words and source order break ties.
const scriptPriority=t=>expressive.has(t)?3:connectors.has(t)?2:blockAnchors.has(t)?0:1;
export const displayText=(text,casing)=>casing==='upper'?text.toUpperCase():casing==='lower'?text.toLowerCase():text;
export function vermilionOptions(options={}) {
  return {...vermilionDefaults,...options,roles:Object.fromEntries(Object.entries(vermilionDefaults.roles).map(([k,v])=>[k,{...v,...options.roles?.[k]}]))};
}
export function planVermilion(sentences,options={}) {
  const d=vermilionOptions(options), words=sentences.flatMap(s=>s.words);
  check(words.length>0,'empty transcript');
  check(Number.isFinite(d.scriptShare)&&d.scriptShare>=0&&d.scriptShare<=1,'scriptShare must be between 0 and 1');
  check(Number.isInteger(d.maxPhraseWords)&&d.maxPhraseWords>=3&&d.gapMs>0&&d.holdMs>=0,'invalid segmentation settings');
  words.forEach((w,i)=>check(w.text.trim()&&Number.isFinite(w.startMs)&&Number.isFinite(w.endMs)&&w.startMs>=0&&w.endMs>w.startMs&&(!i||w.startMs>=words[i-1].endMs),'invalid or overlapping word timing'));
  let ranges=[];let from=0;
  for(let i=0;i<words.length;i++){
    if(/[.!?,;:]\s*$/.test(words[i].text)||!words[i+1]||words[i+1].startMs-words[i].endMs>=d.gapMs||i-from+1>=d.maxPhraseWords){ranges.push([from,i+1]);from=i+1;}
  }
  if(options.phraseRanges){
    let next=0;
    check(Array.isArray(options.phraseRanges),'phraseRanges must be an array');
    for(const range of options.phraseRanges){
      check(Array.isArray(range)&&range.length===2&&range[0]===next&&Number.isInteger(range[1])&&range[1]>next&&range[1]<=words.length,'phraseRanges must cover global indices once in order');
      for(let i=range[0]+1;i<range[1];i++)check(words[i].startMs-words[i-1].endMs<d.gapMs,'authored phrase crosses a genuine gap; split it');
      next=range[1];
    }
    check(next===words.length,'phraseRanges omit words');ranges=options.phraseRanges;
  }
  let lastDecoration=-Infinity,automaticWords=0,automaticScript=0;
  const phrases=ranges.map(([from,to],index)=>{
    const ws=words.slice(from,to),tokens=ws.map(w=>clean(w.text)), override=options.phrases?.[index]??{};
    const callout=/^(follow|subscribe|save|comment|share)\b/.test(tokens.join(' '));
    const readable=ws.length>=3&&ws.length<=8&&tokens.every(t=>t.length<=18);
    const eligible=readable&&(index===0||(callout&&ws[0].startMs-lastDecoration>=d.decorationIntervalMs));
    const mode=override.mode??(eligible?'decorative':'ordinary');
    check(['decorative','ordinary','stack'].includes(mode),'unknown mode');
    if(mode==='decorative')lastDecoration=ws[0].startMs;
    const roles=ws.map(()=>mode==='ordinary'?'ordinary':'supporting');
    if(!override.groups){
      automaticWords+=ws.length;
      const count=Math.max(0,Math.min(ws.length,Math.round(automaticWords*d.scriptShare)-automaticScript));
      const candidates=tokens.map((t,i)=>({t,i})).sort((a,b)=>scriptPriority(b.t)-scriptPriority(a.t)||a.t.length-b.t.length||a.i-b.i);
      for(const {t,i} of candidates.slice(0,count))roles[i]=mode==='ordinary'?'ordinary-script':expressive.has(t)?'emphasis':'connector';
      automaticScript+=count;
    }
    if(mode==='decorative'){
      const content=tokens.map((t,i)=>({t,i})).filter(({t,i})=>roles[i]==='supporting'&&!['a','the','your','you','and','to','for','with','every'].includes(t));
      const hero=content.sort((a,b)=>b.t.length-a.t.length||a.i-b.i)[0];
      if(hero)roles[hero.i]='hero';
    }
    const template=override.template??(mode==='ordinary'?'ordinary':mode==='stack'?'downward':callout?'callout':roles.includes('emphasis')?'overlap':'split-hook');
    check(['ordinary','downward','stagger','split-hook','overlap','compact','callout'].includes(template),'unknown template');
    const authored=override.groups??ws.map((_,i)=>({from:from+i,to:from+i+1,role:roles[i]}));
    let expected=from;
    const groups=authored.map((g,i)=>{
      check(g.from===expected&&Number.isInteger(g.to)&&g.to>g.from&&g.to<=to,'groups must cover global word indices once in order');expected=g.to;
      const role=g.role??roles[g.from-from];check(d.roles[role],'unknown role');
      const r=d.roles[role];
      const result={...r,tracking:0,lineSpacing:1,align:'center',zIndex:script(role)?2:1,
        entrance:mode==='decorative'?'rise-fade':'instant',entranceMs:d.entranceMs,
        exit:mode==='decorative'?'fade':'cut',exitMs:d.exitMs,
        behavior:mode==='ordinary'?'replacement':'accumulation',easing:'ease-out-cubic',...override.defaults,...g,role,index:i,
        explicitColor:g.color!==undefined||override.defaults?.color!==undefined||options.roles?.[role]?.color!==undefined};
      check(['instant','rise-fade'].includes(result.entrance)&&['cut','fade'].includes(result.exit)&&['replacement','accumulation'].includes(result.behavior),'invalid treatment');
      check(['upper','lower','preserve'].includes(result.casing),'invalid casing');
      check(result.easing==='ease-out-cubic','easing must be monotonic ease-out-cubic');
      check(!script(role)||result.tracking===0,'retain natural script tracking');
      check(/^#[0-9a-f]{6}$/i.test(result.color),'invalid role color');
      check(result.size>0&&result.entranceMs>=0&&result.exitMs>=0&&result.travel>=0&&result.blur>=0&&result.tracking>=-.025&&result.tracking<=.1&&result.lineSpacing>0,'invalid role geometry or timing');
      return result;
    });
    check(expected===to,'unassigned words');
    const endMs=override.endMs??ws.at(-1).endMs;
    check(Number.isFinite(endMs)&&endMs>=ws.at(-1).endMs&&endMs<=(words[to]?.startMs??Infinity),'invalid phrase end');
    return {index,from,to,mode,template,startMs:ws[0].startMs,endMs,anchor:override.anchor??d.anchor,groups};
  });
  return {version:1,words:words.map((w,index)=>({index,text:w.text,startMs:w.startMs,endMs:w.endMs})),phrases};
}

export function layoutVermilion(plan,measure,width,height,options={},colors={}) {
  const d=vermilionOptions(options),scale=Math.min(width/1080,height/1920),ox=(width-1080*scale)/2,oy=(height-1920*scale)/2;
  check(d.maxWidthRatio>0&&d.maxWidthRatio<=.88,'maxWidthRatio must be at most .88');
  return plan.phrases.map(p=>{
    const units=p.groups.flatMap(g=>plan.words.slice(g.from,g.to).map(w=>{
      const text=displayText(w.text.trim(),g.casing),end=g.endMs??(g.behavior==='replacement'?Math.min(p.endMs,plan.words[g.to]?.startMs??p.endMs,plan.words[g.to-1].endMs+d.holdMs):p.endMs);
      check(end>=plan.words[g.to-1].endMs&&end<=p.endMs,'group end outside phrase');
      return {...g,wordIndex:w.index,text,startMs:w.startMs,endMs:end,
        color:g.explicitColor?g.color:(colors[script(g.role)?'script':g.role==='ordinary'?'ordinary':'block']??g.color)};
    }));
    const ordinary=p.template==='ordinary';
    // Whole rows are allocated before visibility. Explicit line numbers or global breakAfter indices are supported.
    const rows=[];let row=[];
    for(const u of units){
      const previous=row.at(-1);
      const boundary=previous&&(ordinary?previous.index!==u.index: u.line!==undefined?u.line!==previous.line:
        previous.breakAfter?.includes(u.wordIndex)||script(u.role)!==script(previous.role)||u.role==='hero'||previous.role==='hero'||row.length>=3);
      if(boundary){rows.push(row);row=[];}row.push(u);
    }
    if(row.length)rows.push(row);
    const fitted=[];
    for(const sourceRow of rows){
      const maxWidth=1080*Math.min(d.maxWidthRatio,p.template==='stagger'?.62:d.maxWidthRatio,...sourceRow.map(u=>u.maxWidthRatio??d.maxWidthRatio));
      check(maxWidth>0,'invalid group width');
      const pending=[sourceRow];
      while(pending.length){
        const rs=pending.shift();
        const metrics=rs.map(u=>measure(u.text,u.role,u.size,u.tracking));
        const gap=18,ink=metrics.reduce((n,m)=>n+m.left+m.right,0)+gap*(rs.length-1);
        const pad=Math.max(...rs.map(u=>script(u.role)?u.size*.3:24));
        if(ink>maxWidth-pad*2&&rs.length>1){const mid=Math.ceil(rs.length/2);pending.unshift(rs.slice(0,mid),rs.slice(mid));continue;}
        const factor=Math.min(1,(maxWidth-pad*2)/ink);
        check(factor>=.72,`word ${JSON.stringify(rs[0].text)} cannot fit safely; choose a smaller role size explicitly`);
        const ms=rs.map(u=>measure(u.text,u.role,u.size*factor,u.tracking));
        const w=ms.reduce((n,m)=>n+m.left+m.right,0)+gap*(rs.length-1);
        fitted.push({units:rs.map((u,i)=>({...u,size:u.size*factor,metrics:ms[i]})),w,h:Math.max(...ms.map(m=>m.ascent+m.descent)),gap});
      }
    }
    const gaps=fitted.map((r,i)=>p.template==='overlap'&&fitted[i+1]?.units.some(u=>script(u.role))?-24:18);
    const rowHeight=r=>r.h*Math.max(...r.units.map(u=>u.lineSpacing));
    const total=fitted.reduce((n,r,i)=>n+rowHeight(r)+(i<fitted.length-1?gaps[i]:0),0);
    let y=1920*p.anchor.y-total/2;
    const placed=[];
    fitted.forEach((r,ri)=>{
      if(ordinary&&(ri===0||r.units[0].index!==fitted[ri-1].units[0].index)){
        const groupRows=fitted.filter(row=>row.units[0].index===r.units[0].index);
        y=1920*p.anchor.y-(groupRows.reduce((n,row)=>n+rowHeight(row),0)+18*(groupRows.length-1))/2;
      }
      if(p.template==='split-hook'&&ri===0)y=300;
      if(p.template==='split-hook'&&ri===1)y=1100;
      const anchor=r.units[0].anchor??p.anchor;
      const align=r.units[0].align;check(['left','center','right'].includes(align),'invalid alignment');
      let x=1080*anchor.x-(align==='center'?r.w/2:align==='right'?r.w:0)+(p.template==='stagger'&&ri%2?90:0);
      for(const u of r.units){
        const m=u.metrics,dx=u.offset?.x??0,dy=u.offset?.y??0;
        const top=(u.anchor?1920*u.anchor.y-r.h/2:y)+dy;
        check(x+dx>=60&&x+dx+m.left+m.right<=1020&&top>=40&&top+m.ascent+m.descent+u.travel+u.blur*3<=1880,'ink or entrance exceeds safe frame; revise template/size/offset');
        placed.push({...u,x:ox+(x+dx+m.left)*scale,y:oy+(top+m.ascent)*scale,size:u.size*scale,travel:u.travel*scale,blur:u.blur*scale});
        x+=m.left+m.right+r.gap;
      }
      y+=rowHeight(r)+gaps[ri];
    });
    return {...p,units:placed};
  });
}
export function vermilionState(layout,timeMs){
  const p=layout.find(p=>timeMs>=p.startMs&&timeMs<p.endMs);if(!p)return [];
  return p.units.filter(u=>timeMs>=u.startMs&&timeMs<u.endMs).map(u=>{
    const next=p.units.find(v=>v.wordIndex>u.wordIndex)?.startMs??u.endMs;
    const duration=Math.min(u.entranceMs,next-u.startMs,u.endMs-u.startMs);
    const t=u.entrance==='instant'||duration<=0?1:Math.min(1,(timeMs-u.startMs)/duration);
    const progress=1-(1-t)**3;
    const fade=u.exit==='fade'&&u.exitMs>0?Math.min(1,(u.endMs-timeMs)/Math.min(u.exitMs,(u.endMs-u.startMs)/2)):1;
    return {...u,opacity:progress*fade,dy:u.travel*(1-progress),motionBlur:u.blur*(1-progress)};
  }).sort((a,b)=>a.zIndex-b.zIndex||a.wordIndex-b.wordIndex);
}
