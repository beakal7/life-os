"use client";
import {useEffect,useState} from 'react';
import {getSupabase} from '@/lib/supabase/client';
import type {DailyRecord} from '@/lib/achievements';
export function useCheckinHistory(userId:string,today:string){
 const [records,setRecords]=useState<DailyRecord[]>([]),[ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;setReady(false);setError('');
  const load=async()=>{const all:DailyRecord[]=[];let offset=0;
   for(;;){const {data,error}=await getSupabase().from('daily_checkins').select('date,prayer,pushups,steps,calendar_done,studied,learning_note,one_percent,one_percent_done').eq('user_id',userId).lte('date',today).order('date',{ascending:false}).range(offset,offset+999);
    if(error)throw error;all.push(...data??[]);if(!active)return;if(!data||data.length<1000)break;offset+=1000;
   }
   if(active){setRecords(all);setReady(true);}
  };
  load().catch(e=>{if(active)setError(`Progress could not load: ${(e as Error).message}`);});return ()=>{active=false;};
 },[userId,today]);return {records,ready,error};
}
