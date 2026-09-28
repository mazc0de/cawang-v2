import { supabase } from './supabase';

/**
 * FETCH TRANSACTIONS
 */
export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      accounts:account_id(name, type),
      categories:category_id(name, icon)
    `)
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * INSERT TRANSACTION
 */
export async function createTransaction(payload: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...payload, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * FETCH ACCOUNTS
 */
export async function getAccounts() {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('name');
  if (error) throw error;
  return data || [];
}

/**
 * INSERT ACCOUNT
 */
export async function createAccount(payload: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('accounts')
    .insert([{ ...payload, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * UPDATE ACCOUNT
 */
export async function updateAccount(id: string, payload: { name?: string, type?: string, balance?: number }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('accounts')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

/**
 * FETCH BUDGETS
 */
export async function getBudgets() {
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories:category_id(name, icon)
    `);
  if (error) throw error;
  return data || [];
}

/**
 * FETCH RECURRING
 */
export async function getRecurring() {
  const { data, error } = await supabase
    .from('recurring')
    .select('*');
  if (error) throw error;
  return data || [];
}

/**
 * FETCH USER SETTINGS
 */
export async function getUserSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * DELETE ACTIONS
 */
export async function deleteTransaction(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

export async function deleteAccount(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('accounts').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

export async function deleteBudget(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('budgets').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

export async function deleteRecurring(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('recurring').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

/**
 * CATEGORIES
 */
export async function getCategories() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function createCategory(payload: { name: string; type: string; icon: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .insert([{ ...payload, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, payload: { name?: string; type?: string; icon?: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { error } = await supabase.from('categories').delete().eq('id', id).eq('user_id', user.id);
  if (error) throw error;
}

export async function createBudget(payload: { category_id: string; amount_limit: number }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .insert([{ ...payload, user_id: user.id }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateBudget(id: string, payload: { category_id?: string; amount_limit?: number }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('budgets')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTransaction(id: string, payload: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSettings() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // Ignore not found error
  
  if (!data) {
    // Return default if not exists
    return { salary_cycle_start_date: 1 };
  }
  return data;
}

export async function updateSettings(payload: { salary_cycle_start_date: number }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('settings')
    .upsert({ user_id: user.id, ...payload })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function getSafePayTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      accounts:account_id(name, type),
      categories:category_id(name, icon)
    `)
    .eq('is_safe_pay', true)
    .eq('safe_pay_status', 'PENDING')
    .order('date', { ascending: false });
  if (error) throw error;
  return data || [];
}
