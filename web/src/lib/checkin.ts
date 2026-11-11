export type Checkin = { prayer: boolean; pushups: number; steps: number | null; calendar_done: string[] };
export const EMPTY_CHECKIN: Checkin = {prayer:false,pushups:0,steps:null,calendar_done:[]};
export function normalizeCheckin(value: Partial<Checkin> | null | undefined): Checkin {
  const count=(n:unknown,max:number)=>typeof n==='number' && Number.isFinite(n)?Math.max(0,Math.min(max,Math.round(n))):0;
  return {prayer:value?.prayer===true,pushups:count(value?.pushups,10000),steps:typeof value?.steps==='number'?count(value.steps,200000):null,
    calendar_done:Array.isArray(value?.calendar_done)?[...new Set(value.calendar_done.filter((id):id is string=>typeof id==='string'))].slice(0,500):[]};
}
