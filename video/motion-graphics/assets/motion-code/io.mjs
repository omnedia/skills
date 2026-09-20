import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
export const readJson = file => JSON.parse(fs.readFileSync(file,'utf8').replace(/^\uFEFF/,''));
export const hash = value => createHash('sha256').update(typeof value === 'string' || Buffer.isBuffer(value) ? value : JSON.stringify(value)).digest('hex');
export function writeJson(file,value) {
  fs.mkdirSync(path.dirname(file),{recursive:true});
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp,JSON.stringify(value,null,2)+'\n'); fs.renameSync(temp,file);
}
export function localPath(root,relative) {
  if(typeof relative!=='string'||!relative||path.isAbsolute(relative)||relative.split(/[\\/]/).includes('..')) throw Error('Asset must use a safe relative project path');
  const file=path.resolve(root,relative);
  if(!file.startsWith(path.resolve(root)+path.sep))throw Error('Path escapes project');
  if(fs.existsSync(file)&&!fs.realpathSync(file).startsWith(fs.realpathSync(root)+path.sep))throw Error('Symlink escapes project');
  return file;
}
export function treeHashes(root,relative) {
  const result={};
  function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const file=path.join(dir,entry.name);if(entry.isDirectory())visit(file);else if(entry.isFile())result[path.relative(root,file).replaceAll('\\','/')]=hash(fs.readFileSync(file));else throw Error('Symlinks are not supported in owned source');}}
  visit(path.join(root,relative));return result;
}
