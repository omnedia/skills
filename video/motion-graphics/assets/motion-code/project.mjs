import fs from 'node:fs';
import path from 'node:path';
import {readJson,hash,treeHashes,localPath} from './io.mjs';
import {IDENTITY} from './contract.mjs';
export function inputs(root){
  const plan=readJson(path.join(root,'scene-plan.json')),source=readJson(path.join(root,'source.json')),settings=readJson(path.join(root,'settings.json')),catalog=readJson(path.join(root,'motion/catalog.json'));
  const assets={};for(const a of plan.assets??[])assets[a.id]={...a,sha256:hash(fs.readFileSync(localPath(path.join(root,'public'),a.path)))};
  const font=readJson(path.join(root,'public/fonts/source.json'));for(const f of [font])if(hash(fs.readFileSync(localPath(path.join(root,'public'),f.asset)))!==f.sha256)throw Error('Font checksum mismatch');
  const identity={...IDENTITY,code:treeHashes(root,'motion'),fonts:treeHashes(root,'public/fonts'),dependencies:readJson(path.join(root,'package.json')),lock:hash(fs.readFileSync(path.join(root,'package-lock.json')))};
  return {plan,source,settings,catalog,assets,font,identity,fingerprint:hash({plan,source,settings,assets,identity})};
}
export function requireFresh(root){const current=inputs(root),file=path.join(root,'project.json');if(!fs.existsSync(file))throw Error('Run npm run motion:compile first');const project=readJson(file);if(project.fingerprint!==current.fingerprint)throw Error('Stale compiled plan: run npm run motion:compile after editing source, settings, assets or renderer');if(project.compiledHash!==hash(project.graphicsPlan))throw Error('Compiled geometry was edited: edit scene-plan.json and run motion:compile');const snapshot=path.join(root,'compiled-motion.json');if(!fs.existsSync(snapshot)||hash(readJson(snapshot))!==hash(project))throw Error('Studio snapshot is stale: run motion:compile');return project;}
