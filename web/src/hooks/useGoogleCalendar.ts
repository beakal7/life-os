"use client";
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '@/lib/home';

type TokenResponse = { access_token?: string; expires_in?: number; error?: string };
type TokenClient = { requestAccessToken: (opts: {prompt: string})=>void };
type GoogleIdentity = { accounts: { oauth2: {
  initTokenClient: (opts: { client_id: string; scope: string; callback: (r: TokenResponse)=>void; error_callback: ()=>void })=>TokenClient;
  revoke: (token:string,callback:()=>void)=>void;
} } };
declare global { interface Window { google?: GoogleIdentity } }
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/calendar.events.readonly';
export function useGoogleCalendar(month: Date) {
  const [events,setEvents] = useState<CalendarEvent[]>([]);
  const [connected,setConnected] = useState(false);
  const [ready,setReady] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [updated,setUpdated] = useState<Date|null>(null);
  const [revision,setRevision] = useState(0);
  const token = useRef<{value:string;expires:number}|null>(null);
  const client = useRef<TokenClient|null>(null);
  const requestId = useRef(0);
  useEffect(()=>{
    if(!CLIENT_ID) return;
    let active=true;
    const init = ()=>{
      if(!active || !window.google) return;
      client.current=window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID, scope: SCOPE,
        callback: r=>{
          if(!active) return;
          if(!r.access_token || r.error) {setError('Google connection was not completed. Try connecting again.');setLoading(false);return;}
          token.current={value:r.access_token,expires:Date.now()+(r.expires_in??3600)*1000};
          setConnected(true);setRevision(x=>x+1);setError('');setLoading(false);
        },
        error_callback: ()=>{if(active){setLoading(false);setError('Google sign-in closed or was blocked. Try again.');}},
      });
      setReady(true);
    };
    let script=document.querySelector<HTMLScriptElement>('#google-identity');
    if(window.google) init();
    else {
      if(!script){script=document.createElement('script');script.id='google-identity';script.src='https://accounts.google.com/gsi/client';script.async=true;document.head.appendChild(script);}
      script.addEventListener('load',init);
      script.addEventListener('error',()=>{if(active) setError('Google sign-in could not load. Check your connection and reload.');},{once:true});
    }
    return ()=>{active=false;script?.removeEventListener('load',init);token.current=null;};
  },[]);
  const year=month.getFullYear(), index=month.getMonth();
  useEffect(()=>{
    if(!connected || !token.current) return;
    const current=token.current;
    if(Date.now()>=current.expires-30000){setConnected(false);setEvents([]);setError('Google access expired. Reconnect to refresh your calendar.');return;}
    const controller=new AbortController(); const id=++requestId.current;
    setLoading(true);setError('');setEvents([]);
    const load=async()=>{
      const params=new URLSearchParams({timeMin:new Date(year,index,1).toISOString(),timeMax:new Date(year,index+1,1).toISOString(),singleEvents:'true',orderBy:'startTime',maxResults:'250',timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone});
      const result:CalendarEvent[]=[];
      let page:string|undefined;
      do {
        if(page) params.set('pageToken',page);
        const res=await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,{headers:{Authorization:`Bearer ${current.value}`},signal:controller.signal});
        if(res.status===401){token.current=null;setConnected(false);throw new Error('Google access expired. Reconnect your calendar.');}
        if(!res.ok) throw new Error(res.status===403?'Google Calendar access is unavailable. Enable Calendar API and grant calendar read access.':'Could not refresh Google Calendar. Try again.');
        const body=await res.json() as {items?:{id:string;summary?:string;status?:string;start?:{date?:string;dateTime?:string};end?:{date?:string;dateTime?:string};htmlLink?:string}[];nextPageToken?:string};
        for(const e of body.items??[]){
          const start=e.start?.dateTime??e.start?.date, end=e.end?.dateTime??e.end?.date;
          if(e.status!=='cancelled' && start && end) result.push({id:e.id,summary:e.summary??'(Untitled event)',start,end,allDay:!!e.start?.date,url:e.htmlLink});
        }
        page=body.nextPageToken;
      }while(page);
      if(id===requestId.current){setEvents(result);setUpdated(new Date());}
    };
    load().catch(e=>{if(!controller.signal.aborted && id===requestId.current)setError((e as Error).message);}).finally(()=>{if(!controller.signal.aborted && id===requestId.current)setLoading(false);});
    return ()=>controller.abort();
  },[year,index,connected,revision]);
  const connect=()=>{if(!client.current)return;setError('');setLoading(true);client.current.requestAccessToken({prompt:''});};
  const disconnect=useCallback(()=>{
    requestId.current++;
    if(token.current && window.google) window.google.accounts.oauth2.revoke(token.current.value,()=>{});
    token.current=null;setConnected(false);setEvents([]);setUpdated(null);setLoading(false);setError('');
  },[]);
  return {events,connected,ready,loading,error,updated,configured:!!CLIENT_ID,connect,disconnect,refresh:()=>setRevision(x=>x+1)};
}
