import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import {once} from 'node:events';
import {skillRoot,writeJson,readJson} from '../scripts/core.mjs';

test('gallery process reports Save to the waiting agent without losing independent work', {timeout:15000}, async()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'gallery-event-'));
  const runFile=path.join(dir,'run.json');
  writeJson(runFile,{projectName:'pending'});
  const child=spawn(process.execPath,[path.join(skillRoot,'scripts/gallery.mjs'),runFile],{stdio:['ignore','pipe','pipe']});
  const lines=createInterface({input:child.stdout});
  const iterator=lines[Symbol.asyncIterator]();
  try {
    const {value:url}=await iterator.next();
    assert.match(url,/^http:\/\/127\.0\.0\.1:/);
    writeJson(runFile,{...readJson(runFile),timing:{status:'word-timing-reviewed',provenance:'test'}});
    const endpoint=new URL(url);endpoint.pathname='/select';
    const style=readJson(path.join(skillRoot,'styles/catalog.json')).find(s=>s.id==='montserrat-difference');
    const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({style:style.id,colors:style.colors})});
    assert.equal(response.status,200);
    const event=JSON.parse((await iterator.next()).value);
    assert.equal(event.event,'selection-saved');
    assert.equal(event.style,style.id);
    assert.equal(readJson(runFile).timing.status,'word-timing-reviewed');
    assert.equal(readJson(runFile).colorsAccepted,true);
  } finally {
    lines.close();
    const exited=once(child,'exit');child.kill();await exited;
    fs.rmSync(dir,{recursive:true,force:true});
  }
});
