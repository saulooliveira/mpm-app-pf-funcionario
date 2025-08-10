import { DATA } from './storage.js';

export const state = {
  currentView: 'month',
  currentDate: new Date(),
  selectedDate: new Date(),
  currentEmployee: DATA.employees[0] || '—',
  teamMode: 'day',
  teamDate: new Date()
};
