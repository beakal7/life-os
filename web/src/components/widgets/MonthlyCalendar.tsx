"use client";
import { useState } from 'react';
import type { Habit, Workout } from '@/types';
import { dateKey, eventOnDay } from '@/lib/home';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
export function MonthlyCalendar({habits,workouts=[]}:{habits:Habit[];workouts?:Workout[]}) {
  const [offset,setOffset]=useState(0);
  const [selected,setSelected]=useState(()=>dateKey());
  const now=new Date(), today=dateKey(now);
  const first=new Date(now.getFullYear(),now.getMonth()+offset,1);
  const days=new Date(first.getFullYear(),first.getMonth()+1,0).getDate();
  const skip=(first.getDay()+6)%7;
  const calendar=useGoogleCalendar(first);
  const agenda=calendar.events.filter(e=>eventOnDay(e,selected));
  const changeMonth=(delta:number)=>{
    const next=new Date(now.getFullYear(),now.getMonth()+offset+delta,1);
    setOffset(x=>x+delta);setSelected(dateKey(next));
  };
  return <section className="card calendar-widget">
    <div className="tracker-heading"><div><span className="eyebrow">MAKE ROOM FOR WHAT MATTERS</span><h2>Your calendar</h2></div><a className="btn-subtle" href="https://calendar.google.com/" target="_blank" rel="noreferrer">Open Google ↗</a></div>
    <div className="calendar-month"><button className="btn-icon" aria-label="Previous month" onClick={()=>changeMonth(-1)}>‹</button>
      <b>{first.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</b>
      <button className="btn-icon" aria-label="Next month" onClick={()=>changeMonth(1)}>›</button>
      <button className="btn-subtle" onClick={()=>{setOffset(0);setSelected(today);}}>Today</button></div>
    <div className="calendar-grid" aria-label="Calendar dates">
      {['M','T','W','T','F','S','S'].map((d,i)=><span className="calendar-weekday" key={`label-${i}`}>{d}</span>)}
      {Array.from({length:skip},(_,i)=><span key={`blank-${i}`}/>)}
      {Array.from({length:days},(_,i)=>{
        const key=dateKey(new Date(first.getFullYear(),first.getMonth(),i+1));
        const habit=habits.some(h=>h.history[key]);
        const gym=workouts.some(w=>w.date===key&&!w.name.startsWith('Recovery:'));
        const count=calendar.events.filter(e=>eventOnDay(e,key)).length;
        return <button key={key} className={`calendar-date${key===today?' today':''}${selected===key?' selected':''}`} onClick={()=>setSelected(key)}
          aria-pressed={selected===key} aria-label={`${key}${gym?', gym logged':''}${habit?', habit completed':''}, ${count} Google events`}>
          {i+1}<span className="calendar-dots">{gym&&<i className="gym-dot"/>}{habit&&<i className="habit-dot"/>}{count>0&&<i className="event-dot"/>}</span></button>;
      })}
    </div>
    <div className="calendar-legend"><span><i className="gym-dot"/> Gym</span><span><i className="habit-dot"/> Habits</span><span><i className="event-dot"/> Google</span></div>
    <div className="google-connection">
      {calendar.connected?<><span className="tracker-badge">GOOGLE CONNECTED · READ ONLY</span><div><button className="btn-subtle" onClick={calendar.refresh} disabled={calendar.loading}>Refresh</button><button className="btn-subtle" onClick={calendar.disconnect}>Disconnect</button></div></>:
        <><button className="btn-ghost" onClick={calendar.connect} disabled={!calendar.ready||calendar.loading}>{calendar.loading?'Connecting…':'Connect Google Calendar'}</button><p className="tracker-footnote">{calendar.configured?'Show events from your primary Google calendar. Sign in when prompted.':'Google Calendar needs one-time app setup. Your gym and habit tracking work now.'}</p></>}
      {calendar.error&&<p className="tracker-error" role="alert">{calendar.error}</p>}
      {calendar.updated&&<small className="tracker-footnote">Updated {calendar.updated.toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})} · Refresh after changes in Google</small>}
    </div>
    <div className="calendar-agenda" aria-live="polite"><h3>{new Date(`${selected}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}</h3>
      {calendar.loading&&<p>Loading Google events…</p>}
      {!calendar.loading&&calendar.connected&&!calendar.error&&agenda.length===0&&<p>No Google events on this day.</p>}
      {!calendar.connected&&<p>Connect Google to see your agenda here.</p>}
      {!calendar.loading&&agenda.map(e=><div key={e.id} className="agenda-event"><span>{e.allDay?'All day':new Date(e.start).toLocaleTimeString([],{hour:'numeric',minute:'2-digit'})}</span>
        {e.url?.startsWith('https://www.google.com/calendar/')||e.url?.startsWith('https://calendar.google.com/')?<a href={e.url} target="_blank" rel="noreferrer">{e.summary} ↗</a>:<b>{e.summary}</b>}</div>)}
    </div>
  </section>;
}
