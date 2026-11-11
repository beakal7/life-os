"use client";
import { useEffect, useRef, useState } from 'react';
import { getSupabase } from '@/lib/supabase/client';
import { defaultHome, readHome, type HomeSettings } from '@/lib/home';
export function useHome(userId: string) {
  const [settings,setSettings] = useState<HomeSettings>(()=>defaultHome());
  const [ready,setReady] = useState(false);
  const [error,setError] = useState('');
  const [saving,setSaving] = useState(false);
  const busy = useRef(false);
  useEffect(()=>{
    let active=true;
    getSupabase().from('profiles').select('home_settings').eq('user_id',userId).maybeSingle().then(async ({data,error})=>{
      if(!active) return;
      if(error) setError(`Tracker unavailable: ${error.message}`);
      else {
        const initial=readHome(data?.home_settings);
        if(!data?.home_settings){
          const result=await getSupabase().from('profiles').upsert({user_id:userId,home_settings:initial});
          if(!active)return;
          if(result.error){setError(`Tracker setup failed: ${result.error.message}`);return;}
        }
        if(active){setSettings(initial);setReady(true);}
      }
    });
    return ()=>{active=false;};
  },[userId]);
  const save = async (next: HomeSettings) => {
    if(!ready || busy.current) return false;
    busy.current=true; setSaving(true);setError('');
    try {
      const {error} = await getSupabase().from('profiles').upsert({user_id:userId,home_settings:next,updated_at:new Date().toISOString()});
      if(error) throw error;
      setSettings(next);
      return true;
    } catch(e) { setError(`Not saved. ${(e as Error).message} Try again.`); return false; }
    finally {busy.current=false;setSaving(false);}
  };
  return {settings,ready,saving,error,save};
}
