"use client";
import { useEffect,useRef,useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { EMPTY_CHECKIN,normalizeCheckin,type Checkin } from '@/lib/checkin';
export function useCheckin(userId:string,date:string){
  const [value,setValue]=useState<Checkin>(EMPTY_CHECKIN);
  const current=useRef(value);
  const [ready,setReady]=useState(false),[pending,setPending]=useState(0),[error,setError]=useState('');
  const queue=useRef<Promise<void>>(Promise.resolve());
  const generation=useRef(0);
  useEffect(()=>{
    const id=++generation.current;setReady(false);setError('');setPending(0);
    getSupabase().from('daily_checkins').select('prayer,pushups,steps,calendar_done,studied,learning_note,one_percent,one_percent_done').eq('user_id',userId).eq('date',date).maybeSingle().then(({data,error})=>{
      if(id!==generation.current)return;
      if(error)setError(`Could not load your checklist: ${error.message}`);
      else{current.current=normalizeCheckin(data);setValue(current.current);setReady(true);}
    });
    return ()=>{generation.current=id+1;};
  },[userId,date]);
  const update=(patch:Partial<Checkin>)=>{
    if(!ready)return;
    const id=generation.current;
    const next=normalizeCheckin({...current.current,...patch});current.current=next;setValue(next);setPending(n=>n+1);
    queue.current=queue.current.then(async()=>{
      const {error}=await getSupabase().from('daily_checkins').upsert({user_id:userId,date,...next,updated_at:new Date().toISOString()},{onConflict:'user_id,date'});
      if(error)throw error;
      if(id===generation.current)setError('');
    }).catch((e:Error)=>{if(id===generation.current)setError(`Not saved: ${e.message}`);}).finally(()=>{if(id===generation.current)setPending(n=>Math.max(0,n-1));});
  };
  return {value,ready,saving:pending>0,error,update,retry:()=>update({})};
}
