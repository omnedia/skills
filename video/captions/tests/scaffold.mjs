// Integration tests exercise the current Remotion plugin's official scaffold command.
// Normal skill use follows the available plugin instructions directly before attach.
import path from 'node:path';
import {prepareProject, attachProject, installCaptionDependencies, command} from '../scripts/core.mjs';

export function scaffoldForTest(run, options) {
  const prepared = prepareProject(run, options);
  const project = prepared.projectPath;
  const name = path.basename(project);
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Integration fixture project names must be simple slugs.');
  console.log(command('npm', ['exec', '--yes', '--package=create-video@latest', '--', 'create-video', '--yes', '--blank', '--no-tailwind', name], {cwd: path.dirname(project)}));
  console.log(command('npm', ['install', '--no-audit', '--no-fund'], {cwd: project}));
  attachProject({...run, ...prepared});
  console.log(installCaptionDependencies(project));
  console.log(command('npm', ['exec', '--', 'tsc', '--noEmit'], {cwd: project}));
  return project;
}
