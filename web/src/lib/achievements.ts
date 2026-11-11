import {normalizeCheckin,type Checkin} from './checkin';
import {dateKey} from './home';
export type DailyRecord=Checkin&{date:string};
export type Achievement={id:string;title:string;description:string;progress:number;target:number;earned:boolean;symbol:string};
export function activityCount(record:Checkin,gym:boolean):number{
 return Number(record.prayer)+Number(record.pushups>0)+Number((record.steps??0)>0)+Number(gym)+Number(record.studied)+Number(record.one_percent_done&&!!record.one_percent.trim());
}
export function achievementProgress(records:DailyRecord[],workouts:{date:string}[],courseDays:number,today:string){
 const rows=new Map(records.filter(r=>r.date<=today).map(r=>[r.date,normalizeCheckin(r)]));
 const workoutDays=new Set(workouts.filter(w=>w.date<=today).map(w=>w.date));
 const dates=[...new Set([...rows.keys(),...workoutDays])].sort();
 const activity=dates.map(date=>({date,count:activityCount(rows.get(date)??normalizeCheckin(null),workoutDays.has(date))}));
 const active=activity.filter(d=>d.count>0),strong=activity.filter(d=>d.count>=2);
 let rhythm=0;
 let left=0;
 for(let right=0;right<strong.length;right++){const start=new Date(`${strong[right].date}T12:00:00`);start.setDate(start.getDate()-6);while(strong[left].date<dateKey(start))left++;rhythm=Math.max(rhythm,right-left+1);}
 const returned=active.some((d,i)=>i>0 && (Date.parse(`${d.date}T12:00:00Z`)-Date.parse(`${active[i-1].date}T12:00:00Z`))/86400000>1);
 const pushups=[...rows.values()].reduce((n,r)=>n+r.pushups,0),study=[...rows.values()].filter(r=>r.studied).length;
 const make=(id:string,title:string,description:string,progress:number,target:number,symbol:string):Achievement=>({id,title,description,progress:Math.min(progress,target),target,earned:progress>=target,symbol});
 const badges=[
  make('start','First step','Log your first action.',active.length,1,'↗'),
  make('rhythm','Finding rhythm','Two or more actions on 3 days within a week.',rhythm,3,'◒'),
  make('week','Seven days stronger','Show up on 7 days. They needn’t be consecutive.',active.length,7,'◈'),
  make('reps','Built rep by rep','Log 1,000 push-ups over time.',pushups,1000,'↑'),
  make('learner','Curious mind','Record 5 days of learning or review.',study,5,'✦'),
  make('course','Finish what you started','Complete all 6 days of your knowledge course.',courseDays,6,'✓'),
  make('return','Back on track','Return after a missed day. Your earlier effort still counts.',Number(returned),1,'↻'),
 ];
 const strip=Array.from({length:14},(_,i)=>{const d=new Date(`${today}T12:00:00`);d.setDate(d.getDate()-13+i);const date=dateKey(d);return {date,count:activity.find(x=>x.date===date)?.count??0};});
 return {badges,activeDays:active.length,strip,studyDays:study};
}
