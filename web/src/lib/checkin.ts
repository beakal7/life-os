export type Checkin = { prayer:boolean;pushups:number;steps:number|null;calendar_done:string[];studied:boolean;learning_note:string;one_percent:string;one_percent_done:boolean };
export const EMPTY_CHECKIN:Checkin={prayer:false,pushups:0,steps:null,calendar_done:[],studied:false,learning_note:'',one_percent:'',one_percent_done:false};
export function normalizeCheckin(value:Partial<Checkin>|null|undefined):Checkin{
 const count=(n:unknown,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(0,Math.min(max,Math.round(n))):0;
 return {prayer:value?.prayer===true,pushups:count(value?.pushups,10000),steps:typeof value?.steps==='number'?count(value.steps,200000):null,
 calendar_done:Array.isArray(value?.calendar_done)?[...new Set(value.calendar_done.filter((id):id is string=>typeof id==='string'))].slice(0,500):[],
 studied:value?.studied===true,learning_note:typeof value?.learning_note==='string'?value.learning_note.slice(0,4000):'',one_percent:typeof value?.one_percent==='string'?value.one_percent.slice(0,500):'',one_percent_done:value?.one_percent_done===true};
}
