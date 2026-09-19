import test from 'node:test';
import assert from 'node:assert/strict';
import {brunsonLayout,brunsonState} from '../assets/caption-code/src/brunson.mjs';
import {sentences,styleOptions} from './fixtures/brunson-example.mjs';
import {resolveSettings,loadConfig} from '../scripts/core.mjs';
const measure=(t,r,s)=>({width:t.length*s*.3,left:0,right:t.length*s*.3,ascent:s*.7,descent:s*.1});
const build=(s=sentences,o=styleOptions)=>brunsonLayout(s,measure,1080,1920,o);
test('catalog configuration resolves role defaults and exact font identities',()=>{
  const settings=resolveSettings({style:'brunson-red-script',colorsAccepted:true,styleOptions},loadConfig());
  assert.equal(settings.fonts.primary.originalFamily,'Brunson');
  assert.equal(settings.fonts.script.originalFamily,'Brush Script MT');
  assert.equal(settings.fonts.script.style,'italic');
  assert.equal(settings.styleOptions.sizes.default,54);
  assert.equal(settings.colors.headline,'#EA1315');
  assert.deepEqual(settings.styleOptions.phrases,styleOptions.phrases);
});
test('hero holds fixed positions, script occurs once, default cuts preserve pauses',()=>{
  const before=JSON.stringify(sentences),segments=build();
  assert.equal(JSON.stringify(sentences),before);
  const a=brunsonState(segments,350),b=brunsonState(segments,1300);
  assert.deepEqual(a.groups[0].lines,b.groups[0].lines);
  assert.equal(b.groups.filter(g=>g.role==='script').length,1);
  assert.equal(b.groups.at(-1).text,'machen');
  assert.equal(brunsonState(segments,1500),null);
  assert.equal(brunsonState(segments,1600).groups[0].opacity,1);
  assert.equal(brunsonState(segments,1850).groups.length,0);
  assert.equal(brunsonState(segments,1900).groups[0].text,'MEIN');
  assert.equal(brunsonState(segments,2600).groups[0].text,'ICH BIN 18 JAHRE');
  for(const t of [1600,1700,1849]){const g=brunsonState(segments,t).groups[0];assert.equal(g.dy,0);assert.equal(g.blur,0);assert.equal(g.opacity,1);}
});
test('entrances settle sharp; shuffled seeks are identical and fast speech shortens motion',()=>{
  const s=build(),expected=brunsonState(s,1200);
  for(const t of [1400,0,500,1600,1200])brunsonState(s,t);
  assert.deepEqual(brunsonState(s,1200),expected);
  assert.equal(brunsonState(s,160).groups[0].blur,0);
  assert.ok(brunsonState(s,40).groups[0].dy>0);
  const fast=structuredClone(sentences.slice(0,1));fast[0].words.forEach((w,i)=>{w.startMs=i*40;w.endMs=(i+1)*40;});
  const segments=build(fast,{phrases:{0:{...styleOptions.phrases[0],endMs:300}}});
  assert.equal(brunsonState(segments,40).groups[0].dy,0);
});
test('reject duplicate indices, illegal default animation, overflow and overlapping units',()=>{
  const mutate=fn=>{const o=structuredClone(styleOptions);fn(o);return o;};
  assert.throws(()=>build(sentences,mutate(o=>o.phrases[0].groups[1].from=0)),/indices/);
  assert.throws(()=>build(sentences,mutate(o=>o.phrases[1].groups[0].entrance='rise-fade')),/instant/);
  assert.throws(()=>build(sentences,mutate(o=>o.phrases[1].groups[0].endMs=2100)),/overlaps/);
  assert.throws(()=>build([{words:[{text:'W'.repeat(100),startMs:0,endMs:1000}]}],{}),/safe width/);
});
test('two lines are explicit; transcript casing and repeated word indices survive',()=>{
  const words=['Straße',' Straße',' ÄÖÜ'].map((text,i)=>({text,startMs:i*100,endMs:(i+1)*100}));
  const s=build([{words}],{phrases:{0:{mode:'default',groups:[{from:0,to:3,breakAfter:[2]}]}}});
  assert.equal(s[0].groups[0].lines.length,2);
  assert.equal(s[0].groups[0].originalText,'Straße Straße ÄÖÜ');
  assert.equal(s[0].groups[0].text,'STRASSE STRASSE ÄÖÜ');
});
