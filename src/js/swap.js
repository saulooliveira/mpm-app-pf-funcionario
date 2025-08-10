import { DATA, saveData, ensureDay } from './storage.js';
import { fmt, parse } from './utils.js';
import { state } from './state.js';
import { openModal, modal, modalContent } from './modal.js';
import { SESSION, isAdmin, saveSession } from './session.js';
import { renderCalendar, cellBadges } from './calendar.js';
import { toast } from './utils.js';

const requestsList = document.getElementById('requestsList');
const adminRequestsList = document.getElementById('adminRequestsList');

export function refreshRequests(){
  if(!SESSION) return;
  const mine = DATA.swapRequests.filter(r=>r.requester===SESSION.name);
  requestsList.innerHTML = mine.length? mine.slice().reverse().map(r=>{
    let status = r.status;
    if(r.open && r.status==='pendente') status = 'aberta';
    const statusCls = status==='aprovada'?'ok': status==='recusada'?'warn':'wait';
    const details = r.open
      ? `Aberta • sua data <strong>${r.fromDate}</strong>${r.toDate?` • deseja <strong>${r.toDate}</strong>`:''}`
      : `<strong>${r.fromDate}</strong> → <strong>${r.toDate}</strong> com <strong>${r.toEmployee}</strong>`;
    return `<div class="row">
      <div style="max-width:60%">
        <div>${details}</div>
        <div class="muted" style="font-size:.85rem">${r.reason||'Sem motivo informado'}</div>
      </div>
      <span class="pill ${statusCls}">${status}</span>
    </div>`;
  }).join('') : `<div class="empty">Você ainda não fez solicitações.</div>`;
}

export function refreshAdminRequests(){
  if(!isAdmin()){ adminRequestsList.innerHTML=''; return; }
  const all = DATA.swapRequests.slice().reverse();
  adminRequestsList.innerHTML = all.length? all.map(r=>{
    const baseInfo = r.open
      ? `<strong>${r.requester}</strong> abriu troca da sua data <strong>${r.fromDate}</strong>${r.toDate?` (deseja ${r.toDate})`:''}`
      : `<strong>${r.requester}</strong> troca <strong>${r.fromDate}</strong> com <strong>${r.toEmployee}</strong> em <strong>${r.toDate}</strong>`;
    const status = r.open && r.status==='pendente' ? 'aberta' : r.status;
    const statusCls = status==='aprovada'?'ok': status==='recusada'?'warn':'wait';
    const actions = r.status==='pendente'
      ? (r.open
          ? `<button class="btn" data-link="${r.id}">Definir par</button>
             <button class="btn" data-reject="${r.id}">Recusar</button>`
          : `<button class="btn" data-approve="${r.id}">Aprovar</button>
             <button class="btn" data-reject="${r.id}">Recusar</button>`)
      : `<span class="pill ${statusCls}">${status}</span>`;
    return `<div class="row">
      <div style="max-width:60%">
        <div>${baseInfo}</div>
        <div class="muted" style="font-size:.85rem">${r.reason||'—'}</div>
      </div>
      <div class="split">${actions}</div>
    </div>`;
  }).join('') : `<div class="empty">Sem solicitações.</div>`;

  adminRequestsList.querySelectorAll('[data-approve]').forEach(b=>{
    b.onclick = ()=>{
      const id = b.dataset.approve;
      const r = DATA.swapRequests.find(x=>x.id===id);
      if(!r || r.open) return;
      if(!validateSwap(r)) return;
      applySwap(r);
      r.status = 'aprovada';
      saveData(); renderCalendar();
      alert('Troca aprovada e aplicada.');
    };
  });
  adminRequestsList.querySelectorAll('[data-reject]').forEach(b=>{
    b.onclick = ()=>{
      const id = b.dataset.reject;
      const r = DATA.swapRequests.find(x=>x.id===id);
      if(!r) return;
      r.status = 'recusada';
      saveData(); renderCalendar();
    };
  });
  adminRequestsList.querySelectorAll('[data-link]').forEach(b=>{
    b.onclick = ()=>{
      const id = b.dataset.link;
      const r = DATA.swapRequests.find(x=>x.id===id);
      if(!r) return;
      openLinkModal(r);
    };
  });
}

export function validateSwap(r){
  if(!r.requester || !r.toEmployee || !r.fromDate || !r.toDate) { alert('Dados incompletos da troca.'); return false; }
  if(r.requester===r.toEmployee){ alert('Funcionários devem ser diferentes.'); return false; }
  if(r.fromDate===r.toDate){ alert('Datas da troca não podem ser iguais.'); return false; }
  return true;
}
export function applySwap(r){
  const {requester, toEmployee, fromDate, toDate} = r;
  ensureDay(fromDate); ensureDay(toDate);
  const a1 = DATA.schedules[fromDate].assignments;
  [a1[requester], a1[toEmployee]] = [a1[toEmployee], a1[requester]];
  const a2 = DATA.schedules[toDate].assignments;
  [a2[requester], a2[toEmployee]] = [a2[toEmployee], a2[requester]];
}

export function openLinkModal(r){
  const empOptions = DATA.employees.filter(e=>e!==r.requester).map(e=>`<option>${e}</option>`).join('');
  openModal('Definir par para troca aberta', `
    <div class="grid2">
      <div>
        <div class="label">Solicitante</div>
        <input type="text" value="${r.requester}" disabled/>
      </div>
      <div>
        <div class="label">Data do solicitante</div>
        <input type="date" id="link_from" value="${r.fromDate}" />
      </div>
      <div>
        <div class="label">Funcionário parceiro</div>
        <select id="link_emp">${empOptions}</select>
      </div>
      <div>
        <div class="label">Data do parceiro</div>
        <input type="date" id="link_to" value="${r.toDate||r.fromDate}" />
      </div>
    </div>
    <div class="split" style="justify-content:flex-end;margin-top:.8rem">
      <button class="btn primary" id="linkSave">Vincular</button>
    </div>
  `);
  document.getElementById('linkSave').onclick = ()=>{
    const toEmployee = document.getElementById('link_emp').value;
    const fromDate = document.getElementById('link_from').value;
    const toDate = document.getElementById('link_to').value;
    if(!toEmployee || !fromDate || !toDate) return alert('Preencha todos os campos.');
    r.toEmployee = toEmployee;
    r.fromDate = fromDate;
    r.toDate = toDate;
    r.open = false;
    saveData(); modal.style.display='none'; renderCalendar();
  };
}

// Swap button handler
const swapBtn = document.getElementById('swapBtn');
swapBtn.onclick = ()=>{
  const k = fmt(state.selectedDate);
  ensureDay(k);
  const info = DATA.schedules[k];
  const my = isAdmin()? state.currentEmployee : (SESSION?.name || state.currentEmployee);
  const myStatus = info.assignments[my] || 'trabalho';
  openModal('Solicitar troca de folga', `
    <div class="grid2">
      <div>
        <div class="label">Você (solicitante)</div>
        <input type="text" value="${my}" disabled/>
      </div>
      <div>
        <div class="label">Sua data</div>
        <input type="date" id="fromDate" value="${k}"/>
      </div>
    </div>

    <div class="row" style="margin-top:.6rem">
      <label class="split" style="gap:.5rem"><input type="checkbox" id="openSwap"/> Deixar em aberto (sem escolher funcionário agora)</label>
    </div>

    <div id="directFields" class="grid2" style="margin-top:.6rem">
      <div>
        <div class="label">Com quem</div>
        <select id="toEmployee">${DATA.employees.filter(e=>e!==my).map(e=>`<option>${e}</option>`).join('')}</select>
      </div>
      <div>
        <div class="label">Data desejada</div>
        <input type="date" id="toDate" value="${k}"/>
      </div>
    </div>

    <div id="openHint" class="muted" style="display:none;margin-top:.4rem;font-size:.9rem">
      Você está criando uma solicitação <b>aberta</b>. O admin definirá o funcionário e a data de troca depois. Você pode indicar abaixo uma <i>data desejada</i> (opcional).
    </div>
    <div id="openDesired" style="display:none" class="grid2">
      <div>
        <div class="label">Data desejada (opcional)</div>
        <input type="date" id="openDesiredDate" value="${k}"/>
      </div>
    </div>

    <div style="margin-top:.6rem">
      <div class="label">Motivo (opcional)</div>
      <textarea id="reason" rows="3" style="width:100%" placeholder="Ex.: compromisso familiar, médico, etc."></textarea>
    </div>

    <div class="split" style="margin-top:.8rem;align-items:center">
      <div class="muted" style="font-size:.9rem">Status em ${state.selectedDate.toLocaleDateString('pt-BR')}: <span class="pill ${myStatus==='folga'?'ok':'warn'}">${myStatus}</span></div>
      <button class="btn primary right" id="sendSwap">Enviar solicitação</button>
    </div>
  `);

  const openSwap = document.getElementById('openSwap');
  const directFields = document.getElementById('directFields');
  const openHint = document.getElementById('openHint');
  const openDesired = document.getElementById('openDesired');
  const desiredInput = document.getElementById('openDesiredDate');

  openSwap.onchange = ()=>{
    const open = openSwap.checked;
    directFields.style.display = open ? 'none' : 'grid';
    openHint.style.display = open ? 'block' : 'none';
    openDesired.style.display = open ? 'grid' : 'none';
  };

  document.getElementById('sendSwap').onclick = ()=>{
    const fromDate = document.getElementById('fromDate').value;
    const reason = document.getElementById('reason').value.trim();
    const id = 'R'+Math.random().toString(36).slice(2,8);
    if(!fromDate) return alert('Informe sua data.');

    if(openSwap.checked){
      const desired = desiredInput.value || null;
      DATA.swapRequests.push({
        id, requester: my, fromDate, toEmployee: null, toDate: desired, reason, status: 'pendente', open: true
      });
      saveData(); modal.style.display='none'; refreshRequests(); refreshAdminRequests();
      alert('Solicitação aberta registrada (sem escolher funcionário).');
    }else{
      const toEmployee = document.getElementById('toEmployee').value;
      const toDate = document.getElementById('toDate').value;
      if(!toEmployee || !toDate) return alert('Selecione o funcionário e a data desejada.');
      if(my===toEmployee) return alert('Escolha um colega diferente de você.');
      if(fromDate===toDate) return alert('As datas não podem ser iguais.');
      DATA.swapRequests.push({
        id, requester: my, fromDate, toEmployee, toDate, reason, status:'pendente', open:false
      });
      saveData(); modal.style.display='none'; refreshRequests(); refreshAdminRequests();
      alert('Solicitação registrada como "pendente".');
    }
  };
};
