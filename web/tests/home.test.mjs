import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultHome, gymStats, eventOnDay, dateKey, readHome } from '../src/lib/home.ts';
test('a new church course starts empty and finishes Saturday',()=>{
  const value=defaultHome(new Date(2026,10,11,12));
  assert.deepEqual(value.faith.completed,[]);assert.equal(value.faith.endDate,'2026-11-14');
  assert.equal(value.faith.title,'Church knowledge');assert.equal(value.plan.filter(d=>d.training).length,4);
});
test('gym goal streak allows recovery days, deduplicates days, and excludes future logs',()=>{
  const dates=['2026-11-02','2026-11-03','2026-11-05','2026-11-07','2026-11-09','2026-11-09','2026-11-10','2026-12-01'];
  const stats=gymStats(dates.map(date=>({date})),4,new Date(2026,10,11,12));
  assert.equal(stats.weekDays,2);assert.equal(stats.weeks,1);assert.equal(stats.todayDone,false);
});
test('completed current week counts and a missed full week ends streak',()=>{
  const stats=gymStats(['2026-11-09','2026-11-10','2026-11-11','2026-11-12'].map(date=>({date})),4,new Date(2026,10,12,12));
  assert.equal(stats.weeks,1);assert.equal(stats.todayDone,true);
});
test('all-day events have an exclusive end and span multiple dates',()=>{
  const event={start:'2026-11-11',end:'2026-11-13',allDay:true};
  assert.equal(eventOnDay(event,'2026-11-11'),true);assert.equal(eventOnDay(event,'2026-11-12'),true);assert.equal(eventOnDay(event,'2026-11-13'),false);
});
test('timed events are assigned using local date boundaries and midnight is exclusive',()=>{
  const d=new Date(2026,10,11,23);const end=new Date(2026,10,12,0);
  const event={start:d.toISOString(),end:end.toISOString(),allDay:false};
  assert.equal(eventOnDay(event,dateKey(d)),true);assert.equal(eventOnDay(event,dateKey(end)),false);
});
test('malformed saved settings recover to usable defaults',()=>{
  const settings=readHome({weeklyGymTarget:99,plan:[],faith:{completed:[1,1,9,'2'],notes:null}});
  assert.equal(settings.weeklyGymTarget,4);assert.equal(settings.plan.length,7);assert.deepEqual(settings.faith.completed,[1]);assert.equal(settings.faith.notes,'');
});
