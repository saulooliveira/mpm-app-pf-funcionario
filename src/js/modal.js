export const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
export const modalContent = document.getElementById('modalContent');
document.getElementById('closeModal').onclick = ()=> modal.style.display='none';
export function openModal(title, html){ modalTitle.textContent=title; modalContent.innerHTML=html; modal.style.display='flex'; }
