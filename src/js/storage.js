import { fmt } from './utils.js';

export const defaultData = {
  employees: ["Ana","Bruno","Carla","Diego"],
  schedules: {},
  swapRequests: [],
  holidaySyncedYears: [],
  prefs: { uf:'SP', ibgeCity:'3550308', calendarificKey:'', invertextoToken:'', syncedUF:{}, syncedCity:{} },
};

export function loadData(){
  const raw = localStorage.getItem('escala_data_roles_users_openreq_v1');
  if(!raw){
    localStorage.setItem('escala_data_roles_users_openreq_v1', JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
  try{
    const d = JSON.parse(raw);
    d.prefs ||= structuredClone(defaultData.prefs);
    d.prefs.syncedUF ||= {};
    d.prefs.syncedCity ||= {};
    d.employees ||= ["Ana","Bruno","Carla","Diego"];
    d.swapRequests ||= [];
    return d;
  }catch{
    localStorage.setItem('escala_data_roles_users_openreq_v1', JSON.stringify(defaultData));
    return structuredClone(defaultData);
  }
}
export function saveData(){ localStorage.setItem('escala_data_roles_users_openreq_v1', JSON.stringify(DATA)); }
export let DATA = loadData();

export function ensureDay(dateStr){
  if(!DATA.schedules[dateStr]){
    DATA.schedules[dateStr] = { holiday:false, assignments:{} };
    DATA.employees.forEach((e,i)=>{
      DATA.schedules[dateStr].assignments[e] = (i%2===0)?'trabalho':'folga';
    });
  }
}
export function getDayInfo(date){ const k=fmt(date); ensureDay(k); return DATA.schedules[k]; }
