import test from 'node:test';
import assert from 'node:assert/strict';
import {planYellow as compileYellow,layoutYellow,yellowState,yellowUnitState,yellowRecipes,resolveYellowRecipe,scatteredOrder,scatteredVisibility,yellowOptions} from '../assets/caption-code/src/yellow.mjs';
import {timedRows,isolated,plainEditorialPlan} from './fixtures/yellow-example.mjs';
import {treatmentDemo} from './fixtures/yellow-treatments.mjs';
const planYellow=(s,o={})=>compileYellow(s,{...o,editorialPlan:plainEditorialPlan(s)});
// Deterministic fixture metrics exercise planning; real font shaping is checked by yellow-gallery.
const measure=(text,font,size,tracking)=>({width:[...text].length*(size*.45+tracking),left:font==='italic'?3:0,right:[...text].length*(size*.45+tracking),ascent:size*.75,descent:size*.1});
const layout=s=>layoutYellow(planYellow(s),measure);
test('preserves all original Caption fields and repeated indices, rejects negative durations',()=>{
  for(const s of Object.values(isolated)){const p=planYellow(s);assert.deepEqual(p.groups.flatMap(g=>g.indices),p.words.map(w=>w.index));for(const [i,w]of s.flatMap(s=>s.words).entries())assert.deepEqual({...p.words[i],index:undefined},{...w,index:undefined});}
  assert.throws(()=>planYellow([{words:[{text:'x',startMs:50,endMs:49}]}]),/timing/);
});
test('ordinary phrases respect four-word / 600ms lookahead and silence cleanup',()=>{
  for(const fixture of [isolated.ordinary,isolated.overlap,isolated.rapid,isolated.silence,timedRows()]){
    const p=layout(fixture);
    for(const g of p.groups.filter(g=>g.reason==='ordinary bounded phrase')){
      assert.ok(g.indices.length<=4);
      assert.ok(p.words[g.indices.at(-1)].startMs-p.words[g.indices[0]].startMs<=600);
    }
  }
  const p=layout(isolated.silence);assert.deepEqual(yellowState(p,900),[]);
  assert.deepEqual(yellowState(p,p.groups.at(-1).endMs),[]);
});
test('recipe curves preserve independent opacity, travel, zero blur and no scale at quartiles',()=>{
  const expected={ 'quick-rise':[24,125,167], 'number-settle':[-20,208,250], 'heading-glide':[0,250,375], 'comparative-tail-glide':[0,125,208]};
  // Independent high-resolution parametric inversion verifies the declared Bezier tracks.
  const ease=(x,c)=>{let best=0,distance=Infinity;for(let i=0;i<=100000;i++){let t=i/100000,q=1-t;const px=3*q*q*t*c[0]+3*q*t*t*c[2]+t*t*t;if(Math.abs(px-x)<distance){distance=Math.abs(px-x);best=3*q*q*t*c[1]+3*q*t*t*c[3]+t*t*t;}}return best;};
  for(const [recipe,r]of Object.entries(yellowRecipes))for(const fraction of [0,.25,.5,.75,1]){
    const u={recipe,startMs:0,duration:r.duration,nominalDuration:r.duration,trackScale:1,travelX:r.x??0,travelY:r.y??0,graphemes:['a','b','c']};
    const state=yellowUnitState(u,r.duration*fraction),e=r.curve?ease(fraction,r.curve):fraction;
    assert.ok(Math.abs(state.dx-(r.x??0)*(1-e))<.003);assert.ok(Math.abs(state.dy-(r.y??0)*(1-e))<.003);
    assert.equal(state.opacity,r.opacity?Math.min(1,r.duration*fraction/r.opacity):1);
    assert.equal(state.blur,0);assert.equal(state.scale,1);assert.equal(state.rotation,0);
  }
  assert.equal(expected['quick-rise'][0],yellowRecipes['quick-rise'].y);
  assert.equal(yellowRecipes['heading-glide'].x,96);
});
test('scattered phases follow stable ranks and never reveal a future word',()=>{
  assert.deepEqual(scatteredOrder(7),[6,0,3,5,1,2,4]);
  for(let p=0;p<10;p++){const order=scatteredOrder(7),v=scatteredVisibility(7,p*50);for(let rank=0;rank<7;rank++)assert.equal(v[order[rank]],rank<Math.floor(7*p/9)||(rank+2*p)%5===0?1:0);}
  assert.deepEqual(scatteredVisibility(7,500),Array(7).fill(1));
  assert.deepEqual(scatteredVisibility(7,-1),Array(7).fill(0));
  const p=layout(timedRows());for(const g of p.groups)for(const u of g.units){
    if(u.startMs<p.words[u.wordIndex].startMs){assert.ok(p.words[u.wordIndex].startMs-u.startMs<=600);assert.ok(['phrase-cut','line-rise','quick-rise','heading-glide','comparison-glide','comparative-tail-glide'].includes(u.recipe));}
    const s=yellowState(p,u.startMs-.1).find(s=>s.wordIndex===u.wordIndex);if(s)assert.equal(s.opacity,0);
  }
});

test('fast speech shortens tracks proportionally, bypasses below 83ms, and falls back from scatter',()=>{
  assert.equal(resolveYellowRecipe('scattered-glyph-resolve',0,449).recipe,'quick-rise');
  assert.equal(resolveYellowRecipe('scattered-glyph-resolve',0,450).duration,367);
  assert.equal(resolveYellowRecipe('quick-rise',0,100).recipe,'phrase-cut');
  assert.equal(resolveYellowRecipe('heading-glide',0,300).duration,217);
  assert.equal(resolveYellowRecipe('heading-glide',0,300).trackScale,217/375);
});
test('fixed slots, gap cleanup, diagnostics and JSON seek equivalence',()=>{
  const p=layoutYellow(treatmentDemo().plan,measure),copy=JSON.parse(JSON.stringify(p));
  for(const g of p.groups){for(const t of [g.startMs,g.startMs+125,g.endMs-1]){const states=yellowState(p,t);assert.deepEqual(states,yellowState(copy,t));for(const u of states){const saved=g.units.find(s=>s.wordIndex===u.wordIndex);assert.equal(u.x,saved.x);assert.equal(u.y,saved.y);assert.ok(saved.ink.left>=48&&saved.ink.right<=672);}}}
  assert.equal(p.diagnostics.tokens,p.words.length);assert.equal(p.diagnostics.tokenRoles.denominator,p.words.length);
  assert.equal(p.diagnostics.exits.denominator,p.groups.length);
  assert.ok(p.diagnostics.allRevealEvents.denominator>p.diagnostics.initialEntrances.denominator);
});
test('overrides are bounded, long unbreakable words fail explicitly instead of disappearing',()=>{
  assert.throws(()=>yellowOptions({density:2}),/Invalid/);assert.throws(()=>yellowOptions({phrases:{}}),/Unknown/);
  assert.throws(()=>layout(isolated.long),/Unbreakable/);
});

test('requires a contextual plan, accepts unfamiliar vocabulary and preserves independent motion',()=>{
  const sentences=timedRows(['Bewahre die Nuance.','Nuance bleibt wichtig.'],500,450,180);
  const editorialPlan={source:sentences.flatMap(s=>s.words).map(w=>w.text),groups:[
    {from:0,to:3,template:'support-emphasis',reason:'Nuance is the instruction’s focus',spans:[
      {from:0,to:2,role:'ordinary',recipe:'phrase-cut',line:0},
      {from:2,to:3,role:'emphasis',recipe:'quick-rise',line:1}]},
    {from:3,to:6,template:'plain-center',reason:'The repeated word now supports the explanation',spans:[{from:3,to:6,role:'ordinary',recipe:'phrase-cut'}]}
  ]};
  assert.throws(()=>compileYellow(sentences),/AI-authored/);
  const p=compileYellow(sentences,{editorialPlan});
  assert.equal(p.groups[0].spans[1].role,'emphasis');
  assert.equal(p.groups[1].spans[0].role,'ordinary');
  assert.deepEqual(p.groups.flatMap(g=>g.indices),[0,1,2,3,4,5]);
  editorialPlan.groups[0].spans[1].recipe='phrase-cut';
  const quiet=compileYellow(sentences,{editorialPlan});
  assert.equal(quiet.groups[0].spans[1].role,'emphasis');
  assert.equal(quiet.groups[0].spans[1].recipe,'phrase-cut');
  const measured=layoutYellow(p,measure);
  assert.ok(measured.groups[0].units.some(u=>u.colorRole==='accent'));
});
test('rejects stale sources, skipped/repeated words, invalid effects and pause crossings',()=>{
  const sentences=timedRows(['Again again again.']);
  for(const change of [
    p=>p.source[0]='Different',p=>p.groups.pop(),p=>p.groups[1].from=0,
    p=>p.groups[0].spans[0].to=2,p=>p.groups[0].spans[0].recipe='spin',
    p=>p.groups[0].spans[0].role='unknown',p=>p.groups[0].spans[0].line=5
  ]){const editorialPlan=plainEditorialPlan(sentences);change(editorialPlan);assert.throws(()=>compileYellow(sentences,{editorialPlan}),/Stale|cover|Invalid/);}
  const gap=timedRows(['First.','Second.'],240,200,900),editorialPlan=plainEditorialPlan(gap);
  editorialPlan.groups=[{...editorialPlan.groups[0],to:2,spans:[{from:0,to:2,role:'ordinary',recipe:'phrase-cut'}]}];
  assert.throws(()=>compileYellow(gap,{editorialPlan}),/pause/);
});
test('all authored templates retain coverage and seek determinism after layout',()=>{
  const {sentences,plan}=treatmentDemo(),p=layoutYellow(plan,measure);
  assert.deepEqual(p.groups.flatMap(g=>g.units.map(u=>u.wordIndex)),sentences.flatMap(s=>s.words).map((_,i)=>i));
  for(const t of [120,0,2400,800,120])assert.deepEqual(yellowState(p,t),yellowState(JSON.parse(JSON.stringify(p)),t));
});
test('AI-selected white pull-ups use source onsets and settle in reserved positions',()=>{
  const sentences=timedRows(['Notice each word.'],250,500,0);
  const editorialPlan={source:sentences.flatMap(s=>s.words).map(w=>w.text),groups:[{
    from:0,to:3,template:'plain-center',reason:'The measured cadence supports a restrained word build',
    spans:[{from:0,to:3,role:'ordinary',recipe:'word-pull-up'}]
  }]};
  const p=layoutYellow(compileYellow(sentences,{editorialPlan}),measure);
  for(const u of p.groups[0].units){
    assert.equal(u.startMs,p.words[u.wordIndex].startMs);
    assert.equal(u.colorRole,'base');
    assert.equal(yellowUnitState(u,u.startMs-1).opacity,0);
    assert.ok(yellowUnitState(u,u.startMs+60).dy>0);
    const end=yellowUnitState(u,u.startMs+u.duration);
    assert.equal(end.opacity,1);assert.ok(Math.abs(end.dy)<.001);
  }
});
