export function loadSession() {
	try {
		return JSON.parse(localStorage.getItem('session_v1')) || {};
	} catch {
		return {};
	}}
export function saveSession() {
	localStorage.setItem('session_v1', JSON.stringify(SESSION));
}
export function clearSession() {
	localStorage.removeItem('session_v1');
	SESSION = {};
}
export let SESSION = loadSession();
export const isAdmin = () => SESSION ?. role === 'admin';
