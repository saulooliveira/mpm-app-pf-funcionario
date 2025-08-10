import { fmt, parse, startOfWeek, addDays } from './utils.js';
import { DATA, ensureDay } from './storage.js';
import { state } from './state.js';

const teamDateInput = document.getElementById('teamDate');
const teamTable = document.getElementById('teamTable');
const teamMeta = document.getElementById('teamMeta');

export function initTeamView(){
  teamDateInput.value = fmt(state.teamDate);
  document.querySelectorAll('[data-team]').forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll('[data-team]').forEach(x=>x.classList.remove('active'));
      btn.classList.add('active');
      state.teamMode = btn.dataset.team;
      renderTeamView();
    };
  });
  teamDateInput.onchange = ()=>{ state.teamDate = parse(teamDateInput.value); renderTeamView(); };
}

export function renderTeamView(){
  if(!teamDateInput.value){ teamDateInput.value = fmt(new Date()); state.teamDate = new Date(); }
  const thead = teamTable.querySelector('thead');
  const tbody = teamTable.querySelector('tbody');
  tbody.innerHTML = '';
  let dates = [];
  if(state.teamMode==='day'){
    dates = [new Date(state.teamDate)];
    thead.innerHTML = `<tr>
      <th>Funcionário</th>
      <th>${state.teamDate.toLocaleDateString('pt-BR', {weekday:'short', day:'2-digit', month:'2-digit'})}</th>
    </tr>`;
    teamMeta.textContent = 'Visão de 1 dia';
  }else{
    const start = startOfWeek(state.teamDate);
    dates = Array.from({length:7}, (_,i)=>addDays(start,i));
    thead.innerHTML = `<tr>
      <th>Funcionário</th>
      ${dates.map(d=>`<th>${d.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'2-digit'})}</th>`).join('')}
    </tr>`;
    teamMeta.textContent = `Semana de ${dates[0].toLocaleDateString('pt-BR')}`;
  }

  DATA.employees.forEach(emp=>{
    const tds = dates.map(d=>{
      ensureDay(fmt(d));
      const info = DATA.schedules[fmt(d)];
      const st = info.assignments[emp] || 'trabalho';
      const hol = info.holiday ? ` <span class="tag hol">feriado</span>` : '';
      const tag = `<span class="tag ${st==='folga'?'off':'work'}">${st}</span>${hol}`;
      return `<td>${tag}</td>`;
    }).join('');
    tbody.insertAdjacentHTML('beforeend', `<tr><td><strong>${emp}</strong></td>${tds}</tr>`);
  });
}
