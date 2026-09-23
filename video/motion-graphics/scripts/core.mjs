import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {readJson,writeJson,hash} from '../assets/motion-code/io.mjs';
import {merge,validatePlan,validateSettings} from '../assets/motion-code/contract.mjs';
export {readJson,writeJson};
export const skillRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const configPath=()=>path.join(os.homedir(),'.config','codex-motion-graphics','config.json');
const fields=['projectFolder','width','height','fps','sourceOffsetMs','timelinePlacementMs','delivery','renderByDefault','colors','exclusions','export'];
const select=o=>Object.fromEntries(Object.entries(o).filter(([k])=>fields.includes(k)));
export function loadConfig(file=configPath()){return validateSettings(merge(readJson(path.join(skillRoot,'config/defaults.json')),fs.existsSync(file)?select(readJson(file)):{}));}
export function saveConfig(changes,file=configPath()){for(const k of Object.keys(changes))if(!fields.includes(k))throw Error(`Unknown configuration field ${k}`);const s=validateSettings(merge(loadConfig(file),changes));writeJson(file,s);return s;}
export function requirePlugin(e){if(!e?.availableInApp||!e.instructionPath||!Number.isFinite(Date.parse(e.checkedAt))||Math.abs(Date.now()-Date.parse(e.checkedAt))>86400000||!/name:\s*remotion/.test(fs.readFileSync(e.instructionPath,'utf8')))throw Error('Verify the currently exposed Remotion plugin and record availableInApp, instructionPath, checkedAt; preserve the run while blocked');}
export function command(exe,args,cwd){const win=process.platform==='win32'&&exe==='npm';const r=spawnSync(win?'npm.cmd':exe,args,{cwd,encoding:'utf8',shell:win});if(r.error||r.status!==0)throw Error(`${exe} failed: ${r.error?.message??''}\n${r.stderr}\n${r.stdout}`);return r.stdout;}
export function runtimeReady(){if(Number(process.versions.node.split('.')[0])<22)throw Error('Node 22+ required');return {node:process.version,npm:command('npm',['--version']).trim()};}
export function resolveSettings(run,saved=loadConfig()){const style=readJson(path.join(skillRoot,'styles/catalog.json'))[0];if(run.style&&run.style!==style.id)throw Error('Unsupported style');if(run.pickerOpened&&!run.colorsAccepted)throw Error('Wait for picker Save before preparing');return validateSettings(merge(merge(saved,{colors:merge(style.colors,saved.colors)}),select(run)));}
export function prepareProject(run,{saved=loadConfig(),checkRuntime=runtimeReady}={}){
 requirePlugin(run.plugin);checkRuntime();
 if(run.pickerOpened&&!run.colorsAccepted)throw Error('Wait for picker Save before resuming');
 if(run.prepared&&run.projectPath)return run;
 const settings=resolveSettings(run,saved),plan=readJson(run.planPath),source=run.sourcePath?readJson(run.sourcePath):{words:[]};
 const result=validatePlan(plan,source,settings,readJson(path.join(skillRoot,'styles/catalog.json')));
 for(const asset of plan.assets??[])if(!fs.existsSync(path.resolve(path.dirname(run.planPath),asset.path)))throw Error(`Missing local asset ${asset.id}: ${asset.path}`);
 if(result.status!=='validated')return {...run,status:'needs-word-timing',blocker:'Provide actual word timestamps; untimed scene plan retained'};
 if(!settings.projectFolder)throw Error('Set projectFolder for generated projects');
 if(!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(run.projectName??'')||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(run.projectName))throw Error('Use a safe projectName');
 const original=path.resolve(settings.projectFolder,run.projectName);let target=original;
 for(let i=2;fs.existsSync(target);i++)target=`${original}-${i}`;
 return {...run,projectPath:target,status:'prepared',prepared:{settings,plan,source,planRoot:path.dirname(path.resolve(run.planPath))}};
}
export function attachProject(run){
 requirePlugin(run.plugin);if(!run.prepared||!run.projectPath)throw Error('Prepare before attachment');
 const root=path.resolve(run.projectPath),packageFile=path.join(root,'package.json'),pkg=readJson(packageFile);
 if(!(pkg.dependencies?.remotion??pkg.devDependencies?.remotion))throw Error('Let the Remotion plugin scaffold this project first');
 const stateFile=path.join(root,'.motion-attachment.json'),state=fs.existsSync(stateFile)?readJson(stateFile):{identity:1,files:{},complete:false};
 if(state.identity!==1)throw Error('Incompatible attachment');
 if(state.complete)return root; // Preserve all user source edits on reattachment.
 const files=new Map();
 function addTree(dir,dest){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,e.name),d=dest+'/'+e.name;if(e.isDirectory())addTree(p,d);else files.set(d,fs.readFileSync(p));}}
 addTree(path.join(skillRoot,'assets/motion-code'),'motion');
 addTree(path.join(skillRoot,'styles/editorial-collage/fonts'),'public/fonts');
 files.set('motion/catalog.json',fs.readFileSync(path.join(skillRoot,'styles/catalog.json')));
 const {settings,plan,source,planRoot}=run.prepared,authored=structuredClone(plan);
 for(const a of authored.assets??[]){const original=path.resolve(planRoot,a.path),bytes=fs.readFileSync(original),ext=path.extname(original).toLowerCase();if(!['.svg','.png','.jpg','.jpeg','.webp'].includes(ext))throw Error('Use supported local still-image assets');
   if(ext==='.svg'&&/<script|<foreignObject|(?:href|src)\s*=\s*["'](?:https?:|\/\/)|@import|url\(\s*["']?https?:/i.test(bytes.toString()))throw Error('SVG must be a self-contained passive illustration');
   a.path=`assets/${a.id}${ext}`;a.sha256=hash(bytes);files.set('public/'+a.path,bytes);
 }
 for(const [name,value]of Object.entries({'scene-plan.json':authored,'source.json':source,'settings.json':settings}))files.set(name,Buffer.from(JSON.stringify(value,null,2)+'\n'));
 files.set('MOTION-LICENSE.txt',fs.readFileSync(path.join(skillRoot,'assets/LICENSE')));
 files.set('EDITOR.md',fs.readFileSync(path.join(skillRoot,'references/EDITOR.md')));
 // Record intent before writing any file, allowing matching partial attachment retries.
 for(const [relative,bytes]of files){const file=path.join(root,relative),expected=hash(bytes);if(fs.existsSync(file)&&(!state.files[relative]||state.files[relative]!==hash(fs.readFileSync(file))))throw Error(`Conflicting file ${relative}; preserve user edits`);if(state.files[relative]&&state.files[relative]!==expected)throw Error('Attachment inputs changed; restore the original run before retry');state.files[relative]=expected;}
 const scripts={'motion:compile':'node motion/compile.mjs','motion:render':'node motion/render.mjs','motion:preview':'node motion/render.mjs --preview','motion:studio':'node motion/studio.mjs'};
 for(const [k,v]of Object.entries(scripts))if(pkg.scripts?.[k]&&pkg.scripts[k]!==v)throw Error(`Conflicting script ${k}`);
 writeJson(stateFile,state);
 for(const [relative,bytes]of files){const file=path.join(root,relative);if(!fs.existsSync(file)){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}}
 pkg.scripts={...pkg.scripts,...scripts};writeJson(packageFile,pkg);state.complete=true;writeJson(stateFile,state);return root;
}
export function installDependencies(root){const pkg=readJson(path.join(root,'package.json')),version=pkg.dependencies?.remotion??pkg.devDependencies?.remotion;if(!/^\d+\.\d+\.\d+$/.test(version))throw Error('Pin the scaffold Remotion version before installing');return command('npm',['install','--save-exact',`@remotion/bundler@${version}`,`@remotion/renderer@${version}`,`@remotion/cli@${version}`],root);}
