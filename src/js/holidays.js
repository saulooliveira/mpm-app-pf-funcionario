import { DATA, saveData, ensureDay } from './storage.js';
import { parse } from './utils.js';
import { isAdmin } from './session.js';
import { fmt, dedupeByDate, toast } from './utils.js';

const holidayList = document.getElementById('holidayList');

export function markHoliday(dateStr, name="Feriado", scope='BR'){
  ensureDay(dateStr);
  DATA.schedules[dateStr].holiday = true;
  DATA.schedules[dateStr].holidayName = name;
  DATA.schedules[dateStr].scope = scope;
}
export function unmarkHoliday(dateStr){
  ensureDay(dateStr);
  DATA.schedules[dateStr].holiday = false;
  delete DATA.schedules[dateStr].holidayName;
  delete DATA.schedules[dateStr].scope;
}

export function refreshHolidaysPanel(){
  const entries = Object.entries(DATA.schedules).filter(([,v])=>v.holiday).sort((a,b)=>a[0].localeCompare(b[0]));
  holidayList.innerHTML = entries.length? entries.map(([k,v])=>{
    const d = parse(k);
    const tag = v.scope==='MUN' ? 'SP-Capital' : v.scope==='UF' ? 'SP' : 'BR';
    return `<div class="row">
      <div>
        <div>${d.toLocaleDateString('pt-BR')}</div>
        <div class="muted" style="font-size:.85rem">${v.holidayName||'Feriado'} (${tag})</div>
      </div>
      ${isAdmin()?`<button class="btn" data-unmark="${k}">Remover</button>`:''}
    </div>`;
  }).join('') : `<div class="empty">Nenhum feriado cadastrado.</div>`;
  holidayList.querySelectorAll('[data-unmark]').forEach(b=>{
    b.onclick = ()=>{ unmarkHoliday(b.dataset.unmark); saveData(); refreshHolidaysPanel(); };
  });
}

// API helpers
export async function fetchBRHolidays(year){
  try{
    const r = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`, {cache:'no-store'});
    if(r.ok){ const list = await r.json(); return list.map(x=>({ date:x.date, name:x.name })); }
  }catch(e){}
  try{
    const r2 = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/BR`, {cache:'no-store'});
    if(r2.ok){ const list2 = await r2.json(); return list2.map(x=>({ date:x.date, name:x.localName || x.name || 'Feriado' })); }
  }catch(e){}
  throw new Error('Falha ao obter feriados nacionais.');
}
export async function fetchUFHolidays_Calendarific(year, uf, apiKey){
  if(!apiKey) return [];
  const url = `https://calendarific.com/api/v2/holidays?api_key=${encodeURIComponent(apiKey)}&country=BR&year=${year}&region=${encodeURIComponent(uf)}`;
  const r = await fetch(url, {cache:'no-store'});
  if(!r.ok) throw new Error('Calendarific não respondeu.');
  const data = await r.json();
  const items = (data?.response?.holidays)||[];
  const out = [];
  items.forEach(h=>{
    try{
      const date = h.date?.iso?.slice(0,10);
      const name = h.name || h.local_name || 'Feriado';
      const types = h.type || [];
      if(date && (types.includes('National holiday') || types.includes('Local holiday') || types.includes('State holiday') || types.includes('Public holiday'))){
        out.push({date, name});
      }
    }catch{}
  });
  return dedupeByDate(out);
}
export async function fetchCityHolidays_Invertexto(year, uf, ibgeCity, token){
  if(!token) return [];
  const url = `https://api.invertexto.com/v1/holidays/${year}?token=${encodeURIComponent(token)}&state=${encodeURIComponent(uf)}&city=${encodeURIComponent(ibgeCity)}`;
  const r = await fetch(url, {cache:'no-store'});
  if(!r.ok) throw new Error('Invertexto não respondeu.');
  const list = await r.json();
  const out = (Array.isArray(list)?list:[]).map(x=>({ date:x.date, name:x.name || 'Feriado municipal'}));
  return dedupeByDate(out);
}

export async function syncBR(year, {force=false}={}){
  if(!force && DATA.holidaySyncedYears.includes(year)) return 0;
  const list = await fetchBRHolidays(year);
  list.forEach(h=>markHoliday(h.date, h.name, 'BR'));
  if(!DATA.holidaySyncedYears.includes(year)) DATA.holidaySyncedYears.push(year);
  saveData();
  return list.length;
}
export async function syncUF(year, uf, key, {force=false}={}){
  if(!force && DATA.prefs.syncedUF[year]) return 0;
  const list = await fetchUFHolidays_Calendarific(year, uf, key).catch(()=>[]);
  list.forEach(h=>markHoliday(h.date, h.name, 'UF'));
  DATA.prefs.syncedUF[year] = true; saveData(); return list.length;
}
export async function syncCity(year, uf, ibgeCity, token, {force=false}={}){
  if(!force && DATA.prefs.syncedCity[year]) return 0;
  const list = await fetchCityHolidays_Invertexto(year, uf, ibgeCity, token).catch(()=>[]);
  list.forEach(h=>markHoliday(h.date, h.name, 'MUN'));
  DATA.prefs.syncedCity[year] = true; saveData(); return list.length;
}
export async function syncAll(year, {force=false}={}){
  const {uf, ibgeCity, calendarificKey, invertextoToken} = DATA.prefs;
  let total=0;
  try{ total += await syncBR(year,{force}); }catch{ toast('Falha nos feriados nacionais'); }
  try{ total += await syncUF(year, uf, calendarificKey,{force}); }catch{}
  try{ total += await syncCity(year, uf, ibgeCity, invertextoToken,{force}); }catch{}
  toast(`Sincronizado ${year}: ${total} feriados (BR/UF/MUN)`);
  return total;
}
