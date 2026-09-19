import {test} from 'node:test';
import assert from 'node:assert/strict';
import {montserratLayout,montserratState} from '../assets/caption-code/src/montserrat.mjs';
import {resolveSettings,loadConfig} from '../scripts/core.mjs';
const words=(text,step=250)=>text.split(' ').map((t,i)=>({text:(i?' ':'')+t,startMs:i*step,endMs:(i+1)*step,timestampMs:null,confidence:null}));
const measure=(text,w,i,size)=>({width:text.length*size*.5,left:0,right:text.length*size*.5,ascent:size*.75,descent:size*.2});
const layout=(text,p,step=250)=>montserratLayout([{words:words(text,step)}],measure,1080,1920,{phrases:{0:p}});
test('build reserves layout, casing preserves original text and repeated indices',()=>{
  const s=layout('für für Straße',{groups:[{from:0,to:1,line:0},{from:1,to:2,line:0},{from:2,to:3,line:1,emphasis:true}]});
  assert.equal(s[0].groups[2].text,'STRASSE');assert.equal(s[0].groups[2].originalText,' Straße');
  const a=montserratState(s,100),b=montserratState(s,550);
  assert.deepEqual(a.groups.map(g=>[g.x,g.y]),b.groups.map(g=>[g.x,g.y]));
  assert.equal(a.groups[1].opacity,0);assert.equal(b.groups[0].opacity,1);
});
test('instant replacement has no intermediate state, soft reveal shortens for fast speech',()=>{
  const s=layout('AN DEINER SEITE SUCHST',{layout:'single',behavior:'replace',reveal:'instant',groups:[0,1,2,3].map(from=>({from,to:from+1}))},40);
  assert.deepEqual(montserratState(s,40).groups.map(g=>g.opacity),[0,1,0,0]);
  assert.equal(montserratState(s,40).groups[1].progress,1);
  assert.equal(s[0].groups[0].x,s[0].groups[3].x);
  const f=layout('go go',{groups:[{from:0,to:1},{from:1,to:2}],revealMs:200},40);
  assert.equal(montserratState(f,40).groups[0].progress,1);
  assert.equal(montserratState(f,40).groups[1].progress,0);
});
test('targeted replacement retains surrounding text and reserves longest alternative',()=>{
  const s=layout('EINEN PERSÖNLICHEN PROFESSIONELLEN',{groups:[{from:0,to:1,line:0},{from:1,to:2,line:1,slot:'adjective'},{from:2,to:3,line:1,slot:'adjective'}]});
  const a=montserratState(s,300),b=montserratState(s,600);
  assert.equal(a.groups[0].x,b.groups[0].x);assert.equal(b.groups[0].opacity,1);
  assert.equal(b.groups[1].opacity,0);assert.equal(b.groups[2].opacity,.5);
});
test('safe boundaries reject oversized German text, bad membership and overlap',()=>{
  assert.throws(()=>layout('Grundstücksverkehrsgenehmigungszuständigkeit',{groups:[{from:0,to:1,emphasis:true}]}),/safe bounds/);
  assert.throws(()=>layout('eins zwei',{groups:[{from:1,to:2}]}),/indices/);
  assert.throws(()=>montserratLayout([{words:words('eins')},{words:words('zwei')}],measure,1080,1920,{phrases:{0:{groups:[{from:0,to:1}]},1:{groups:[{from:0,to:1}]}}}),/overlaps/);
});
test('state is deterministic, exits clamp at next phrase and source offset remains external',()=>{
  const s=layout('Hallo',{groups:[{from:0,to:1}],endMs:500,exitMs:100});
  assert.deepEqual(montserratState(s,120),montserratState(s,120));
  assert.equal(montserratState(s,550).groups[0].opacity,.5);assert.equal(montserratState(s,600),null);
});
test('configuration defaults to one alpha overlay and preserves explicit delivery',()=>{
  const run={style:'montserrat-difference',colorsAccepted:true};
  assert.deepEqual(resolveSettings(run,loadConfig()).delivery,{mode:'alpha'});
  assert.throws(()=>resolveSettings({...run,delivery:{mode:'unknown'}},loadConfig()),/delivery/);
  const s=resolveSettings({...run,delivery:{mode:'layers'},styleOptions:{thinWeight:100}},loadConfig());
  assert.equal(s.styleOptions.thinWeight,100);assert.equal(s.styleOptions.revealMs,200);assert.equal(Object.keys(s.fonts).length,8);
});

test('entrance fades whole groups with a small eased rightward glide and stable anchors',()=>{
  const s=layout('Hallo',{groups:[{from:0,to:1}],endMs:500});
  const states=[0,50,100,200,240].map(t=>montserratState(s,t).groups[0]);
  assert.deepEqual(states.map(g=>g.opacity),[0,.25,.5,1,1]);
  assert.deepEqual(states.map(g=>g.offsetX),[-12,-5.0625,-1.5,0,0]);
  assert.ok(states.every(g=>g.x===states[0].x && g.y===states[0].y));
  const half=montserratLayout([{words:words('Hallo')}],measure,540,960,{phrases:{0:{groups:[{from:0,to:1}]}}});
  assert.equal(montserratState(half,0).groups[0].offsetX,-6);
  for(const override of [{reveal:'instant'},{revealMs:0}]) {
    const snap=layout('Hallo',{layout:'single',groups:[{from:0,to:1}],...override});
    assert.equal(montserratState(snap,0).groups[0].opacity,1);
    assert.equal(montserratState(snap,0).groups[0].offsetX,0);
  }
});

test('stacked layouts always fade even with instant or zero-duration overrides',()=>{
  for(const type of ['stacked','asymmetric','number']) {
    const s=layout('one two',{layout:type,reveal:'instant',revealMs:0,groups:[
      {from:0,to:1,number:type==='number',reveal:'instant',revealMs:0},
      {from:1,to:2,line:1},
    ]});
    assert.ok(s[0].groups.every(g=>g.reveal==='fade-ltr' && g.revealMs>0));
    assert.equal(montserratState(s,0).groups[0].opacity,0);
    assert.equal(montserratState(s,100).groups[0].opacity,.5);
  }
});
test('one accent per composition, compared by resolved source color',()=>{
  const group=(from,sourceColor)=>({from,to:from+1,sourceColor});
  assert.throws(()=>layout('one two',{groups:[group(0,'#FF3030'),group(1,'#D8B86C')]}),/one accent/);
  assert.doesNotThrow(()=>layout('one two',{groups:[group(0,'#ff3030'),group(1,'#FF3030')]}));
  assert.doesNotThrow(()=>layout('one two',{groups:[group(0,'#F7F5EF'),group(1,'#208CFF')]}));
});
test('gallery uses exact nine-second transcript and valid single-accent animated stacks',async()=>{
  const {sentences,styleOptions,transcript}=await import('./fixtures/montserrat-example.mjs');
  const colors={base:'#F7F5EF',accent:'#FF3030',blue:'#208CFF',turquoise:'#20D6BE',gold:'#D8B86C'};
  const segments=montserratLayout(sentences,measure,1080,1920,styleOptions,colors);
  assert.equal(transcript.duration,9);assert.equal(segments.at(-1).endMs,9000);
  assert.deepEqual(sentences.flatMap(s=>s.words).map(w=>[w.text.trim(),w.startMs,w.endMs]),
    transcript.words.map(w=>[w.text,Math.round(w.start*1000),Math.round(w.end*1000)]));
  for(const [i,s] of segments.entries()) {
    assert.ok(new Set(s.groups.map(g=>g.color).filter(c=>c!==colors.base)).size<=1);
    assert.ok(s.groups.every(g=>g.reveal===(styleOptions.phrases[i].layout==='single'?'instant':'fade-ltr')));
  }
});
