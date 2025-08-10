import {DATA, saveData} from './storage.js';
import {SESSION, saveSession, clearSession, isAdmin} from './session.js';
import {state} from './state.js';
import {renderCalendar} from './calendar.js';

const employeeSelect = document.getElementById('employeeSelect');
const loginOverlay = document.getElementById('loginOverlay');
const loginRole = document.getElementById('loginRole');
const loginEmployeeWrap = document.getElementById('loginEmployeeWrap');
const loginEmployee = document.getElementById('loginEmployee');
const sessionBadge = document.getElementById('sessionBadge');

export function refreshEmployeeSelect() {
	employeeSelect.innerHTML = DATA.employees.map(n => `<option value="${n}">${n}</option>`).join('');
	if (!DATA.employees.includes(state.currentEmployee)) 
		state.currentEmployee = DATA.employees[0] || '';
	

	employeeSelect.value = state.currentEmployee;
}
export function fillLoginEmployees() {
	loginEmployee.innerHTML = DATA.employees.map(e => `<option>${e}</option>`).join('');
}

export function updateRoleUI() {
	if (!SESSION) {
		sessionBadge.textContent = '—';
	} else {
		sessionBadge.textContent = (isAdmin() ? 'Admin' : 'Funcionário') + ' • ' + (
		isAdmin() ? '—' : SESSION.name
	);
	}
	document.querySelectorAll('.adminOnly').forEach(el => {
		el.style.display = isAdmin() ? '' : 'none';
	});
	if (isAdmin()) {
		employeeSelect.disabled = false;
		employeeSelect.parentElement.style.display = '';
	} else {
		state.currentEmployee = SESSION ?. name || state.currentEmployee;
		refreshEmployeeSelect();
		employeeSelect.disabled = true;
	}
}

export function showLogin() {
	fillLoginEmployees();
	loginOverlay.style.display = 'flex';
	loginRole.value = 'func';
	loginEmployeeWrap.style.display = 'block';
}
export function afterLogin() {
	loginOverlay.style.display = 'none';
	state.currentEmployee = isAdmin() ? (DATA.employees[0] || '—') : SESSION.name;
	refreshEmployeeSelect();
	updateRoleUI();
	renderCalendar();
}

export function initAuth() {
	refreshEmployeeSelect();
	fillLoginEmployees();
	loginRole.onchange = () => {
		loginEmployeeWrap.style.display = loginRole.value === 'func' ? 'block' : 'none';
	};
	document.getElementById('loginBtn').onclick = () => {
		const role = loginRole.value;
		const name = role === 'func' ? loginEmployee.value : 'Admin';
		if (role === 'func' && !DATA.employees.includes(name)) 
			return alert('Funcionário inválido.');
		

		SESSION.role = role;
		SESSION.name = name;
		saveSession();
		afterLogin();
	};
	document.getElementById('logoutBtn').onclick = () => {
		clearSession();
		showLogin();
	};
	employeeSelect.onchange = () => {
		state.currentEmployee = employeeSelect.value;
		renderCalendar();
	};
}
