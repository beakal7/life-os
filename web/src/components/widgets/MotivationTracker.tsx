"use client";
import { useState } from 'react';
import type { LifeOSData, Workout } from '@/types';
import { dateKey, gymStats, type HomeSettings } from '@/lib/home';
import { useHome } from '@/hooks/useHome';

export function MotivationTracker({data,userId,onAddWorkout,onRemoveWorkout}: {
  data:LifeOSData;userId:string;onAddWorkout:(name:string,detail:string)=>void;onRemoveWorkout:(id:string)=>void;
}) {
  const {settings,ready,saving,error,save}=useHome(userId);
  const [edit,setEdit]=useState(false);
  const [draft,setDraft]=useState<HomeSettings|null>(null);
  const now=new Date(), today=dateKey(now), day=now.getDay();
  const session=settings.plan[day];
  const gym=data.workouts.filter(w=>!w.name.startsWith('Recovery:'));
  const stats=gymStats(gym,settings.weeklyGymTarget,now);
  const logged=data.workouts.find(w=>w.date===today && (session.training ? !w.name.startsWith('Recovery:') : w.name.startsWith('Recovery:')));
  const completed=settings.faith.completed.length;
  const current=Array.from({length:6},(_,i)=>i+1).find(n=>!settings.faith.completed.includes(n));
  const monday=new Date(now);monday.setDate(now.getDate()-(now.getDay()+6)%7);
  const log=()=>{if(logged)return;onAddWorkout(`${session.training?'Gym':'Recovery'}: ${session.name}`,session.exercises);};
  const [confirmUndo,setConfirmUndo]=useState<Workout|null>(null);
  return <div className="motivation-grid">
    <section className="momentum-banner">
      <div><span className="eyebrow">SMALL WINS. STRONGER EVERY WEEK.</span>
        <h2>Build muscle. Move with power.<br/>Keep showing up.</h2>
        <p>Your next win: {!logged ? session.name.toLowerCase() : completed<6 ? `day ${current} of your church study` : 'protect your recovery and plan tomorrow'}.</p>
      </div>
      <div className="momentum-numbers">
        <div><strong>{stats.weekDays}<small> / {settings.weeklyGymTarget}</small></strong><span>gym days this week</span></div>
        <div><strong>{stats.weeks}<small> wk</small></strong><span>gym goal streak</span></div>
        <div><strong>{completed}<small> / 6</small></strong><span>study days complete</span></div>
      </div>
    </section>
    {error && <p className="tracker-error" role="alert">{error}</p>}
    <section className="card training-card">
      <div className="tracker-heading"><div><span className="eyebrow">BODY · CONSISTENCY OVER PERFECTION</span><h2>Today’s workout</h2></div>
        <span className="tracker-badge">{session.training?'STRENGTH + MUSCLE':'RECOVERY DAY'}</span></div>
      <h3>{session.name}</h3>
      <p>{session.training?'Quality reps, controlled form. Rest 1–2 min between lifts; fully recover between power sets.':'Rest is part of the plan. Keep today light and come back ready.'}</p>
      <ol className="exercise-list">{session.exercises.split('\n').filter(Boolean).map((line,i)=><li key={i}><span>{String(i+1).padStart(2,'0')}</span>{line}</li>)}</ol>
      <div className="training-week" aria-label="Your training week">{Array.from({length:7},(_,i)=>{
        const d=new Date(monday);d.setDate(monday.getDate()+i);const key=dateKey(d);const planned=settings.plan[d.getDay()].training;const done=stats.dates.has(key);
        return <div key={key} className={`training-day${key===today?' current':''}${done?' complete':''}`} title={`${key}: ${done?'Gym logged':planned?'Training planned':'Recovery planned'}`}>
          <span>{d.toLocaleDateString('en-US',{weekday:'short'}).slice(0,1)}</span><b>{done?'✓':planned?'·':'—'}</b></div>;
      })}</div>
      <div className="tracker-actions">
        <button className="btn-action" onClick={log} disabled={!ready || !!logged}>{logged?'✓ Session logged':session.training?'Complete today’s workout':'Complete recovery session'}</button>
        {logged && <button className="btn-subtle" onClick={()=>setConfirmUndo(logged)}>Undo</button>}
        <button className="btn-ghost" disabled={!ready} onClick={()=>{setDraft(structuredClone(settings));setEdit(true);}}>Edit weekly plan</button>
      </div>
      {confirmUndo && <div className="tracker-confirm" role="alert"><p>Remove “{confirmUndo.name}” from your workout log?</p><button className="btn-subtle" onClick={()=>{onRemoveWorkout(confirmUndo.id);setConfirmUndo(null);}}>Remove session</button><button className="btn-subtle" onClick={()=>setConfirmUndo(null)}>Keep it</button></div>}
      <p className="tracker-footnote">{stats.weeks ? 'Keep your weekly goal streak going.' : 'Your first week starts with one session.'} Recovery days do not count toward your gym target.</p>
    </section>
    <section className="card faith-tracker">
      <span className="eyebrow">FAITH · A LITTLE DEEPER EACH DAY</span><h2>Church knowledge</h2>
      <h3 lang="ti">{settings.faith.title}</h3>
      <div className="faith-progress"><strong>{completed===6?'Course complete':`Day ${current} of 6`}</strong><span>{completed===6?'Well done. Keep what you learned.':'In progress'}</span></div>
      <div className="tracker-meter" role="progressbar" aria-label="Church study completed" aria-valuenow={completed} aria-valuemin={0} aria-valuemax={6}><span style={{width:`${completed/6*100}%`}}/></div>
      <div className="faith-days">{Array.from({length:6},(_,i)=>i+1).map(n=>{
        const done=settings.faith.completed.includes(n);
        return <button key={n} className={done?'done':n===current?'active':''} aria-pressed={done} disabled={!ready||saving}
          onClick={()=>void save({...settings,faith:{...settings.faith,completed:done?settings.faith.completed.filter(x=>x!==n):[...settings.faith.completed,n]}})}>
          <span>{done?'✓':String(n).padStart(2,'0')}</span><small>Day {n}</small></button>;
      })}</div>
      <p>{completed} of 6 days completed · Ends {new Date(`${settings.faith.endDate}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</p>
      <p className="tracker-footnote">Tap a day to mark it complete or undo it. Progress stays where you leave it.</p>
      <StudyNotes key={settings.faith.notes} value={settings.faith.notes} disabled={!ready||saving} save={notes=>save({...settings,faith:{...settings.faith,notes}})}/>
      <button className="btn-subtle" disabled={!ready} onClick={()=>{setDraft(structuredClone(settings));setEdit(true);}}>Edit study details</button>
      <span className="tracker-footnote" role="status">{saving?'Saving…':ready?'Synced to your account':'Loading your tracker…'}</span>
    </section>
    {edit && draft && <section className="card tracker-editor">
      <div className="tracker-heading"><h2>Your plan, your pace</h2><button className="btn-ghost" onClick={()=>setEdit(false)}>Close</button></div>
      <label>Weekly gym goal<input className="life-input" type="number" min={1} max={7} value={draft.weeklyGymTarget} onChange={e=>setDraft({...draft,weeklyGymTarget:Math.max(1,Math.min(7,Number(e.target.value)||1))})}/></label>
      <div className="plan-editor-grid">{draft.plan.map((p,i)=><fieldset key={i}><legend>{['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i]}</legend>
        <label>Session name<input className="life-input" maxLength={100} value={p.name} onChange={e=>setDraft({...draft,plan:draft.plan.map((d,j)=>j===i?{...d,name:e.target.value}:d)})}/></label>
        <label><input type="checkbox" checked={p.training} onChange={e=>setDraft({...draft,plan:draft.plan.map((d,j)=>j===i?{...d,training:e.target.checked}:d)})}/> Gym training day</label>
        <label>Exercises · one per line<textarea className="life-input" rows={5} maxLength={3000} value={p.exercises} onChange={e=>setDraft({...draft,plan:draft.plan.map((d,j)=>j===i?{...d,exercises:e.target.value}:d)})}/></label>
      </fieldset>)}</div>
      <div className="study-editor"><label>Church study title<input className="life-input" maxLength={200} value={draft.faith.title} onChange={e=>setDraft({...draft,faith:{...draft.faith,title:e.target.value}})}/></label>
      <label>Finish date<input className="life-input" type="date" value={draft.faith.endDate} onChange={e=>setDraft({...draft,faith:{...draft.faith,endDate:e.target.value}})}/></label></div>
      <button className="btn-action" disabled={saving||!draft.faith.endDate} onClick={async()=>{if(await save(draft))setEdit(false);}}>Save plan and study details</button>
    </section>}
  </div>;
}
function StudyNotes({value,disabled,save}:{value:string;disabled:boolean;save:(value:string)=>Promise<boolean>}){
  const [text,setText]=useState(value);
  return <div className="study-notes"><label>What I learned<textarea className="life-input" rows={3} maxLength={4000} placeholder="A key idea, a question, or what to review tomorrow…" value={text} disabled={disabled} onChange={e=>setText(e.target.value)}/></label>
    <button className="btn-subtle" disabled={disabled||text===value} onClick={()=>void save(text)}>Save reflection</button></div>;
}
