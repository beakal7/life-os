"use client";
import type {DailyRecord} from '@/lib/achievements';
import {achievementProgress} from '@/lib/achievements';
export function AchievementTracker({records,workouts,courseDays,today,ready,error}:{records:DailyRecord[];workouts:{date:string}[];courseDays:number;today:string;ready:boolean;error:string}){
 const progress=achievementProgress(records,workouts,courseDays,today);
 const earned=progress.badges.filter(b=>b.earned);
 const next=progress.badges.find(b=>!b.earned);
 return <section className="card achievement-card">
  <div className="daily-heading"><h2>Your momentum</h2><span>{ready?`${progress.activeDays} days of showing up`:'Loading progress…'}</span></div>
  {error?<p role="alert">{error}</p>:ready?<>
   <div className="momentum-history" aria-label="Activity over the last 14 days">{progress.strip.map(d=><span key={d.date} className={`activity-cell level-${d.count===0?0:d.count<3?1:d.count<5?2:3}`} title={`${d.date}: ${d.count} actions`} aria-label={`${d.date}: ${d.count} actions`}/>)}</div>
   <div className="momentum-caption"><span>Last 14 days · partial days count</span><span>A gap isn’t a reset.</span></div>
   <div className="next-achievement"><span className="achievement-symbol" aria-hidden="true">{next?.symbol??'✓'}</span><div><strong>{next?`Next: ${next.title}`:'Every milestone earned'}</strong><p>{next?.description??'Keep showing up. The record of your effort keeps growing.'}</p></div>{next&&<span>{next.progress} / {next.target.toLocaleString()}</span>}</div>
   {next&&<div className="daily-progress"><span style={{width:`${next.progress/next.target*100}%`}}/></div>}
   <details className="badge-details"><summary>Achievements <span>{earned.length} / {progress.badges.length} earned</span></summary><div className="badge-grid">{progress.badges.map(b=><div key={b.id} className={`achievement-badge${b.earned?' earned':''}`}><span className="achievement-symbol" aria-hidden="true">{b.earned?'✓':b.symbol}</span><div><strong>{b.title}</strong><p>{b.description}</p><small>{b.earned?'Earned':`${b.progress.toLocaleString()} / ${b.target.toLocaleString()}`}</small></div></div>)}</div></details>
  </>:<p className="daily-meta">Your progress comes from your actual logs.</p>}
 </section>;
}
