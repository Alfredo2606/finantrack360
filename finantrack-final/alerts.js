// alerts.js — Sistema de Alertas FinanTrack 360

function getAlertHistory() {
  try { return JSON.parse(localStorage.getItem('ft_alert_history') || '[]'); } catch { return []; }
}
function saveAlertToHistory(a) {
  const h = getAlertHistory();
  h.unshift({ ...a, id: Date.now(), timestamp: new Date().toISOString(), read: false });
  if (h.length > 50) h.splice(50);
  localStorage.setItem('ft_alert_history', JSON.stringify(h));
}
function clearAlertHistory() { localStorage.removeItem('ft_alert_history'); }

function createAlertsContainer() {
  if (document.getElementById('alerts-container')) return;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInAlert{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
    @keyframes slideOutAlert{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(20px)}}
    @keyframes panelIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
    #alert-history-list::-webkit-scrollbar{width:4px}
    #alert-history-list::-webkit-scrollbar-thumb{background:#e2ece0;border-radius:2px}
  `;
  document.head.appendChild(style);
  const c = document.createElement('div');
  c.id = 'alerts-container';
  c.style.cssText = 'position:fixed;top:80px;right:20px;z-index:9999;display:flex;flex-direction:column;gap:10px;max-width:360px;width:100%;pointer-events:none;';
  document.body.appendChild(c);
}

function dismissAlert(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.animation = 'slideOutAlert .25s ease forwards';
  setTimeout(() => el.remove(), 250);
}

function showAlert({ type='info', title, message, duration=5000, save=true }) {
  createAlertsContainer();
  const colors = {
    danger:  {bg:'#fef2f2',border:'#fecaca',icon:'🔴',text:'#dc2626'},
    warning: {bg:'#fffbeb',border:'#fde68a',icon:'🟡',text:'#d97706'},
    success: {bg:'#f0fdf4',border:'#bbf7d0',icon:'🟢',text:'#16a34a'},
    info:    {bg:'#eff6ff',border:'#bfdbfe',icon:'🔵',text:'#2563eb'}
  };
  const c = colors[type] || colors.info;
  const id = 'alert-' + Date.now();
  const el = document.createElement('div');
  el.id = id;
  el.style.cssText = `background:${c.bg};border:1.5px solid ${c.border};border-radius:14px;padding:14px 16px;display:flex;gap:12px;align-items:flex-start;box-shadow:0 4px 20px rgba(0,0,0,.10);animation:slideInAlert .3s cubic-bezier(.22,1,.36,1) both;font-family:Outfit,sans-serif;pointer-events:all;`;
  el.innerHTML = `
    <span style="font-size:18px;flex-shrink:0;margin-top:1px">${c.icon}</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:13px;font-weight:700;color:${c.text};margin-bottom:2px">${title}</div>
      <div style="font-size:12px;color:#6b7280;line-height:1.4">${message}</div>
    </div>
    <button onclick="dismissAlert('${id}')" style="background:none;border:none;cursor:pointer;color:#9ca3af;font-size:16px;padding:0;flex-shrink:0">✕</button>`;
  document.getElementById('alerts-container').appendChild(el);
  if (duration > 0) setTimeout(() => dismissAlert(id), duration);
  if (save) { saveAlertToHistory({type,title,message}); updateAlertBadge(); }
}

function openHistoryPanel() {
  let panel = document.getElementById('alert-history-panel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'alert-history-panel';
    panel.style.cssText = 'position:fixed;bottom:0;left:260px;z-index:9997;width:380px;background:white;border-radius:20px 20px 0 0;box-shadow:0 -4px 30px rgba(0,0,0,.15);border:1px solid #e2ece0;border-bottom:none;display:flex;flex-direction:column;max-height:70vh;font-family:Outfit,sans-serif;';
    panel.innerHTML = `
      <div style="padding:18px 20px 14px;border-bottom:1px solid #e2ece0;display:flex;align-items:center;justify-content:space-between">
        <div style="font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#1a2318">Historial de Alertas</div>
        <div style="display:flex;gap:8px;align-items:center">
          <button onclick="clearAlertHistoryUI()" style="background:none;border:none;cursor:pointer;font-size:11px;color:#8a9e84;font-family:Outfit,sans-serif;padding:4px 8px;border-radius:6px">Limpiar todo</button>
          <button onclick="closeHistoryPanel()" style="background:#f7f8f5;border:none;cursor:pointer;width:28px;height:28px;border-radius:8px;font-size:14px;color:#8a9e84">✕</button>
        </div>
      </div>
      <div id="alert-history-list" style="overflow-y:auto;flex:1;padding:8px 0"></div>`;
    document.body.appendChild(panel);
  }
  renderHistoryPanel();
  panel.style.display = 'flex';
  panel.style.animation = 'panelIn .25s ease';
  const h = getAlertHistory().map(a => ({...a, read:true}));
  localStorage.setItem('ft_alert_history', JSON.stringify(h));
  updateAlertBadge();
}

function closeHistoryPanel() {
  const panel = document.getElementById('alert-history-panel');
  if (panel) panel.style.display = 'none';
}

function renderHistoryPanel() {
  const list = document.getElementById('alert-history-list');
  const history = getAlertHistory();
  if (!list) return;
  if (!history.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#8a9e84;font-size:13px"><div style="font-size:32px;margin-bottom:10px">🔕</div><p>No hay alertas aún</p></div>';
    return;
  }
  const colors = { danger:{icon:'🔴',text:'#dc2626'}, warning:{icon:'🟡',text:'#d97706'}, success:{icon:'🟢',text:'#16a34a'}, info:{icon:'🔵',text:'#2563eb'} };
  list.innerHTML = history.map(a => {
    const c = colors[a.type] || colors.info;
    const date = new Date(a.timestamp).toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
    return `<div style="padding:12px 16px;border-bottom:1px solid #f7f8f5;display:flex;gap:10px">
      <span style="font-size:16px;flex-shrink:0;margin-top:2px">${c.icon}</span>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:600;color:${c.text};margin-bottom:2px">${a.title}</div>
        <div style="font-size:12px;color:#6b7280;line-height:1.4">${a.message}</div>
        <div style="font-size:10px;color:#9ca3af;margin-top:4px">${date}</div>
      </div>
    </div>`;
  }).join('');
}

function clearAlertHistoryUI() { clearAlertHistory(); renderHistoryPanel(); updateAlertBadge(); }

function updateAlertBadge() {
  const badge = document.getElementById('sidebar-alert-badge');
  if (!badge) return;
  const unread = getAlertHistory().filter(a => !a.read).length;
  badge.textContent = unread > 9 ? '9+' : unread;
  badge.style.display = unread > 0 ? 'flex' : 'none';
}

async function checkBudgetAlerts(silent=false) {
  try {
    const now = new Date();
    const {data:budgets} = await getBudgets(now.getMonth()+1, now.getFullYear());
    const {data:txs}     = await getTransactions(500);
    if (!budgets?.length) return;
    const fmt = n => '$'+Number(n).toLocaleString('es-MX',{minimumFractionDigits:0});
    budgets.forEach(b => {
      const spent = txs ? txs.filter(t=>t.category_id===b.category_id&&t.type==='gasto').reduce((s,t)=>s+Number(t.amount),0) : 0;
      const pct = b.budget_amount>0 ? (spent/b.budget_amount)*100 : 0;
      const cat = b.categories?.name||'Categoría';
      if (pct>=100 && !silent) showAlert({type:'danger',title:`¡Presupuesto excedido! — ${cat}`,message:`Gastaste ${fmt(spent)} de ${fmt(b.budget_amount)} (${Math.round(pct)}%).`,duration:8000});
      else if (pct>=90 && !silent) showAlert({type:'warning',title:`Casi en el límite — ${cat}`,message:`Llevas el ${Math.round(pct)}%. Solo quedan ${fmt(b.budget_amount-spent)}.`,duration:6000});
      else if (pct>=75 && !silent) showAlert({type:'info',title:`Atención — ${cat}`,message:`Llevas el ${Math.round(pct)}% de tu presupuesto. Quedan ${fmt(b.budget_amount-spent)}.`,duration:5000});
    });
  } catch(e) {}
}

async function checkTransactionAlert(category_id, amount) {
  try {
    const now = new Date();
    const {data:budgets} = await getBudgets(now.getMonth()+1, now.getFullYear());
    if (!budgets?.length) return;
    const budget = budgets.find(b=>b.category_id===category_id);
    if (!budget) return;
    const {data:txs} = await getTransactions(500);
    const spent = txs ? txs.filter(t=>t.category_id===category_id&&t.type==='gasto').reduce((s,t)=>s+Number(t.amount),0) : 0;
    const newSpent = spent + Number(amount);
    const pct = (newSpent/budget.budget_amount)*100;
    const cat = budget.categories?.name||'esta categoría';
    const fmt = n => '$'+Number(n).toLocaleString('es-MX',{minimumFractionDigits:0});
    if (pct>=100) showAlert({type:'danger',title:`¡Superaste el presupuesto de ${cat}!`,message:`Con este gasto llevarás ${fmt(newSpent)} de ${fmt(budget.budget_amount)} (${Math.round(pct)}%).`,duration:8000});
    else if (pct>=90) showAlert({type:'warning',title:`Casi al límite en ${cat}`,message:`Llevarás el ${Math.round(pct)}%. Quedarán ${fmt(budget.budget_amount-newSpent)}.`,duration:6000});
  } catch(e) {}
}

function showGoalAlert(goalName, currentAmount, targetAmount) {
  const pct = Math.min(Math.round((currentAmount/targetAmount)*100),100);
  const fmt = n => '$'+Number(n).toLocaleString('es-MX',{minimumFractionDigits:0});
  let title, message;
  if (pct>=100)     { title=`🎉 ¡Meta completada! — ${goalName}`;    message=`¡Felicidades! Lograste tu objetivo de ${fmt(targetAmount)}. ¡Excelente trabajo!`; }
  else if (pct>=75) { title=`💪 ¡Vas muy bien! — ${goalName}`;       message=`Llevas el ${pct}%. Te faltan ${fmt(targetAmount-currentAmount)}. ¡Tú puedes!`; }
  else if (pct>=50) { title=`🚀 ¡A mitad del camino! — ${goalName}`; message=`Ya tienes el ${pct}% de tu meta. ¡Sigue así!`; }
  else              { title=`✅ ¡Abono registrado! — ${goalName}`;   message=`Llevas ${fmt(currentAmount)} de ${fmt(targetAmount)} (${pct}%). ¡Cada peso cuenta!`; }
  showAlert({type:'success', title, message, duration:7000});
}

document.addEventListener('DOMContentLoaded', () => { createAlertsContainer(); updateAlertBadge(); });
