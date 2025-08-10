import { fmt } from './utils.js';

export const defaultData = {
  employees: ["Ana","Bruno","Carla","Diego"],
  schedules: {},
  swapRequests: [],
  holidaySyncedYears: [],
  prefs: { uf:'SP', ibgeCity:'3550308', calendarificKey:'', invertextoToken:'', syncedUF:{}, syncedCity:{} },
};

export async function loadData(){
  try{
    const resp = await fetch('/api/data');
    if(resp.ok){
      const d = await resp.json();
      d.prefs ||= structuredClone(defaultData.prefs);
      d.prefs.syncedUF ||= {};
      d.prefs.syncedCity ||= {};
      d.employees ||= ["Ana","Bruno","Carla","Diego"];
      d.swapRequests ||= [];
      return d;
    }
  }catch{}
  return structuredClone(defaultData);
}
export async function saveData(){
  await fetch('/api/data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(DATA)
  });
}
export let DATA = await loadData();

export function ensureDay(dateStr){
  if(!DATA.schedules[dateStr]){
    DATA.schedules[dateStr] = { holiday:false, assignments:{} };
    DATA.employees.forEach((e,i)=>{
      DATA.schedules[dateStr].assignments[e] = (i%2===0)?'trabalho':'folga';
    });
  }
}
export function getDayInfo(date){ const k=fmt(date); ensureDay(k); return DATA.schedules[k]; }
