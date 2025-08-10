export const fmt = (d)=> d.toISOString().slice(0,10);
export const parse = (str)=> { const [y,m,da]=str.split('-').map(n=>+n); return new Date(y,m-1,da); };
export const startOfWeek = (d)=> { const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; };
export const addDays = (d, n)=> { const x=new Date(d); x.setDate(x.getDate()+n); return x; };
export const monthLabel = (d)=> d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
export const dedupeByDate = (arr)=>{ const seen=new Set(); const out=[]; arr.forEach(x=>{ if(x?.date && !seen.has(x.date)){ seen.add(x.date); out.push(x); }}); return out; };

export function toast(msg){
  const el = document.createElement('div');
  el.textContent = msg;
  el.style.position='fixed'; el.style.bottom='20px'; el.style.left='50%';
  el.style.transform='translateX(-50%)'; el.style.background='#1a2140';
  el.style.border='1px solid #2a3154'; el.style.color='#e8ecf2';
  el.style.padding='.6rem .8rem'; el.style.borderRadius='10px';
  el.style.boxShadow='0 8px 30px rgba(0,0,0,.35)'; el.style.zIndex='1000';
  document.body.appendChild(el);
  setTimeout(()=>{ el.style.opacity='0'; el.style.transition='opacity .4s'; }, 1800);
  setTimeout(()=> el.remove(), 2400);
}
