export function loadSession(){ try{ return JSON.parse(localStorage.getItem('session_v1')) || null; }catch{ return null; } }
export function saveSession(){ localStorage.setItem('session_v1', JSON.stringify(SESSION)); }
export function clearSession(){ localStorage.removeItem('session_v1'); SESSION=null; }
export let SESSION = loadSession();
export const isAdmin = ()=> SESSION?.role==='admin';
