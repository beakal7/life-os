"use client";
import {useEffect,useState} from 'react';
export function GoogleCalendarSetup({clientId,onSave,saving}:{clientId:string;onSave:(id:string)=>Promise<boolean>;saving:boolean}){
 const [value,setValue]=useState(clientId),[origin,setOrigin]=useState('https://life-os-3dp.pages.dev'),[message,setMessage]=useState('');
 useEffect(()=>setValue(clientId),[clientId]);useEffect(()=>setOrigin(window.location.origin),[]);
 const valid=!value.trim()||/^[a-zA-Z0-9-]+\.apps\.googleusercontent\.com$/.test(value.trim());
 return <details className="calendar-setup"><summary>{clientId?'Google connection settings':'How to connect Google Calendar'}</summary>
  <p>One-time setup for your private dashboard. This does not require a paid Google subscription.</p>
  <ol><li>In <a href="https://console.cloud.google.com/apis/library/calendar-json.googleapis.com" target="_blank" rel="noreferrer">Google Cloud</a>, select or create a project and enable <b>Google Calendar API</b>.</li>
   <li>In Google Auth Platform, configure the app branding and audience. If the audience is External and in Testing, add your Google email as a test user.</li>
   <li>Under <a href="https://console.cloud.google.com/auth/clients" target="_blank" rel="noreferrer">Clients</a>, create an OAuth client with application type <b>Web application</b>. Add this exact <b>Authorized JavaScript origin</b>: <code>{origin}</code>. No redirect URI is needed for this popup token flow.</li>
   <li>Copy its <b>Client ID</b> below and save. Then click <b>Connect Google</b> above and approve read-only calendar access.</li></ol>
  <label>Google OAuth Client ID<input className="life-input" value={value} maxLength={200} placeholder="123456789-abc.apps.googleusercontent.com" onChange={e=>{setValue(e.target.value);setMessage('');}}/></label>
  <p className="daily-meta">Use the public client ID, never a client secret or API key. Your Google access token stays in memory. Reconnect after a reload; Refresh pulls new events.</p>
  {!valid&&<p role="alert">Use the full client ID ending in .apps.googleusercontent.com.</p>}
  <button className="btn-ghost" disabled={!valid||saving||value.trim()===clientId} onClick={async()=>{if(await onSave(value.trim()))setMessage(value.trim()?'Saved. Click Connect Google above.':'Google client ID removed.');}}>Save calendar connection</button>
  {message&&<p role="status">{message}</p>}
 </details>;
}
