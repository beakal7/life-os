"use client";
import {useEffect,useState} from 'react';
import type {useHome} from '@/hooks/useHome';
import type {useCheckin} from '@/hooks/useCheckin';
export function KnowledgeCard({tracker,checkin}:{tracker:ReturnType<typeof useHome>;checkin:ReturnType<typeof useCheckin>}){
 const {settings,ready,saving,save,error}=tracker;
 const [note,setNote]=useState(checkin.value.learning_note);
 useEffect(()=>setNote(checkin.value.learning_note),[checkin.value.learning_note]);
 const done=settings.faith.completed.length;
 const next=Array.from({length:6},(_,i)=>i+1).find(n=>!settings.faith.completed.includes(n));
 const toggle=async(day:number)=>{const completed=settings.faith.completed.includes(day)?settings.faith.completed.filter(n=>n!==day):[...settings.faith.completed,day];
  const marked=!settings.faith.completed.includes(day);
  if(await save({...settings,faith:{...settings.faith,completed}})){if(marked)checkin.update({studied:true});}
 };
 return <section className="card knowledge-card">
  <div className="daily-heading"><h2>Knowledge tracker</h2><span>{done} / 6 complete</span></div>
  <h3 lang="ti">{settings.faith.title}</h3><p className="knowledge-next">{next?`Day ${next} in progress`:'Course complete. Make time to review.'} · Ends {new Date(`${settings.faith.endDate}T12:00:00`).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</p>
  <div className="daily-progress"><span style={{width:`${done/6*100}%`}}/></div>
  <div className="knowledge-days">{Array.from({length:6},(_,i)=>i+1).map(n=><button key={n} aria-label={`Study day ${n}`} aria-pressed={settings.faith.completed.includes(n)} disabled={!ready||saving||!checkin.ready} className={settings.faith.completed.includes(n)?'done':n===next?'current':''} onClick={()=>void toggle(n)}><span>{settings.faith.completed.includes(n)?'✓':n}</span><small>Day {n}</small></button>)}</div>
  <label className="study-today"><input type="checkbox" checked={checkin.value.studied} disabled={!checkin.ready} onChange={e=>checkin.update({studied:e.target.checked})}/> I studied or reviewed today</label>
  <label className="knowledge-note">One thing I learned<textarea className="life-input" rows={2} maxLength={4000} value={note} onChange={e=>setNote(e.target.value)} disabled={!checkin.ready} placeholder="Recall one idea in your own words…"/></label>
  <div className="knowledge-note-actions"><button className="btn-subtle" disabled={!checkin.ready||note===checkin.value.learning_note} onClick={()=>checkin.update({learning_note:note})}>Save learning note</button><small>Read → recall → repeat.</small></div>
  {error&&<p role="alert">{error}</p>}
 </section>;
}
export function SmallWin({checkin}:{checkin:ReturnType<typeof useCheckin>}){
 const [text,setText]=useState(checkin.value.one_percent);
 useEffect(()=>setText(checkin.value.one_percent),[checkin.value.one_percent]);
 const save=()=>{const next=text.trim();if(next!==checkin.value.one_percent)checkin.update({one_percent:next,one_percent_done:false});};
 return <section className="card small-win">
  <div><h2>My 1% today</h2><p>One small action that makes tomorrow easier.</p></div>
  <div className="small-win-entry"><input type="checkbox" aria-label="Small win completed" checked={checkin.value.one_percent_done&&!!checkin.value.one_percent.trim()} disabled={!checkin.ready||!text.trim()} onChange={e=>checkin.update({one_percent:text.trim(),one_percent_done:e.target.checked})}/>
   <input className="life-input" aria-label="My one percent action" maxLength={500} placeholder="After lunch, I’ll review one lesson for 5 minutes." value={text} disabled={!checkin.ready} onChange={e=>setText(e.target.value)} onBlur={save} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/>
  </div>
  {checkin.value.one_percent_done&&<small role="status">One small promise kept. That counts.</small>}
 </section>;
}
