import { DATA, saveData, ensureDay } from './storage.js';
import { openModal } from './modal.js';

export function addEmployee(name){
  DATA.employees.push(name);
  Object.keys(DATA.schedules).forEach(k=>{
    ensureDay(k);
    if(!(name in DATA.schedules[k].assignments)){
      DATA.schedules[k].assignments[name] = 'trabalho';
    }
  });
}
export function renameEmployee(oldName, newName){
  const idx = DATA.employees.indexOf(oldName);
  if(idx>=0) DATA.employees[idx] = newName;
  Object.values(DATA.schedules).forEach(day=>{
    if(day.assignments && oldName in day.assignments){
      day.assignments[newName] = day.assignments[oldName];
      delete day.assignments[oldName];
    }
  });
  DATA.swapRequests.forEach(r=>{
    if(r.requester===oldName) r.requester=newName;
    if(r.toEmployee===oldName) r.toEmployee=newName;
  });
}
export function removeEmployee(name){
  DATA.employees = DATA.employees.filter(e=>e!==name);
  Object.values(DATA.schedules).forEach(day=>{
    if(day.assignments && name in day.assignments){ delete day.assignments[name]; }
  });
  DATA.swapRequests.forEach(r=>{
    if(r.requester===name || r.toEmployee===name){
      if(r.status==='pendente') r.status='cancelada';
    }
  });
}

export function openUserManager(refresh){
  const listHTML = DATA.employees.map(n=>`
    <div class="row">
      <div><strong>${n}</strong></div>
      <div class="split">
        <button class="btn" data-rename="${n}">Renomear</button>
        <button class="btn" data-delete="${n}">Remover</button>
      </div>
    </div>
  `).join('') || '<div class="empty">Sem funcionários.</div>';

  openModal('Gerenciar Usuários', `
    <div class="split">
      <div style="flex:1">
        <div class="label">Adicionar funcionário</div>
        <div class="grid2">
          <input type="text" id="newEmpName" placeholder="Nome completo">
          <button class="btn primary" id="addEmpBtn">Adicionar</button>
        </div>
      </div>
    </div>
    <div class="list" style="margin-top:1rem">${listHTML}</div>
    <div class="muted" style="margin-top:.6rem;font-size:.9rem">
      Renomear atualiza a escala e as solicitações. Remover tira o funcionário de todas as escalas e <em>cancela</em> solicitações onde ele participa.
    </div>
  `);

  document.getElementById('addEmpBtn').onclick = ()=>{
    const name = document.getElementById('newEmpName').value.trim();
    if(!name) return alert('Informe um nome.');
    if(DATA.employees.includes(name)) return alert('Já existe um funcionário com esse nome.');
    addEmployee(name); saveData(); refresh(); openUserManager(refresh);
  };
  document.querySelectorAll('[data-rename]').forEach(b=>{
    b.onclick = ()=>{
      const old = b.dataset.rename;
      const novo = prompt(`Renomear "${old}" para:`, old)?.trim();
      if(!novo || novo===old) return;
      if(DATA.employees.includes(novo)) return alert('Já existe funcionário com esse nome.');
      renameEmployee(old, novo); saveData(); refresh(); openUserManager(refresh);
    };
  });
  document.querySelectorAll('[data-delete]').forEach(b=>{
    b.onclick = ()=>{
      const name = b.dataset.delete;
      if(!confirm(`Remover "${name}"?`)) return;
      removeEmployee(name); saveData(); refresh(); openUserManager(refresh);
    };
  });
}
