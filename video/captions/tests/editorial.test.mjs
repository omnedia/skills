import test from 'node:test';
import assert from 'node:assert/strict';
import {editorialLayout,editorialState} from '../assets/caption-code/src/editorial.mjs';
import {resolveSettings,loadConfig,skillRoot,readJson} from '../scripts/core.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const measure = (text,role,size) => ({width:text.length*size*.5,left:0,right:text.length*size*.5,ascent:size*.8,descent:size*.2});
const words = (text,start=0,step=200) => text.split(' ').map((text,i)=>({text:`${i?' ':''}${text}`,startMs:start+i*step,endMs:start+(i+1)*step}));
const layout = (sentences,options) => editorialLayout(sentences,measure,1080,1920,options);

test('full composition reserves repeated words by index and preserves text/times',()=>{
  const sentence={words:words('Go go go!')};
  const segments=layout([sentence],{phrases:{0:{groupSizes:[1,1,1]}}});
  assert.equal(segments[0].words,sentence.words);
  assert.deepEqual(segments[0].groups.map(g=>g.from),[0,1,2]);
  assert.equal(segments[0].groups.map(g=>g.text).join(' ' ).replace(/\s+/g,' '),'Go go go!');
  const early=editorialState(segments,50),late=editorialState(segments,500);
  assert.deepEqual(early.groups.map(g=>[g.x,g.y,g.width]),late.groups.map(g=>[g.x,g.y,g.width]));
  assert.equal(early.groups[1].opacity,0);
  assert.equal(late.groups[0].opacity,1);
});
test('fast speech, immediate transitions, fades, group starts and seeking',()=>{
  const segments=layout([{words:words('Fast fast now',0,40)},{words:words('Then done',120,40)}],{phrases:{0:{groupSizes:[1,1,1],underline:'orange'}}});
  assert.equal(editorialState(segments,39).groups[1].opacity,0);
  assert.equal(editorialState(segments,80).groups[0].opacity,1);
  assert.equal(editorialState(segments,119).segment,segments[0]);
  assert.equal(editorialState(segments,120).segment,segments[1]);
  assert.ok(editorialState(segments,250).opacity<1);
  assert.equal(editorialState(segments,340),null);
  const snapshot=editorialState(segments,90);
  for(const t of [300,5,200,60]) editorialState(segments,t);
  assert.deepEqual(editorialState(segments,90),snapshot);
  const grouped=layout([{words:words('in my story')}]);
  assert.equal(grouped[0].groups[0].to,2);
  assert.equal(grouped[0].groups[0].startMs,0);
});
test('underline delays/draw clamps and directional travel stay bounded',()=>{
  const segments=layout([{words:words('Your story')}],{phrases:{0:{underline:'white',directions:{0:'top',1:'right'}}}});
  assert.equal(editorialState(segments,250).groups[1].draw,0);
  const state=editorialState(segments,300);
  assert.ok(state.groups[1].draw>0);
  assert.ok(state.groups[1].dx>0);
  for(let t=0;t<540;t+=10){const s=editorialState(segments,t);if(!s)continue;for(const g of s.groups){assert.ok(g.x-g.left+g.dx>=1080*.08);assert.ok(g.x+g.right+g.dx<=1080*.92);assert.ok(g.y-g.ascent+g.dy>=1920*.08);assert.ok(g.draw>=0&&g.draw<=1);}}
});
test('long words stop with actionable guidance; invalid grouping cannot reorder words',()=>{
  assert.throws(()=>layout([{words:words('A '+ 'x'.repeat(100))}]),/safe width/);
  assert.throws(()=>layout([{words:words('one two three')}],{phrases:{0:{groupSizes:[3]}}}),/line boundary/);
  assert.throws(()=>layout([{words:words('one two')}],{phrases:{0:{lines:[{count:1,role:'serif'}]}}}),/cover all words/);
  assert.throws(()=>layout([{words:words('one two')}],{minFitScale:-1}),/minFitScale/);
  const afterEmpty=layout([{words:[]},{words:words('one two')}],{phrases:{1:{emphasisIndex:0}}});
  assert.equal(afterEmpty[0].template,'title-deck');
});
test('catalog resolves role colors and all exact bundled fonts with licenses',()=>{
  const settings=resolveSettings({style:'editorial-kinetic',colorsAccepted:true,colors:{accent:'#123456'}},loadConfig());
  assert.equal(settings.colors.accent,'#123456');
  assert.equal(settings.colors.creamTop,'#E1F8F2');
  assert.equal(settings.font.family,'CaptionsEditorialPoppins');
  const manifest=readJson(path.join(skillRoot,'styles/editorial-kinetic/fonts/source.json'));
  for(const font of Object.values(manifest.fonts)){
    assert.equal(createHash('sha256').update(fs.readFileSync(path.join(skillRoot,'styles/editorial-kinetic',font.asset))).digest('hex'),font.sha256);
    assert.ok(fs.existsSync(path.join(skillRoot,'styles/editorial-kinetic/fonts',font.license)));
    assert.ok(font.codepoints.includes(65));
  }
});
