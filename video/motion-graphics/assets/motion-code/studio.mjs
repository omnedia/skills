import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {requireFresh} from './project.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');requireFresh(root);
const child=spawn(process.execPath,[path.join(root,'node_modules/@remotion/cli/remotion-cli.js'),'studio','motion/src/index.tsx','--no-open'],{cwd:root,stdio:'inherit'});child.on('exit',code=>process.exitCode=code??1);
// Stop the live session if authoring inputs change; never continue displaying stale geometry.
const timer=setInterval(()=>{try{requireFresh(root);}catch(error){console.error(error.message);child.kill();clearInterval(timer);process.exitCode=1;}},1500);
child.on('exit',()=>clearInterval(timer));
