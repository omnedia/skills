import {readJson,writeJson,loadConfig,saveConfig,requirePlugin,runtimeReady,prepareProject,attachProject,installDependencies,resolveSettings,skillRoot} from './core.mjs';
import {validatePlan} from '../assets/motion-code/contract.mjs';
import path from 'node:path';
const [mode,file]=process.argv.slice(2);
try{
 if(mode==='defaults')console.log(JSON.stringify(loadConfig(),null,2));
 else if(mode==='configure')console.log(JSON.stringify(saveConfig(readJson(file)),null,2));
 else if(mode==='doctor'){requirePlugin(readJson(file).plugin);console.log(runtimeReady());}
 else if(mode==='validate'){const run=readJson(file);console.log(JSON.stringify(validatePlan(readJson(run.planPath),run.sourcePath?readJson(run.sourcePath):{words:[]},resolveSettings(run),readJson(path.join(skillRoot,'styles/catalog.json'))),null,2));}
 else if(mode==='prepare'){const run=prepareProject(readJson(file));writeJson(file,run);console.log(JSON.stringify({status:run.status,projectPath:run.projectPath,blocker:run.blocker}));}
 else if(mode==='attach'){const run=readJson(file);attachProject(run);run.status='attached';run.scaffoldComplete=true;run.attachmentComplete=true;writeJson(file,run);console.log(run.projectPath);}
 else if(mode==='dependencies'){const run=readJson(file);requirePlugin(run.plugin);console.log(installDependencies(run.projectPath));}
 else throw Error('Usage: node motion-graphics.mjs defaults | configure settings.json | doctor run.json | validate run.json | prepare run.json | attach run.json | dependencies run.json');
}catch(e){console.error(e.message);process.exitCode=1;}
