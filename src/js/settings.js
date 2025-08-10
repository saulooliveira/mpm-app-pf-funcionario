import { DATA, saveData } from './storage.js';
import { syncAll } from './holidays.js';
import { toast } from './utils.js';
import { state } from './state.js';

const sheet = document.getElementById('settingsSheet');
const ufSelect = document.getElementById('ufSelect');
const ibgeCity = document.getElementById('ibgeCity');
const calendarificKey = document.getElementById('calendarificKey');
const invertextoToken = document.getElementById('invertextoToken');
const settingsYear = document.getElementById('settingsYear');

export function openSettingsSheet(){
  ufSelect.value = DATA.prefs.uf || 'SP';
  ibgeCity.value = DATA.prefs.ibgeCity || '3550308';
  calendarificKey.value = DATA.prefs.calendarificKey || '';
  invertextoToken.value = DATA.prefs.invertextoToken || '';
  settingsYear.value = state.currentDate.getFullYear();
  sheet.style.display='flex';
}
export function closeSettingsSheet(){ sheet.style.display='none'; }

export function initSettings(){
  document.getElementById('openSettings').onclick = ()=> openSettingsSheet();
  document.getElementById('closeSettings').onclick = closeSettingsSheet;
  document.getElementById('saveSettings').onclick = ()=>{
    DATA.prefs.uf = ufSelect.value.trim() || 'SP';
    DATA.prefs.ibgeCity = ibgeCity.value.trim() || '3550308';
    DATA.prefs.calendarificKey = calendarificKey.value.trim();
    DATA.prefs.invertextoToken = invertextoToken.value.trim();
    saveData(); sheet.style.display='none'; toast('Configurações salvas');
  };
  document.getElementById('testSync').onclick = async ()=>{
    const y=parseInt(settingsYear.value||state.currentDate.getFullYear(),10);
    await syncAll(y,{force:true});
  };
}
