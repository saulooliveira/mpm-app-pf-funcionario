import { fmt, parse, startOfWeek, addDays, monthLabel } from './utils.js';
import { DATA, ensureDay, getDayInfo } from './storage.js';
import { state } from './state.js';

export const calendarBody = document.getElementById('calendarBody');
const selectedDateLabel = document.getElementById('selectedDateLabel');
const currentLabel = document.getElementById('currentLabel');

export function cellBadges(d){
  const info = getDayInfo(d);
  const out = [];
  if(info.holiday){
    const tag = info.scope==='MUN' ? 'SP-Capital' : info.scope==='UF' ? 'SP' : 'BR';
    out.push(`<span class="badge holiday">⛱️ ${info.holidayName||'Feriado'} <span class="muted" style="font-size:.7rem">(${tag})</span></span>`);
  }
  const status = info.assignments[state.currentEmployee];
  if(status) out.push(`<span class="badge ${status==='folga'?'off':'work'}">${status[0].toUpperCase()+status.slice(1)}</span>`);
  return out.join('');
}

function renderMonth(){
  const y=state.currentDate.getFullYear(), m=state.currentDate.getMonth();
  const first=new Date(y,m,1), start=startOfWeek(first);
  const days=42;
  currentLabel.textContent = monthLabel(state.currentDate);
  let html = `<div class="cal-weekdays">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d=>`<div>${d}</div>`).join('')}</div><div class="cal-grid">`;
  for(let i=0;i<days;i++){
    const d = addDays(start,i);
    const isToday = fmt(d)===fmt(new Date());
    html += `<div class="cal-cell ${isToday?'today':''}" data-date="${fmt(d)}"><div class="date">${d.getDate()}</div><div class="badges">${cellBadges(d)}</div></div>`;
  }
  html += `</div>`;
  calendarBody.innerHTML = html;
}
function renderWeek(){
  const start = startOfWeek(state.currentDate);
  currentLabel.textContent = `Semana de ${start.toLocaleDateString('pt-BR')}`;
  let html = `<div class="cal-weekdays">${['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map((d,i)=>`<div>${d} • ${addDays(start,i).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})}</div>`).join('')}</div><div class="cal-grid">`;
  for(let i=0;i<7;i++){
    const d = addDays(start,i);
    const isToday = fmt(d)===fmt(new Date());
    html += `<div class="cal-cell ${isToday?'today':''}" data-date="${fmt(d)}"><div class="date">${d.getDate()}</div><div class="badges">${cellBadges(d)}</div></div>`;
  }
  html += `</div>`;
  calendarBody.innerHTML = html;
}
function renderDay(){
  const info = getDayInfo(state.currentDate);
  currentLabel.textContent = state.currentDate.toLocaleDateString('pt-BR', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  const isToday = fmt(state.currentDate)===fmt(new Date());
  calendarBody.innerHTML = `
    <div class="cal-weekdays"><div style="grid-column:1/-1;text-align:left;padding:.8rem 1rem">${isToday?'<span class="pill ok">Hoje</span>':''}</div></div>
    <div class="cal-grid" style="grid-template-columns:1fr;">
      <div class="cal-cell today" data-date="${fmt(state.currentDate)}">
        <div class="split" style="justify-content:space-between">
          <div class="date" style="font-size:1.2rem">${state.currentDate.toLocaleDateString('pt-BR')}</div>
          <div class="badges">${cellBadges(state.currentDate)}</div>
        </div>
        <div style="margin-top:.8rem">
          <div class="label">Escala do dia</div>
          <div class="list">
            ${DATA.employees.map(e=>{
              const st = info.assignments[e] || 'trabalho';
              const cls = st==='folga'?'off':'work';
              return `<div class="row"><div>${e}</div><div class="badge ${cls}">${st}</div></div>`
            }).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

export function renderCalendar(){
  selectedDateLabel.textContent = state.selectedDate.toLocaleDateString('pt-BR');
  if(state.currentView==='month') renderMonth();
  else if(state.currentView==='week') renderWeek();
  else renderDay();
  bindCellClicks();
}

function bindCellClicks(){
  document.querySelectorAll('.cal-cell').forEach(el=>{
    el.onclick = ()=>{
      state.selectedDate = parse(el.dataset.date);
      state.currentDate = new Date(state.selectedDate);
      renderCalendar();
    };
  });
}
