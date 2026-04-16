// =============================================
// supabase.js — FinanTrack 360
// =============================================
const SUPABASE_URL = 'https://ivszfufrmvffbgatytnk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_wrd9GTubCoCa1k72XWTtyw_60eOpplo';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// AUTH
async function signUp(email, password, fullName) {
  return await _supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
}
async function signIn(email, password) {
  return await _supabase.auth.signInWithPassword({ email, password });
}
async function signOut() {
  await _supabase.auth.signOut();
  window.location.href = 'index.html';
}
async function getSession() {
  const { data: { session } } = await _supabase.auth.getSession();
  return session;
}
async function requireAuth() {
  const session = await getSession();
  if (!session) { window.location.href = 'index.html'; return null; }
  return session;
}

// PROFILE
async function getProfile() {
  const session = await getSession();
  const { data, error } = await _supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  // Si no existe el perfil, crearlo automáticamente
  if (!data) {
    const newProfile = {
      id: session.user.id,
      full_name: session.user.user_metadata?.full_name || '',
      email: session.user.email
    };
    await _supabase.from('profiles').insert([newProfile]);
    return { data: newProfile, error: null };
  }

  return { data, error };
}
// TRANSACTIONS
async function getTransactions(limit = 50) {
  const session = await getSession();
  return await _supabase.from('transactions')
    .select('*, categories(name, icon, color)')
    .eq('user_id', session.user.id)
    .order('date', { ascending: false })
    .limit(limit);
}
async function addTransaction({ type, amount, description, category_id, date }) {
  const session = await getSession();
  return await _supabase.from('transactions')
    .insert([{ user_id: session.user.id, type, amount, description, category_id, date }]).select();
}
async function deleteTransaction(id) {
  return await _supabase.from('transactions').delete().eq('id', id);
}

// BALANCE
async function getBalance() {
  const session = await getSession();
  const { data } = await _supabase.from('transactions').select('type, amount').eq('user_id', session.user.id);
  if (!data) return { balance: 0, ingresos: 0, gastos: 0 };
  const ingresos = data.filter(t => t.type === 'ingreso').reduce((s, t) => s + Number(t.amount), 0);
  const gastos   = data.filter(t => t.type === 'gasto').reduce((s, t) => s + Number(t.amount), 0);
  return { balance: ingresos - gastos, ingresos, gastos };
}

// CATEGORIES
async function getCategories(type = null) {
  const session = await getSession();
  let q = _supabase.from('categories').select('*').or(`user_id.eq.${session.user.id},is_default.eq.true`);
  if (type) q = q.in('type', [type, 'ambos']);
  return await q.order('name');
}

// GOALS
async function getGoals() {
  const session = await getSession();
  return await _supabase.from('goals').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
}
async function addGoal(goal) {
  const session = await getSession();
  return await _supabase.from('goals').insert([{ user_id: session.user.id, ...goal }]).select();
}

// BUDGETS
async function getBudgets(month, year) {
  const session = await getSession();
  return await _supabase.from('budgets').select('*, categories(name, icon, color)')
    .eq('user_id', session.user.id).eq('month', month).eq('year', year);
}

_supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    localStorage.setItem('ft_uid', session.user.id);
  }
  if (event === 'SIGNED_OUT') {
    localStorage.removeItem('ft_uid');
  }
});