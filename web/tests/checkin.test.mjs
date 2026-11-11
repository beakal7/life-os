import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCheckin} from '../src/lib/checkin.ts';
test('steps distinguish not entered from an entered zero',()=>{
 assert.equal(normalizeCheckin(null).steps,null);
 assert.equal(normalizeCheckin({steps:0}).steps,0);
});
test('persisted check-ins keep valid progress and unique calendar IDs',()=>{
 const value=normalizeCheckin({prayer:true,pushups:100,steps:6500,calendar_done:['meeting','meeting','lab']});
 assert.deepEqual(value,{prayer:true,pushups:100,steps:6500,calendar_done:['meeting','lab']});
 assert.equal(normalizeCheckin({pushups:-5}).pushups,0);
 assert.equal(normalizeCheckin({steps:Infinity}).steps,0);
});
