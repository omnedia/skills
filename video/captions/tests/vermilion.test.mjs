import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {planVermilion,layoutVermilion,vermilionState,isVermilionScript} from '../assets/caption-code/src/vermilion.mjs';
import {resolveSettings,loadConfig,prepareProject,writeJson} from '../scripts/core.mjs';
import os from 'node:os';
import path from 'node:path';
import {sentences as referenceSentences,styleOptions as referenceOptions} from './fixtures/vermilion-example.mjs';
const measure=(text,role,size)=>({width:text.length*size*.28,left:0,right:text.length*size*.28,ascent:size*.7,descent:size*.12});
const sentence=(texts,start=0,step=300)=>({words:texts.split(' ').map((text,i)=>({text:(i?' ':'')+text,startMs:start+i*step,endMs:start+(i+1)*step}))});
const layout=(s,o={})=>layoutVermilion(planVermilion(s,o),measure,1080,1920,o);
test('automatic font balance spans decorative, ordinary and stack phrases without changing timing',()=>{
 const s=[sentence('STOP using your MUSIC wrong.'),sentence('you will make that mistake again.',2000),sentence('Keep every spoken word in place.',4000)];
 const o={phrases:{2:{mode:'stack',defaults:{size:90}}}},p=planVermilion(s,o);
 const count=p.phrases.flatMap(p=>p.groups).filter(g=>isVermilionScript(g.role)).length;
 assert.equal(count,Math.round(p.words.length/2));
 assert.deepEqual(p.phrases[0].groups.map(g=>isVermilionScript(g.role)),[false,true,true,false,true]);
 assert.ok(p.phrases[1].groups.some(g=>g.role==='ordinary-script'));
 assert.ok(p.phrases[2].groups.some(g=>isVermilionScript(g.role)));
 const l=layout(s,o),u=l[1].units.find(u=>u.role==='ordinary-script');
 assert.equal(u.size,120);assert.equal(u.color,'#FFFFFF');
 const visible=vermilionState(l,u.startMs).find(v=>v.wordIndex===u.wordIndex);
 assert.equal(visible.opacity,1);assert.equal(visible.dy,0);assert.equal(visible.motionBlur,0);
 assert.deepEqual(p.words.map(({index,...w})=>w),s.flatMap(s=>s.words));
 assert.deepEqual(planVermilion(s,o),p);
});
test('short phrases carry font balance forward and explicit groups stay authoritative',()=>{
 const s=Array.from({length:12},(_,i)=>sentence('Word.',i*600));
 const p=planVermilion(s);
 assert.equal(p.phrases.filter(p=>isVermilionScript(p.groups[0].role)).length,6);
 const options={phrases:{0:{groups:[{from:0,to:1,role:'ordinary'}]}}};
 const authored=planVermilion(s,options);
 assert.equal(authored.phrases[0].groups[0].role,'ordinary');
 assert.equal(authored.phrases.slice(1).filter(p=>isVermilionScript(p.groups[0].role)).length,6);
 for(const share of [0,.25,.5,.75,1]){
   const result=planVermilion(s,{scriptShare:share});
   assert.equal(result.phrases.filter(p=>isVermilionScript(p.groups[0].role)).length,Math.round(s.length*share));
 }
 for(const share of [-.1,1.1,NaN])assert.throws(()=>planVermilion(s,{scriptShare:share}),/scriptShare/);
});
test('registration, exact face and defaults',()=>{
 const s=resolveSettings({style:'vermilion-brush-editorial',colorsAccepted:true},loadConfig());
 assert.equal(s.fonts.primary.originalFamily,'Brunson');assert.equal(s.fonts.primary.weight,400);
 assert.equal(s.fonts.script.originalFamily,'Brush Script MT');assert.equal(s.fonts.script.style,'italic');
 assert.equal(s.styleOptions.roles.ordinary.size,96);assert.equal(s.colors.ordinary,'#EB2F0C');
});
test('shared transcript preserves wording/times and decorates only opening by default',()=>{
 const input=JSON.parse(fs.readFileSync(new URL('../preview-transcript.json',import.meta.url)));
 const sentences=[{words:input.words.map(w=>({text:w.text,startMs:w.start*1000,endMs:w.end*1000}))}];
 const before=JSON.stringify(sentences),p=planVermilion(sentences);
 assert.equal(p.phrases.length,4);assert.equal(p.phrases.filter(p=>p.mode==='decorative').length,1);
 assert.equal(p.phrases[0].groups.filter(g=>g.role==='emphasis').length,1);
 assert.equal(JSON.stringify(sentences),before);assert.deepEqual(p.words.map(w=>w.text),input.words.map(w=>w.text));
 assert.equal(vermilionState(layout(sentences),2600).length,0);
});
test('replacement reveals each occurrence at its onset, stays instant and clears gaps',()=>{
 const s=[sentence('the the word.',0,50),sentence('next word.',1200)];
 const o={phrases:{0:{mode:'ordinary',groups:[{from:0,to:3,role:'ordinary'}]}}};
 const l=layout(s,o);
 assert.deepEqual(vermilionState(l,49).map(u=>u.wordIndex),[0]);
 assert.deepEqual(vermilionState(l,50).map(u=>u.wordIndex),[0,1]);
 assert.equal(vermilionState(l,50)[0].x,vermilionState(l,100)[0].x);
 assert.equal(vermilionState(l,150).length,0);
 const plain=layout(s,{phrases:{0:{mode:'ordinary'}}});
 assert.deepEqual(vermilionState(plain,50).map(u=>u.wordIndex),[1]);
 assert.equal(vermilionState(plain,50)[0].opacity,1);assert.equal(vermilionState(plain,50)[0].dy,0);
});
test('accumulation and entrance are independent; fast rises settle, seeks are pure',()=>{
 const s=[sentence('MAKE SURE TO MAKE THEM WEAR SUNGLASSES.',0,60)];
 const o={phrases:{0:{mode:'stack',defaults:{size:90,entrance:'rise-fade',travel:100,blur:18}}}};
 const l=layout(s,o),a=vermilionState(l,61),b=vermilionState(l,181);
 const first=a.find(u=>u.wordIndex===0),later=b.find(u=>u.wordIndex===0);
 assert.equal(first.dy,0);assert.equal(first.motionBlur,0);assert.equal(first.y,later.y);
 const expected=vermilionState(l,100);[400,0,40,200].forEach(t=>vermilionState(l,t));assert.deepEqual(vermilionState(l,100),expected);
 assert.equal(vermilionState(l,420).length,0);
});
test('closing rule does not invent text or force decoration at regular intervals',()=>{
 const s=[sentence('Start with rhythm.'),sentence('Follow for more.',12000),sentence('Read these instructions.',25000)];
 const p=planVermilion(s);assert.deepEqual(p.phrases.map(p=>p.mode),['decorative','decorative','ordinary']);
 assert.equal(p.phrases[1].template,'callout');assert.equal(p.words.length,9);
});
test('overflow splits rows before fitting and impossible tokens fail clearly',()=>{
 const l=layout([sentence('Extraordinary typography supports readable captions.')]);
 assert.ok(l[0].units.every(u=>u.size>=90));
 assert.throws(()=>layout([sentence('W'.repeat(120))]),/cannot fit/);
});
test('invalid indices, timing and parameters fail before rendering',()=>{
 const s=[sentence('Use your words.')];
 assert.throws(()=>planVermilion(s,{phrases:{0:{groups:[{from:1,to:3,role:'hero'}]}}}),/indices/);
 assert.throws(()=>planVermilion(s,{roles:{hero:{size:-1}}}),/geometry/);
 const bad=structuredClone(s);bad[0].words[1].startMs=0;assert.throws(()=>planVermilion(bad),/timing/);
});
test('prepare persists decisions independently of shared defaults and preserves color override precedence',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'vermilion-plan-test-'));
 const sentences=[sentence('Start with rhythm.')];
 const input=path.join(root,'input.json'),instructionPath=path.join(root,'plugin.md');
 writeJson(input,{sentences});fs.writeFileSync(instructionPath,'---\nname: remotion-test-fixture\n---\n');
 const styleOptions={roles:{hero:{color:'#EB2F0C'}}};
 const prepared=prepareProject({style:'vermilion-brush-editorial',colorsAccepted:true,projectName:'test',normalizedPath:input,
  plugin:{availableInApp:true,instructionPath,checkedAt:new Date().toISOString()},timing:{status:'word-timing-reviewed',provenance:'test fixture'},
  colors:{block:'#00FF00'},styleOptions},{saved:{...loadConfig(),projectFolder:root},checkRuntime:()=>({test:true})});
 const settings=prepared.prepared.settings;
 assert.deepEqual(settings.styleOverrides,styleOptions);assert.equal(settings.layoutPlan.version,1);
 const l=layoutVermilion(settings.layoutPlan,measure,1080,1920,settings.styleOptions,settings.colors);
 assert.equal(l[0].units.find(u=>u.role==='hero').color,'#EB2F0C');
 assert.equal(l[0].units.find(u=>u.role==='connector')?.color??'#FFFFFF','#FFFFFF');
 assert.deepEqual(settings.layoutPlan.words.map(w=>w.index),[0,1,2]);
});
test('authored punctuation stacks use reviewed ranges without dropping words or bridging pauses',()=>{
 const s=[sentence('WHY? YOU ASK?')],o={phraseRanges:[[0,3]],phrases:{0:{mode:'stack',template:'stagger'}}};
 const p=planVermilion(s,o);assert.equal(p.phrases.length,1);
 assert.deepEqual(vermilionState(layout(s,o),700).sort((a,b)=>a.wordIndex-b.wordIndex).map(u=>u.text.toUpperCase()),['WHY?','YOU','ASK?']);
 const gap=structuredClone(s);gap[0].words[2].startMs=1300;gap[0].words[2].endMs=1500;
 assert.throws(()=>planVermilion(gap,o),/genuine gap/);
});
test('seven reference arrangements retain complete words, separate regions and script layer order',()=>{
 const p=planVermilion(referenceSentences,referenceOptions),l=layout(referenceSentences,referenceOptions);
 assert.equal(l.length,7);assert.equal(p.words.length,30);
 assert.ok(l[0].units[1].y-l[0].units[0].y>600);
 assert.ok(l[2].units.find(u=>u.role==='emphasis').zIndex>l[2].units.find(u=>u.role==='hero').zIndex);
 for(const phrase of l){
   const end=vermilionState(l,phrase.endMs-180);
   assert.equal(end.length,phrase.to-phrase.from);
   assert.equal(vermilionState(l,phrase.endMs+1).length,0);
 }
});
