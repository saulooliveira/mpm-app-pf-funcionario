import { state } from './state.js';
import { renderCalendar, calendarBody } from './calendar.js';
import { markHoliday, unmarkHoliday, refreshHolidaysPanel, syncAll, syncBR } from './holidays.js';
import { openModal, modal } from './modal.js';
import { ensureDay, DATA, saveData } from './storage.js';
import { isAdmin, SESSION } from './session.js';
import { refreshRequests, refreshAdminRequests } from './swap.js';
import { initTeamView, renderTeamView } from './teamView.js';
import { initSettings } from './settings.js';
import { initAuth, showLogin, afterLogin, updateRoleUI, refreshEmployeeSelect } from './auth.js';
import { openUserManager } from './userManagement.js';
import { fmt } from './utils.js';

// navigation buttons
document.getElementById('prevBtn').onclick = ()=>{
  if(state.currentView==='month'){ state.currentDate.setMonth(state.currentDate.getMonth()-1); }
  else if(state.currentView==='week'){ state.currentDate = new Date(state.currentDate.getTime()-7*86400000); }
  else { state.currentDate = new Date(state.currentDate.getTime()-86400000); }
  renderAll();
};
document.getElementById('nextBtn').onclick = ()=>{
  if(state.currentView==='month'){ state.currentDate.setMonth(state.currentDate.getMonth()+1); }
  else if(state.currentView==='week'){ state.currentDate = new Date(state.currentDate.getTime()+7*86400000); }
  else { state.currentDate = new Date(state.currentDate.getTime()+86400000); }
  renderAll();
};
document.getElementById('todayBtn').onclick = ()=>{ state.currentDate=new Date(); state.selectedDate=new Date(); renderAll(); };
document.querySelectorAll('.btn-tab[data-view]').forEach(b=>{
  b.onclick = ()=>{ document.querySelectorAll('.btn-tab[data-view]').forEach(x=>x.classList.remove('active')); b.classList.add('active'); state.currentView=b.dataset.view; renderAll(); };
});

// holiday toggle
const toggleHolidayBtn = document.getElementById('toggleHolidayBtn');
toggleHolidayBtn.onclick = ()=>{
  if(!isAdmin()) return;
  const k = fmt(state.selectedDate);
  ensureDay(k);
  DATA.schedules[k].holiday ? unmarkHoliday(k) : markHoliday(k);
  saveData(); renderAll();
};
// add holiday
const addHolidayBtn = document.getElementById('addHolidayBtn');
addHolidayBtn.onclick = ()=>{
  if(!isAdmin()) return;
  const input=document.getElementById('holidayDate');
  if(!input.value) return alert('Selecione uma data.');
  markHoliday(input.value, 'Feriado manual', 'BR');
  saveData(); renderAll();
};

// edit scale
const editScaleBtn = document.getElementById('editScaleBtn');
editScaleBtn.onclick = ()=>{
  if(!isAdmin()) return;
  const k = fmt(state.selectedDate);
  ensureDay(k);
  const info = DATA.schedules[k];
  const list = DATA.employees.map(e=>{
    const st = info.assignments[e] || 'trabalho';
    return `<div class="row">
      <div>${e}</div>
      <div class="split">
        <label class="split" style="gap:.35rem"><input type="radio" name="st_${e}" value="trabalho" ${st==='trabalho'?'checked':''}/> Trabalho</label>
        <label class="split" style="gap:.35rem"><input type="radio" name="st_${e}" value="folga" ${st==='folga'?'checked':''}/> Folga</label>
      </div>
    </div>`;
  }).join('');
  openModal(`Editar escala — ${state.selectedDate.toLocaleDateString('pt-BR')}`, `
    <div class="split" style="margin-bottom:.6rem">
      <div><span class="label">Este dia é</span> <span class="pill ${info.holiday?'warn':''}">${info.holiday?(info.holidayName||'Feriado'):'Dia normal'}</span></div>
      <button class="btn" id="toggleHolidayInside">⛱️ Alternar feriado</button>
    </div>
    <div class="list">${list}</div>
    <div class="split" style="justify-content:end;margin-top:1rem">
      <button class="btn primary" id="saveScale">Salvar</button>
    </div>
  `);
  document.getElementById('toggleHolidayInside').onclick = ()=>{
    if(info.holiday){ info.holiday=false; delete info.holidayName; delete info.scope; }
    else { info.holiday=true; if(!info.holidayName) info.holidayName='Feriado'; if(!info.scope) info.scope='BR'; }
    saveData(); const pill=document.querySelector('#modal .pill'); pill.textContent=info.holiday?(info.holidayName||'Feriado'):'Dia normal'; pill.classList.toggle('warn', info.holiday);
  };
  document.getElementById('saveScale').onclick = ()=>{
    DATA.employees.forEach(e=>{
      const val = document.querySelector(`input[name="st_${CSS.escape(e)}"]:checked`)?.value || 'trabalho';
      info.assignments[e] = val;
    });
    saveData(); modal.style.display='none'; renderAll();
  };
};

// manage users
const manageUsersBtn = document.getElementById('manageUsersBtn');
manageUsersBtn.onclick = ()=>{ if(!isAdmin()) return; openUserManager(refreshAllUI); };

// sync buttons
document.getElementById('syncAllBtn').onclick = ()=>{ if(!isAdmin()) return; syncAll(state.currentDate.getFullYear()); };
document.getElementById('resyncYearBtn').onclick = ()=>{ if(!isAdmin()) return; syncAll(state.currentDate.getFullYear(), {force:true}); };

function renderAll(){
  renderCalendar();
  refreshHolidaysPanel();
  refreshRequests();
  refreshAdminRequests();
  renderTeamView();
}

function refreshAllUI(){
  refreshEmployeeSelect();
  updateRoleUI();
  renderAll();
}

// initialization
initAuth();
initSettings();
initTeamView();
refreshHolidaysPanel();
refreshRequests();
refreshAdminRequests();
renderTeamView();

if(!SESSION){ showLogin(); } else { afterLogin(); }

syncBR(new Date().getFullYear()).catch(()=>{});

// accessibility
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){ modal.style.display='none'; document.getElementById('settingsSheet').style.display='none'; }
  if(e.key==='ArrowLeft'){ document.getElementById('prevBtn').click(); }
  if(e.key==='ArrowRight'){ document.getElementById('nextBtn').click(); }
});
