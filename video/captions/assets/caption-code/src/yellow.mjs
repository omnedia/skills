// Yellow Authority: AI-authored editorial planning, measured layout, and absolute-time evaluation.
export const yellowPlanVersion = 5;
export const yellowDefaults = {anchor:{x:360,y:688},scale:1,density:1};
export const yellowRoles = {
  ordinary:['primary',48,-1,'base'], small:['primary',48,-1,'accent'],
  emphasis:['display',72,-1.5,'accent'], opening:['display',66,-1.3,'accent'],
  hero:['display',108,-2.5,'accent'], italic:['italic',66,-1,'base'],
  numeral:['italic',112,-2,'accent'], lead:['primary',62,-1.3,'base'],
  tail:['italic',76,-1.5,'accent'], closing:['display',70,-1.5,'accent'],
  annotation:['primary',44,-.8,'base'], annotationYellow:['primary',44,-.8,'accent'],
  amount:['display',144,-3,'accent'], consequence:['primary',42,-.8,'base'],
};
export const yellowRecipes = {
  'phrase-cut':{duration:0,opacity:0}, 'word-fade':{duration:125,opacity:125},
  'word-pull-up':{duration:250,opacity:125,y:24,curve:[.16,1,.3,1]},
  'line-fade':{duration:250,opacity:250},
  'line-rise':{duration:250,opacity:200,y:24,curve:[.16,1,.3,1]},
  'quick-rise':{duration:167,opacity:125,y:24,curve:[.16,1,.3,1]},
  'number-settle':{duration:250,opacity:208,x:48,curve:[.22,1,.36,1]},
  'heading-glide':{duration:375,opacity:250,x:96,curve:[.22,1,.36,1]},
  'comparative-tail-glide':{duration:208,opacity:125,x:48,curve:[.16,1,.3,1]},
  'comparison-glide':{duration:250,opacity:200,x:-48,curve:[.16,1,.3,1]},
  'scattered-glyph-resolve':{duration:500,opacity:0},
};
const clean = w => w.text.trim().toLowerCase().replace(/[^\p{L}\p{N}$€£]/gu,'');
const strong = w => /[.!?;][”’"']?$/u.test(w.text.trim());
const textOf = words => words.map(w=>w.text.trim()).join(' ');
export function yellowOptions(value={}) {
  if(Object.keys(value).some(k=>!['anchor','scale','density','editorialPlan'].includes(k)))throw Error('Unknown Yellow Authority override');
  const o={...yellowDefaults,...value,anchor:{...yellowDefaults.anchor,...value.anchor}};
  if(!Number.isFinite(o.scale)||o.scale<=0||o.scale>1.5||!Number.isFinite(o.density)||o.density<0||o.density>1||!Number.isFinite(o.anchor.x)||!Number.isFinite(o.anchor.y))throw Error('Invalid Yellow Authority anchor, scale or density');
  return o;
}
function ordinaryChunks(words) {
  const out=[];let i=0;
  while(i<words.length){let end=i+1;
    while(end<words.length && end-i<3 && words[end].startMs-words[i].startMs<=600 && words[end].startMs-words[end-1].endMs<350 && !strong(words[end-1])){
      if(end-i>=2&&/^(a|an|the)$/i.test(clean(words[end])))break;
      end++;
    }
    // Keep an article/auxiliary with its following word when the bounded allowance permits.
    if(end<words.length && /^(a|an|the|will|can|should|would|is|are|to)$/i.test(clean(words[end-1]))) {
      if(end-i<4 && words[end].startMs-words[i].startMs<=600 && words[end].startMs-words[end-1].endMs<350)end++;
      else if(end-i>1)end--;
    }
    out.push(words.slice(i,end));i=end;
  }return out;
}
const span = (words,role,recipe,line=0,extra={}) => ({indices:words.map(w=>w.index),role,recipe,line,...extra});
function group(words,template,reason,spans,extra={}) {return {template,reason,indices:words.map(w=>w.index),spans,...extra};}
function ordinary(words) {return ordinaryChunks(words).map(ws=>group(ws,'plain-center','ordinary bounded phrase',[span(ws,'ordinary','phrase-cut')]));}
// The calling AI authors choices after reading the whole transcript. This function
// validates and compiles those choices; it has no keyword-based creative policy.
export function planYellow(sentences, overrides={}) {
  const options=yellowOptions(overrides), words=sentences.flatMap(s=>s.words).map((w,index)=>({...w,index}));
  if(!words.length)throw Error('No Yellow Authority words');
  for(const [i,w] of words.entries())if(!w.text.trim()||!Number.isFinite(w.startMs)||!Number.isFinite(w.endMs)||w.startMs<0||w.endMs<w.startMs||(i&&w.startMs<words[i-1].startMs))throw Error('Invalid Yellow Authority word timing; overlapping durations are allowed, starts must be ordered');
  const authored=options.editorialPlan;
  if(!authored||!Array.isArray(authored.groups)||!authored.groups.length)throw Error('Yellow Authority requires an AI-authored styleOptions.editorialPlan; read STYLE.md and plan this transcript before prepare');
  if(JSON.stringify(authored.source)!==JSON.stringify(words.map(w=>w.text)))throw Error('Stale Yellow Authority editorial source; review the current transcript and regenerate editorialPlan');
  const templates=new Set(['plain-center','word-build','support-emphasis','numbered-heading','list-keyword','yellow-keyword','comparative-pair','reverse-payoff','closing-title','amount-hero','comparison-annotations']);
  const range=(a,b,min,max)=>Number.isInteger(a)&&Number.isInteger(b)&&a>=min&&b>a&&b<=max;
  let cursor=0;
  const groups=authored.groups.map(g=>{
    if(!range(g.from,g.to,0,words.length)||g.from!==cursor)throw Error('Editorial groups must cover every word exactly once in source order');
    if(!templates.has(g.template)||typeof g.reason!=='string'||!g.reason.trim()||!Array.isArray(g.spans)||!g.spans.length)throw Error('Invalid editorial template, reason or spans');
    for(let i=g.from+1;i<g.to;i++)if(words[i].startMs-words[i-1].endMs>=350)throw Error('Editorial group crosses a speech pause; split at the gap');
    let position=g.from;
    const spans=g.spans.map(s=>{
      if(!range(s.from,s.to,g.from,g.to)||s.from!==position)throw Error('Editorial spans must cover their group exactly once in source order');
      if(!Object.hasOwn(yellowRoles,s.role)||!Object.hasOwn(yellowRecipes,s.recipe)||!Number.isInteger(s.line??0)||(s.line??0)<0||(s.line??0)>(g.template==='comparison-annotations'?3:1))throw Error('Invalid editorial role, recipe or line');
      if(s.nominalDuration!==undefined&&(!Number.isFinite(s.nominalDuration)||s.nominalDuration<=0))throw Error('Invalid editorial duration');
      position=s.to;
      return span(words.slice(s.from,s.to),s.role,s.recipe,s.line??0,s.nominalDuration===undefined?{}:{nominalDuration:s.nominalDuration});
    });
    if(position!==g.to)throw Error('Editorial spans must cover their group exactly once in source order');
    cursor=g.to;
    return group(words.slice(g.from,g.to),g.template,g.reason,spans,{upper:g.upper===true,fade:g.fade===true,structural:g.structural===true,hook:g.hook===true,...(g.template==='comparison-annotations'?{panels:2}:{})});
  });
  if(cursor!==words.length)throw Error('Editorial groups must cover every word exactly once in source order');
  return finishYellow({style:'yellow-authority',version:yellowPlanVersion,options,words,groups});
}
function finishYellow(plan){
  for(const [i,g]of plan.groups.entries()){
    const ws=g.indices.map(n=>plan.words[n]),last=Math.max(...ws.map(w=>w.endMs)),next=plan.groups[i+1]&&plan.words[plan.groups[i+1].indices[0]].startMs;
    g.id=`yellow-${i}`;g.startMs=ws[0].startMs;g.endMs=next===undefined?last+180:Math.min(next,next-last<350?next:last+180);
    g.exitMs=g.fade&&g.endMs-g.startMs>=250?167:0;g.exitStartMs=g.endMs-g.exitMs;
  }return plan;
}
export function resolveYellowRecipe(recipe,startMs,endMs,nominalOverride){
  let nominal=nominalOverride??yellowRecipes[recipe].duration;
  const available=endMs-startMs;
  if(recipe==='scattered-glyph-resolve'&&available<450){recipe='quick-rise';nominal=167;}
  let duration=Math.min(nominal,Math.max(0,available-83));
  if(duration<83){recipe='phrase-cut';duration=0;nominal=0;}
  return {recipe,startMs,duration,nominalDuration:nominal,trackScale:nominal?duration/nominal:1};
}
// measure(text,fontRole,size,tracking) returns real shaped advance and ink bounds.
export function layoutYellow(plan,measure,colors={base:'#FFFFFF',accent:'#FFE600'}){
  plan=JSON.parse(JSON.stringify(plan));
  const words=plan.words;
  const metric=(text,role,factor=1)=>{const [font,size,tracking,color]=yellowRoles[role];return {...measure(text,font,size*factor,tracking*factor),font,size:size*factor,tracking:tracking*factor,color:colors[color],colorRole:color};};
  const display=(ids,role)=>{const t=textOf(ids.map(i=>words[i]));return ['opening','italic'].includes(role)?t.toUpperCase():t;};
  const extent=m=>Math.max(m.width,m.right)+Math.max(0,m.left);
  const output=[];
  for(const original of plan.groups){
    const g={...original,spans:original.spans.filter(s=>s.indices.length)};
    const ordinaryGroup=g.template==='plain-center'||g.template==='word-build';
    const maxWidth=s=>g.template==='comparison-annotations'?(s.line>1?270:600):g.template==='comparative-pair'?552:g.template==='reverse-payoff'?(s.line?600:600):g.template==='support-emphasis'?(s.line?600:560):ordinaryGroup||g.template==='closing-title'?580:600;
    // Wrap complete spans at a measured, balanced word boundary; all slots exist before reveal.
    const wrap=s=>{const limit=maxWidth(s),m=metric(display(s.indices,s.role),s.role);
      if(extent(m)<=limit||s.indices.length===1)return [s];
      let best=null;
      for(let k=1;k<s.indices.length;k++){const a=s.indices.slice(0,k),b=s.indices.slice(k),ma=extent(metric(display(a,s.role),s.role)),mb=extent(metric(display(b,s.role),s.role));if(ma<=limit&&mb<=limit&&(!best||Math.abs(ma-mb)<best.score))best={a,b,score:Math.abs(ma-mb)};}
      return best?[{...s,indices:best.a,line:0},{...s,indices:best.b,line:1}]:[s];
    };
    if(ordinaryGroup||g.template==='closing-title')g.spans=g.spans.flatMap(wrap);
    let factor=1;
    for(const s of g.spans)factor=Math.min(factor,maxWidth(s)/extent(metric(display(s.indices,s.role),s.role)));
    if(g.template==='numbered-heading'){const sizes=g.spans.map(s=>extent(metric(display(s.indices,s.role),s.role)));factor=Math.min(factor,600/(sizes.reduce((a,b)=>a+b,0)+24));}
    if(factor<.8 || (ordinaryGroup&&factor<1)){
      if(g.indices.length>1){
        // Downgrade/split at word boundaries instead of silently clipping a display.
        const mid=Math.ceil(g.indices.length/2),parts=[g.indices.slice(0,mid),g.indices.slice(mid)];
        const sub=finishYellow({...plan,groups:parts.flatMap(ids=>ordinary(ids.map(i=>words[i])))});
        sub.groups.at(-1).endMs=g.endMs;sub.groups.at(-1).exitStartMs=g.endMs;
        output.push(...layoutYellow(sub,measure,colors).groups);continue;
      }
      throw Error(`Unbreakable word exceeds safe bounds: ${words[g.indices[0]].text}`);
    }
    // Reserve shadow and italic overhang inside the requested ink envelope.
    factor=Math.min(1,factor);g.layoutScale=factor;g.units=[];
    const metrics=g.spans.map(s=>metric(display(s.indices,s.role),s.role,factor));
    let headingX=360-(metrics.reduce((n,m)=>n+extent(m),0)+24*factor)/2;
    for(const [si,s]of g.spans.entries()){
      const m=metrics[si],width=extent(m),template=g.template;
      let center=360,y=688,x;
      if(template==='support-emphasis')y=s.line?726:664;
      else if(template==='word-build'||(template==='plain-center'&&g.spans.length>1))y=s.line?712:662;
      else if(template==='list-keyword')y=680;
      else if(template==='reverse-payoff')y=s.line?738:688;
      else if(template==='closing-title')y=s.line?730:668;
      else if(template==='amount-hero')y=310;
      else if(template==='comparison-annotations'){center=s.line>1?530:360;y=[324,372,620,666][s.line];}
      else if(template==='comparative-pair'){y=g.upper?(s.line?324:254):(s.line?724:660);x=s.line?360+276*factor-width:360-276*factor;}
      else if(template==='numbered-heading'){x=headingX;headingX+=width+24*factor;y=671+(m.ascent-m.descent)/2;}
      x??=center-width/2;x+=Math.max(0,m.left);
      const pivot=template==='support-emphasis'?695:template==='reverse-payoff'?713:template==='closing-title'?699:template==='comparative-pair'?(g.upper?289:692):template==='comparison-annotations'?(s.line>1?643:348):y;
      y=pivot+(y-pivot)*factor;
      const originalRecipe=s.recipe;
      // Connected spans only share a start within the explicit 600ms allowance.
      const connected=['phrase-cut','line-rise','quick-rise','heading-glide','comparison-glide','comparative-tail-glide'].includes(originalRecipe)&&s.indices.length<=4&&words[s.indices.at(-1)].startMs-words[s.indices[0]].startMs<=600&&s.indices.every((id,k)=>!k||(!strong(words[s.indices[k-1]])&&words[id].startMs-words[s.indices[k-1]].endMs<350));
      let prefix='';const text=display(s.indices,s.role);
      for(const [wi,id]of s.indices.entries()){
        const word=words[id],part=['opening','italic'].includes(s.role)?word.text.trim().toUpperCase():word.text.trim();
        const before=prefix?metric(prefix,s.role,factor).width:0;
        const wm=metric(part,s.role,factor);
        let recipe=originalRecipe;
        // A long static span stays static; timestamp gates do not imply animation.
        const startMs=connected?words[s.indices[0]].startMs:word.startMs;
        const resolved=resolveYellowRecipe(recipe,startMs,g.exitStartMs,s.nominalDuration);
        const travel=resolved.recipe==='phrase-cut'?0:recipe==='heading-glide'?Math.min(96,Math.max(0,720-12-(x+m.right))):yellowRecipes[recipe].x??0;
        const u={wordIndex:id,originalText:word.text,text:part,role:s.role,line:s.line,font:m.font,size:m.size,tracking:m.tracking,color:m.color,colorRole:m.colorRole,casing:['opening','italic'].includes(s.role)?'uppercase':'preserve',x:x+before,y,width:wm.width,ink:{left:x+before-wm.left,right:x+before+wm.right,top:y-wm.ascent,bottom:y+wm.descent},...resolved,travelX:travel,travelY:yellowRecipes[resolved.recipe].y??0,eventId:connected?`${g.id}-${si}`:`${g.id}-${si}-${wi}`};
        if(s.recipe==='line-fade'){// One connected opacity track; gate future words without restarting it.
          Object.assign(u,resolveYellowRecipe('line-fade',words[s.indices[0]].startMs,g.exitStartMs));
          u.gateMs=word.startMs;u.eventId=`${g.id}-${si}`;
        }
        u.graphemes=Array.from(new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(part),v=>v.segment);
        u.graphemeSlots=u.graphemes.map((text,k)=>({text,x:u.x+(k?metric(u.graphemes.slice(0,k).join(''),s.role,factor).width:0),baseline:u.y}));
        u.ranks=scatteredOrder(u.graphemes.length);g.units.push(u);prefix+=part+' ';
      }
      s.shaped={text,...m,x,y};
    }
    // Apply project transforms once to geometry, preserving design-canvas letter proportions.
    const o=plan.options;
    for(const u of g.units){u.x=o.anchor.x+(u.x-360)*o.scale;u.y=o.anchor.y+(u.y-688)*o.scale;u.size*=o.scale;u.tracking*=o.scale;u.travelX*=o.scale;u.travelY*=o.scale;
      u.ink={left:o.anchor.x+(u.ink.left-360)*o.scale,right:o.anchor.x+(u.ink.right-360)*o.scale,top:o.anchor.y+(u.ink.top-688)*o.scale,bottom:o.anchor.y+(u.ink.bottom-688)*o.scale};
      u.graphemeSlots=u.graphemeSlots.map(s=>({...s,x:o.anchor.x+(s.x-360)*o.scale,baseline:o.anchor.y+(s.baseline-688)*o.scale}));
      if(u.ink.left<48||u.ink.right>672||u.ink.top<8||u.ink.bottom>1272)throw Error(`Yellow Authority override exceeds safe bounds at word ${u.wordIndex}`);
    }
    output.push(g);
  }
  plan.groups=output;for(const [i,g]of output.entries()){g.id=`yellow-${i}`;for(const u of g.units)u.eventId=g.id+':'+u.eventId;}
  plan.measured=true;plan.palette=colors;plan.diagnostics=yellowDiagnostics(plan);return plan;
}
export function scatteredOrder(n){const mid=Math.floor(n/2);return [...new Set([n-1,0,mid,n-2,1,...Array.from({length:n},(_,i)=>i).sort((a,b)=>Math.abs(a-mid)-Math.abs(b-mid)||a-b)])].filter(i=>i>=0&&i<n);}
export function scatteredVisibility(n,elapsed,duration=500){if(elapsed<0)return Array(n).fill(0);if(elapsed>=duration)return Array(n).fill(1);const p=Math.min(9,Math.floor(elapsed/duration*10)),order=scatteredOrder(n);return Array.from({length:n},(_,i)=>{const rank=order.indexOf(i);return rank<Math.floor(n*p/9)||(rank+2*p)%5===0?1:0;});}
const clamp=n=>Math.min(1,Math.max(0,n));
export function yellowBezier(p,[x1,y1,x2,y2]){const f=(t,a,b)=>3*(1-t)**2*t*a+3*(1-t)*t*t*b+t**3;let lo=0,hi=1;for(let i=0;i<32;i++){const t=(lo+hi)/2;if(f(t,x1,x2)<p)lo=t;else hi=t;}return f((lo+hi)/2,y1,y2);}
export function yellowUnitState(u,timeMs){
  const elapsed=timeMs-u.startMs,r=yellowRecipes[u.recipe],p=u.duration?clamp(elapsed/u.duration):1;
  const eased=r.curve?yellowBezier(p,r.curve):p;
  const opacity=elapsed<0||timeMs<(u.gateMs??u.startMs)?0:r.opacity?clamp(elapsed/(r.opacity*u.trackScale)):1;
  return {...u,opacity,dx:(u.travelX??0)*(1-eased),dy:(u.travelY??0)*(1-eased),blur:0,scale:1,rotation:0,glyphOpacity:u.recipe==='scattered-glyph-resolve'?scatteredVisibility(u.graphemes.length,elapsed,u.duration):undefined};
}
export function yellowState(plan,timeMs){const g=plan.groups.find(g=>timeMs>=g.startMs&&timeMs<g.endMs);if(!g)return [];const exit=g.exitMs?clamp((g.endMs-timeMs)/g.exitMs):1;return g.units.map(u=>{const state=yellowUnitState(u,timeMs);return {...state,opacity:state.opacity*exit};});}
export function yellowDiagnostics(plan){
  const groups=plan.groups,tokens=groups.flatMap(g=>g.units??[]),events=groups.flatMap(g=>[...new Map((g.units??[]).map(u=>[u.eventId,u])).values()]);
  const counts=items=>items.reduce((a,k)=>(a[k]=(a[k]??0)+1,a),{});
  const panels=groups.reduce((n,g)=>n+(g.panels??1),0);
  const initial=groups.flatMap(g=>g.hook&&g.startMs===0?[]:[...(g.panels===2?[g.units[0],g.units.find(u=>u.line===2)]:[g.units?.[0]])]).filter(Boolean);
  const yellow=tokens.filter(u=>u.colorRole==='accent').length,italic=tokens.filter(u=>u.font==='italic').length;
  const ordinary=groups.filter(g=>g.spans.every(s=>s.role==='ordinary')).length;
  const animated=groups.filter(g=>g.units?.some(u=>u.recipe!=='phrase-cut')).length;
  return {motionGroups:{denominator:groups.length,static:groups.length-animated,animated,structuralAnimated:groups.filter(g=>g.structural&&g.units?.some(u=>u.recipe!=='phrase-cut')).length},groups:groups.length,panels,tokens:tokens.length,templates:counts(groups.map(g=>g.template)),groupCategories:{denominator:groups.length,ordinary,decorative:groups.length-ordinary,singleToken:groups.filter(g=>g.indices.length===1).length,multiline:groups.filter(g=>new Set(g.units?.map(u=>u.y)).size>1&&g.template!=='numbered-heading').length,containingYellow:groups.filter(g=>g.units?.some(u=>u.colorRole==='accent')).length},tokenRoles:{denominator:tokens.length,counts:counts(tokens.map(u=>u.role)),yellow,italic,shares:{yellow:yellow/tokens.length,italic:italic/tokens.length,upright:(tokens.length-italic)/tokens.length}},fontPresence:{denominator:panels,upright:groups.reduce((n,g)=>n+(g.units?.some(u=>u.font!=='italic')?(g.panels??1):0),0),italic:groups.filter(g=>g.units?.some(u=>u.font==='italic')).length},initialEntrances:{denominator:initial.length,counts:counts(initial.map(u=>u.recipe))},allRevealEvents:{denominator:events.length,counts:counts(events.map(u=>u.recipe))},exits:{denominator:groups.length,hardCut:groups.filter(g=>!g.exitMs).length,fade:groups.filter(g=>g.exitMs).length}};
}
