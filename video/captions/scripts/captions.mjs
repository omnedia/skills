import {readJson, writeJson, loadConfig, saveConfig, requirePlugin, runtimeReady, prepareProject, attachProject, installCaptionDependencies} from './core.mjs';
const [mode, file, extra] = process.argv.slice(2);
try {
  if (mode === 'configure') console.log(JSON.stringify(saveConfig(readJson(file)), null, 2));
  else if (mode === 'defaults') console.log(JSON.stringify(loadConfig(), null, 2));
  else if (mode === 'doctor') {
    requirePlugin(readJson(file).plugin);
    console.log(JSON.stringify(runtimeReady(), null, 2));
  } else if (mode === 'prepare') {
    const run = readJson(file);
    Object.assign(run, prepareProject(run));
    writeJson(file, run);
    console.log(`Use the Remotion plugin to scaffold and install a new project at: ${run.projectPath}`);
  } else if (mode === 'attach') {
    const run = readJson(file);
    const project = attachProject(run);
    console.log(`Caption assets added: ${project}`);
    if (extra !== '--no-install') console.log(installCaptionDependencies(project));
  } else if (mode === 'dependencies') {
    const run = readJson(file);
    requirePlugin(run.plugin);
    console.log(installCaptionDependencies(run.projectPath));
  } else throw new Error('Usage: node captions.mjs defaults | configure changes.json | doctor run.json | prepare run.json | attach run.json [--no-install] | dependencies run.json');
} catch (error) {console.error(error.message); process.exitCode = 1;}
