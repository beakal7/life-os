"use client";
import { useEffect,useState } from 'react';
import type { LifeOSData,QuickLink } from '@/types';
import { dateKey,eventOnDay,gymStats } from '@/lib/home';
import { useCheckin } from '@/hooks/useCheckin';
import { useHome } from '@/hooks/useHome';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { MotivationTrackerView } from '@/components/widgets/MotivationTracker';
// Keep the existing shell callbacks compatible while simplifying the home view.
interface TodayTabProps {
  data:LifeOSData;userId:string;onAddWorkout:(name:string,detail:string)=>void;onRemoveWorkout:(id:string)=>void;
  onAddTask:(name:string)=>void;onToggleTask:(id:string)=>void;onRemoveTask:(id:string)=>void;
  onToggleHabit:(id:string)=>void;onLogMinutes:(n:number)=>void;onSetPriority:(key:'top3'|'week3',i:0|1|2,v:string)=>void;
  onSetVision:(v:string)=>void;onAddLink:(link:QuickLink)=>void;onRemoveLink:(i:number)=>void;
  onAddJournal:(text:string)=>void;onRemoveJournal:(id:string)=>void;onNavigate:(tab:string)=>void;onToast:(msg:string)=>void;
}
export function TodayTab({data,userId,onAddWorkout,onRemoveWorkout}:TodayTabProps){
  const [today,setToday]=useState(()=>dateKey());
  useEffect(()=>{const tick=()=>setToday(dateKey());const timer=setInterval(tick,30000);window.addEventListener('focus',tick);return ()=>{clearInterval(timer);window.removeEventListener('focus',tick);};},[]);
  const date=new Date(`${today}T12:00:00`);
  const tracker=useHome(userId);
  const checkin=useCheckin(userId,today);
  const calendar=useGoogleCalendar(date);
  const [steps,setSteps]=useState(''),[pushups,setPushups]=useState('0');
  useEffect(()=>{setSteps(checkin.value.steps===null?'':String(checkin.value.steps));setPushups(String(checkin.value.pushups));},[checkin.value.steps,checkin.value.pushups,today]);
  const session=tracker.settings.plan[date.getDay()];
  const gym=data.workouts.filter(w=>!w.name.startsWith('Recovery:'));
  const stats=gymStats(gym,tracker.settings.weeklyGymTarget,date);
  const logged=data.workouts.find(w=>w.date===today && (session.training?!w.name.startsWith('Recovery:'):w.name.startsWith('Recovery:')));
  const events=calendar.events.filter(e=>eventOnDay(e,today));
  const completed=Number(checkin.value.prayer)+Number(checkin.value.pushups>=100)+Number(checkin.value.steps!==null)+Number(!!logged);
  const saveSteps=()=>{const next=steps.trim()===''?null:Math.max(0,Math.min(200000,Math.round(Number(steps)||0)));if(next!==checkin.value.steps)checkin.update({steps:next});};
  const savePushups=()=>{const next=Math.max(0,Math.min(10000,Math.round(Number(pushups)||0)));if(next!==checkin.value.pushups)checkin.update({pushups:next});};
  const toggleEvent=(id:string)=>checkin.update({calendar_done:checkin.value.calendar_done.includes(id)?checkin.value.calendar_done.filter(x=>x!==id):[...checkin.value.calendar_done,id]});
  return <div className="daily-home">
    <section className="card daily-checklist">
      <div className="daily-heading"><h2>Daily checklist</h2><span>{completed} / 4 checked in</span></div>
      <div className="daily-progress" aria-label={`${completed} of 4 daily check-ins complete`}><span style={{width:`${completed*25}%`}}/></div>
      <div className="daily-row">
        <label><input type="checkbox" checked={checkin.value.prayer} disabled={!checkin.ready} onChange={e=>checkin.update({prayer:e.target.checked})}/><span>Prayer</span></label>
      </div>
      <div className="daily-row">
        <label><input type="checkbox" checked={checkin.value.pushups>=100} disabled={!checkin.ready} onChange={e=>checkin.update({pushups:e.target.checked?100:0})}/><span>100 push-ups<small>Break them into sets throughout your day.</small></span></label>
        <div className="daily-entry"><input className="life-input" aria-label="Push-ups completed" type="number" inputMode="numeric" min={0} max={10000} value={pushups} disabled={!checkin.ready} onChange={e=>setPushups(e.target.value)} onBlur={savePushups} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/><span>/ 100</span>
          <button className="btn-ghost" disabled={!checkin.ready} onClick={()=>checkin.update({pushups:Math.min(10000,checkin.value.pushups+10)})}>+10</button></div>
      </div>
      <div className="daily-row">
        <div className="daily-label"><span className={`steps-check${checkin.value.steps!==null?' logged':''}`} aria-hidden="true">{checkin.value.steps!==null?'✓':'·'}</span><label htmlFor="daily-steps">Steps<small>Enter your total. No target to chase.</small></label></div>
        <div className="daily-entry"><input id="daily-steps" className="life-input" aria-label="Today's steps" type="number" inputMode="numeric" min={0} max={200000} placeholder="e.g. 6500" value={steps} disabled={!checkin.ready} onChange={e=>setSteps(e.target.value)} onBlur={saveSteps} onKeyDown={e=>{if(e.key==='Enter')e.currentTarget.blur();}}/></div>
      </div>
      <div className="daily-row">
        <label><input type="checkbox" checked={!!logged} disabled={!tracker.ready} onChange={e=>{if(e.target.checked)onAddWorkout(`${session.training?'Gym':'Recovery'}: ${session.name}`,session.exercises);else if(logged)onRemoveWorkout(logged.id);}}/><span>{session.training?'Gym':'Gym / recovery'}<small>{session.training?session.name:'Recovery day: keep it light. This won’t count as a gym visit.'}</small></span></label>
        <span className="daily-meta">{stats.weekDays} / {tracker.settings.weeklyGymTarget} this week · {stats.weeks}-week streak</span>
      </div>
      <div className="daily-save" role="status">{checkin.error?<><span>{checkin.error}</span>{checkin.ready&&<button className="btn-subtle" onClick={checkin.retry}>Retry save</button>}</>:!checkin.ready?'Loading your day…':checkin.saving?'Saving…':'Saved to your account · a fresh checklist each day'}</div>
    </section>
    <section className="card daily-agenda">
      <div className="daily-heading"><h2>On your calendar</h2><div className="daily-calendar-actions">{calendar.connected?<><button className="btn-subtle" disabled={calendar.loading} onClick={calendar.refresh}>Refresh</button><button className="btn-subtle" onClick={calendar.disconnect}>Disconnect</button></>:<button className="btn-ghost" disabled={!calendar.ready||calendar.loading} onClick={calendar.connect}>Connect Google</button>}</div></div>
      {calendar.error&&<p role="alert">{calendar.error}</p>}
      {!calendar.connected&&<p>{calendar.configured?'Connect your primary Google calendar to see today’s events here.':'Google Calendar needs one-time connection setup before events can appear here.'} <a href="https://calendar.google.com/" target="_blank" rel="noreferrer">Open Google Calendar ↗</a></p>}
      {calendar.loading&&<p>Loading events…</p>}
      {calendar.connected&&!calendar.loading&&!calendar.error&&events.length===0&&<p>No events on your calendar today.</p>}
      {events.map(event=><div className="daily-row calendar-check" key={event.id}><label><input type="checkbox" disabled={!checkin.ready} checked={checkin.value.calendar_done.includes(event.id)} onChange={()=>toggleEvent(event.id)}/><span>{event.summary}<small>{event.allDay?'All day':`${new Date(event.start).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} – ${new Date(event.end).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}`}</small></span></label></div>)}
      {calendar.connected&&<small className="daily-meta">Checks are private to LifeOS; Google events stay unchanged.</small>}
    </section>
    <details className="daily-tracker-details"><summary>Workout plan & church tracker <span>{tracker.settings.faith.completed.length} / 6 study days complete</span></summary>
      <MotivationTrackerView data={data} tracker={tracker} compact onAddWorkout={onAddWorkout} onRemoveWorkout={onRemoveWorkout}/>
    </details>
  </div>;
}
