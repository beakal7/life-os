import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const require=createRequire(import.meta.url),ts=require('typescript');
require.extensions['.ts']=(module,file)=>module._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,file);
const {achievementProgress}=require('../src/lib/achievements.ts');
const {normalizeCheckin}=require('../src/lib/checkin.ts');
const record=(date,patch={})=>({date,...normalizeCheckin(patch)});
test('partial progress counts, zero steps alone do not, and future records are excluded',()=>{
 const p=achievementProgress([record('2026-11-09',{pushups:10}),record('2026-11-10',{steps:0}),record('2026-11-20',{pushups:5000})],[],0,'2026-11-11');
 assert.equal(p.activeDays,1);assert.equal(p.badges.find(b=>b.id==='start').earned,true);assert.equal(p.badges.find(b=>b.id==='reps').progress,10);
});
test('a missed day preserves accumulated milestones and rewards returning',()=>{
 const rows=['2026-11-01','2026-11-02','2026-11-03','2026-11-04','2026-11-05','2026-11-06','2026-11-09'].map(d=>record(d,{prayer:true,pushups:20}));
 const p=achievementProgress(rows,[],3,'2026-11-11');
 assert.equal(p.activeDays,7);for(const id of ['week','return','rhythm'])assert.equal(p.badges.find(b=>b.id===id).earned,true);
});
test('rhythm requires two actions on three separate days in a seven-day window',()=>{
 let p=achievementProgress(['2026-10-01','2026-10-10','2026-10-20'].map(d=>record(d,{prayer:true,studied:true})),[],0,'2026-11-11');assert.equal(p.badges.find(b=>b.id==='rhythm').earned,false);
 p=achievementProgress(['2026-11-02','2026-11-04','2026-11-08'].map(d=>record(d,{prayer:true,studied:true})),[],0,'2026-11-11');assert.equal(p.badges.find(b=>b.id==='rhythm').earned,true);
});
test('knowledge milestones distinguish course progress from actual dated study',()=>{
 const p=achievementProgress(['2026-11-01','2026-11-02','2026-11-03','2026-11-04','2026-11-05'].map(d=>record(d,{studied:true})),[],6,'2026-11-11');
 assert.equal(p.badges.find(b=>b.id==='learner').earned,true);assert.equal(p.badges.find(b=>b.id==='course').earned,true);assert.equal(p.strip.length,14);
});
