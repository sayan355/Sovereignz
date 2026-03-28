const API_URL = 'http://localhost:5000/api';

// Router State
let currentUser = JSON.parse(localStorage.getItem('user'));

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    ...(currentUser ? { 'Authorization': `Bearer ${currentUser.token}` } : {})
  };
}

// View Routing
function showView(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.sub-view').forEach(v => v.classList.remove('active'));

  if (!currentUser && (view === 'dashboard' || view === 'transactions' || view === 'goals' || view === 'bills' || view === 'profile')) {
    view = 'login';
  } else if (currentUser && (view === 'login' || view === 'register')) {
    view = 'dashboard';
  }

  if (view === 'login' || view === 'register') {
    document.getElementById(`view-${view}`).classList.add('active');
  } else {
    document.getElementById(`view-protected`).classList.add('active');
    document.getElementById(`subview-${view}`).classList.add('active');
    
    let title = 'Financial Overview';
    if (view === 'transactions') title = 'Transactions';
    if (view === 'goals') title = 'Budgets & Goals';
    if (view === 'bills') title = 'Bills & Alerts';
    if (view === 'profile') title = 'User Profile';
    document.getElementById('header-title').textContent = title;

    document.getElementById('user-greeting').textContent = `Hi, ${currentUser.name}`;

    // Nav Active States — Sovereign Vault dark theme
    ['dashboard', 'transactions', 'goals', 'bills', 'profile'].forEach(v => {
      const navItem = document.getElementById(`nav-${v}`);
      if (!navItem) return;
      if (v === view) {
        navItem.style.background = 'linear-gradient(to right, #004B63, #044D65)';
        navItem.style.color = '#E2E2E5';
        navItem.style.borderLeft = '4px solid #00DAF3';
        navItem.style.paddingLeft = '20px';
      } else {
        navItem.style.background = '';
        navItem.style.color = '';
        navItem.style.borderLeft = '';
        navItem.style.paddingLeft = '';
      }
    });

    if (view === 'dashboard') loadDashboard();
    if (view === 'transactions') loadTransactionsPage();
    if (view === 'goals') loadGoalsPage();
    if (view === 'bills') loadBillsPage();
    if (view === 'profile') loadProfilePage();
  }
}

// Format API
function formatCurrency(amount) {
  if (!currentUser || !currentUser.preferences) return `$${Number(amount).toFixed(2)}`;
  return new Intl.NumberFormat(currentUser.preferences.locale, { style: 'currency', currency: currentUser.preferences.currency }).format(amount);
}
function formatDate(ds) {
  if (!currentUser || !currentUser.preferences) return new Date(ds).toLocaleDateString();
  return new Date(ds).toLocaleDateString(currentUser.preferences.locale, { timeZone: currentUser.preferences.timezone });
}

// Auth Actions
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email: document.getElementById('login-email').value, password: document.getElementById('login-password').value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    currentUser = data;
    localStorage.setItem('user', JSON.stringify(data));
    showView('dashboard');
  } catch (err) {
    document.getElementById('login-error').textContent = err.message;
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name: document.getElementById('reg-name').value, email: document.getElementById('reg-email').value, password: document.getElementById('reg-password').value })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    currentUser = data;
    localStorage.setItem('user', JSON.stringify(data));
    showView('dashboard');
  } catch (err) {
    document.getElementById('register-error').textContent = err.message;
  }
});

function logout() {
  localStorage.removeItem('user');
  currentUser = null;
  showView('login');
}

// Data Loaders
async function fetchTransactions() {
  try {
    const res = await fetch(`${API_URL}/transactions`, { headers: getHeaders() });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) { return []; }
}
async function fetchBudgets() {
  try {
    const res = await fetch(`${API_URL}/budgets`, { headers: getHeaders() });
    return res.ok ? await res.json() : [];
  } catch(e) { return []; }
}
async function fetchGoals() {
  try {
    const res = await fetch(`${API_URL}/goals`, { headers: getHeaders() });
    return res.ok ? await res.json() : [];
  } catch(e) { return []; }
}
async function fetchBills() {
  try {
    const res = await fetch(`${API_URL}/bills`, { headers: getHeaders() });
    return res.ok ? await res.json() : [];
  } catch(e) { return []; }
}

let trendChartInstance = null;
let categoryChartInstance = null;

async function loadDashboard() {
  const transactions = await fetchTransactions();
  const budgets = await fetchBudgets();
  const goals = await fetchGoals();
  const bills = await fetchBills();
  
  let income = 0; let expense = 0;
  
  const monthlyData = {};
  const categoryData = {};
  const currentMonthExp = {};
  const currentMonthStr = new Date().toISOString().substring(0, 7);

  transactions.forEach(t => { 
    const amt = parseFloat(t.amount);
    if (t.type === 'income') {
        income += amt;
    } else {
        expense += amt;
        const catName = t.category?.name || 'General';
        categoryData[catName] = (categoryData[catName] || 0) + amt;
        
        if (t.date.substring(0, 7) === currentMonthStr) {
           currentMonthExp[catName] = (currentMonthExp[catName] || 0) + amt;
        }
    }
    
    const month = t.date.substring(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0 };
    if (t.type === 'income') monthlyData[month].income += amt;
    else monthlyData[month].expense += amt;
  });

  document.getElementById('total-balance').textContent = formatCurrency(income - expense);
  document.getElementById('total-income').textContent = `+${formatCurrency(income)}`;
  document.getElementById('total-expense').textContent = `-${formatCurrency(expense)}`;

  // Process Budgets Alerts
  const alertContainer = document.getElementById('dashboard-alerts');
  let alertsHtml = '';
  budgets.forEach(b => {
     const spent = currentMonthExp[b.category] || 0;
     if (spent > b.amount) {
        alertsHtml += `<div class="bg-error-container text-on-error-container p-4 rounded-xl font-medium shadow-sm flex items-center">
           <span class="font-bold material-symbols-outlined mr-3">warning</span>
           <span><strong>Budget Overrun:</strong> You've spent ${formatCurrency(spent)} on <strong>${b.category}</strong> (Limit: ${formatCurrency(b.amount)})</span>
        </div>`;
     }
  });
  alertContainer.innerHTML = alertsHtml;

  // Process Savings Goal Widget
  const goalWidget = document.getElementById('dash-goal-widget');
  if (goals.length > 0) {
    const urgentGoal = goals.sort((a,b) => new Date(a.deadline) - new Date(b.deadline))[0];
    const pct = Math.min(100, Math.round((urgentGoal.currentAmount / urgentGoal.targetAmount) * 100));
    goalWidget.innerHTML = `
      <div class="flex justify-between items-end mb-2">
        <span class="text-2xl font-bold text-primary">${pct}%</span>
        <span class="text-xs text-on-secondary-container/70 font-medium truncate ml-2 max-w-[100px]">${urgentGoal.name}</span>
      </div>
      <div class="h-2 w-full bg-white/40 rounded-full overflow-hidden">
        <div class="h-full bg-secondary rounded-full transition-all duration-1000" style="width: ${pct}%"></div>
      </div>
    `;
  } else {
    goalWidget.innerHTML = `<div class="text-center text-sm font-semibold opacity-60 py-4">No active goals</div>`;
  }

  // OS Push Notification Interceptor (Web Notifications API)
  if ("Notification" in window && Notification.permission === "granted") {
    const notified = JSON.parse(sessionStorage.getItem('notified')) || {};
    
    // Check Budgets
    budgets.forEach(b => {
      const spent = currentMonthExp[b.category] || 0;
      if (spent > b.amount) {
         const key = `budget_${b._id}_${currentMonthStr}`;
         if (!notified[key]) {
            new Notification(`Budget Overrun Alert! 📉`, { body: `You've exceeded your ${formatCurrency(b.amount)} monthly boundary for ${b.category}!` });
            notified[key] = true;
         }
      }
    });

    // Check Goals
    goals.forEach(g => {
       const pct = g.currentAmount / g.targetAmount;
       const key = `goal_${g._id}`;
       if (pct >= 1 && !notified[key + '_100']) {
         new Notification("Savings Target Demolished! 🎉", { body: `You've hit your ${formatCurrency(g.targetAmount)} ambition for "${g.name}"!` });
         notified[key + '_100'] = true;
       } else if (pct >= 0.5 && !notified[key + '_50']) {
         new Notification("Goal Milestone! ⭐", { body: `You're halfway there! Keep saving for "${g.name}"!` });
         notified[key + '_50'] = true;
       }
    });

    // Check Bills
    const today = new Date();
    bills.forEach(b => {
       if (b.isPaid) return;
       const diffDays = Math.ceil((new Date(b.dueDate) - today) / (1000 * 60 * 60 * 24));
       if (diffDays <= 3 && diffDays >= 0) {
          const key = `bill_${b._id}_${b.dueDate}`;
          if (!notified[key]) {
            new Notification("Bill Due Soon! 📅", { body: `Your ${formatCurrency(b.amount)} charge for "${b.name}" strikes in ${diffDays} day(s)!` });
            notified[key] = true;
          }
       } else if (diffDays < 0) {
          const key = `bill_${b._id}_${b.dueDate}_overdue`;
          if (!notified[key]) {
            new Notification("Bill Overdue! 🚨", { body: `Your ${formatCurrency(b.amount)} charge for "${b.name}" is leaking penalties!` });
            notified[key] = true;
          }
       }
    });
    sessionStorage.setItem('notified', JSON.stringify(notified));
  }

  renderCharts(monthlyData, categoryData);

  const recentList = document.getElementById('recent-transactions');
  if (transactions.length === 0) {
    recentList.innerHTML = '<tr><td colspan="4" class="text-center py-8 text-[#C0C7CD] text-sm">No recent transactions.</td></tr>';
  } else {
    recentList.innerHTML = transactions.slice(0, 5).map(t => {
      const isIncome = t.type === 'income';
      const icon = isIncome ? 'payments' : 'shopping_cart';
      const amtColor = isIncome ? 'color:#00DAF3' : 'color:#ffb59f';
      return `
        <tr class="border-b border-[#40484C]/20 hover:bg-[#1A1C1E] transition-colors">
          <td class="px-4 sm:px-6 py-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-[#1A1C1E] border border-[#40484C]/20 flex items-center justify-center">
                <span class="material-symbols-outlined text-[#96CEEB] text-base">${icon}</span>
              </div>
              <div>
                <p class="font-semibold text-[#E2E2E5] text-sm">${t.notes || 'Transaction'}</p>
                <p class="text-[10px] text-[#C0C7CD]">${formatDate(t.date)}</p>
              </div>
            </div>
          </td>
          <td class="px-4 sm:px-6 py-4"><span class="px-2 py-1 bg-[#1A1C1E] text-[10px] font-bold uppercase rounded text-[#C0C7CD] border border-[#40484C]/30">${t.category?.name || 'General'}</span></td>
          <td class="px-4 sm:px-6 py-4 text-right font-bold text-sm" style="${amtColor}">${isIncome ? '+' : '-'}${formatCurrency(Math.abs(t.amount))}</td>
          <td class="px-4 sm:px-6 py-4 text-right"><span class="text-[10px] font-bold flex items-center justify-end gap-1 text-[#00DAF3] uppercase tracking-tight"><span class="material-symbols-outlined text-xs">check_circle</span>Done</span></td>
        </tr>`;
    }).join('');
  }
}

async function loadTransactionsPage() {
  const transactions = await fetchTransactions();
  const list = document.getElementById('transactions-list');
  if (transactions.length === 0) {
    list.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-[#C0C7CD] text-sm">No transactions recorded.</td></tr>';
    return;
  }
  list.innerHTML = transactions.map(t => {
    const isIncome = t.type === 'income';
    const amtColor = isIncome ? 'color:#00DAF3' : 'color:#ffb59f';
    return `
      <tr class="hover:bg-[#1A1C1E] transition-colors border-b border-[#40484C]/10 last:border-0">
        <td class="px-4 sm:px-8 py-5">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-[#282A2D] flex items-center justify-center text-[#96CEEB] flex-shrink-0">
              <span class="material-symbols-outlined text-base">${isIncome ? 'payments' : 'shopping_cart'}</span>
            </div>
            <div class="min-w-0">
              <p class="font-bold text-sm text-[#E2E2E5] truncate">${t.notes || '-'}</p>
              <p class="text-[10px] text-[#C0C7CD]">${formatDate(t.date)}</p>
            </div>
          </div>
        </td>
        <td class="px-4 sm:px-8 py-5"><span class="px-2 py-1 bg-[#1A1C1E] text-[10px] font-bold uppercase rounded-full text-[#C0C7CD] border border-[#40484C]/30 whitespace-nowrap">${t.category?.name || 'General'}</span></td>
        <td class="px-4 sm:px-8 py-5 text-right font-bold text-sm whitespace-nowrap" style="${amtColor}">${isIncome ? '+' : '-'}${formatCurrency(Math.abs(t.amount))}</td>
        <td class="px-4 sm:px-8 py-5 text-right">
          <button onclick="deleteTx('${t._id}')" class="text-[#ffb4ab] hover:text-red-400 transition-colors p-1 rounded hover:bg-[#333537]">
            <span class="material-symbols-outlined text-base">delete</span>
          </button>
        </td>
      </tr>`;
  }).join('');
}

document.getElementById('add-tx-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        type: document.getElementById('tx-type').value,
        amount: document.getElementById('tx-amount').value,
        category: document.getElementById('tx-category').value,
        notes: document.getElementById('tx-notes').value
      })
    });
    if (!res.ok) throw new Error('Failed to add transaction');
    document.getElementById('add-tx-form').reset();
    document.getElementById('add-tx-form-container').classList.add('hidden');
    loadTransactionsPage();
  } catch (err) { alert(err.message); }
});

function renderCharts(monthlyData, categoryData) {
  if (trendChartInstance) trendChartInstance.destroy();
  if (categoryChartInstance) categoryChartInstance.destroy();

  const sortedMonths = Object.keys(monthlyData).sort().slice(-6); 
  const incomeTrend = sortedMonths.map(m => monthlyData[m].income);
  const expenseTrend = sortedMonths.map(m => monthlyData[m].expense);

  const ctxTrend = document.getElementById('trendChart')?.getContext('2d');
  if (ctxTrend) {
    trendChartInstance = new Chart(ctxTrend, {
      type: 'bar',
      data: {
        labels: sortedMonths,
        datasets: [
          { label: 'Income', data: incomeTrend, backgroundColor: '#00DAF3', borderRadius: 4 },
          { label: 'Expense', data: expenseTrend, backgroundColor: '#ffb59f', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#C0C7CD', font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: '#C0C7CD' }, grid: { color: '#40484C33' } },
          y: { ticks: { color: '#C0C7CD' }, grid: { color: '#40484C33' } }
        }
      }
    });
  }

  const catLabels = Object.keys(categoryData);
  const catValues = Object.values(categoryData);

  const ctxCat = document.getElementById('categoryChart')?.getContext('2d');
  if (ctxCat) {
    categoryChartInstance = new Chart(ctxCat, {
      type: 'doughnut',
      data: {
        labels: catLabels,
        datasets: [{
          data: catValues,
          backgroundColor: ['#00DAF3','#96CEEB','#004B63','#ffb59f','#00DAF3aa','#96CEEBaa'],
          borderWidth: 0,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: '#C0C7CD', boxWidth: 10, font: { size: 10 } } } }
      }
    });
  }
}

async function downloadCSV() {
  const transactions = await fetchTransactions();
  if (!transactions.length) return alert('No transactions to export.');
  let csvContent = "data:text/csv;charset=utf-8,Date,Type,Category,Amount,Notes\\r\\n";
  
  transactions.forEach(t => {
    const row = [
      t.date.split('T')[0],
      t.type,
      `"${t.category?.name || 'General'}"`,
      t.amount,
      `"${t.notes || ''}"`
    ].join(",");
    csvContent += row + "\\r\\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `finance_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function downloadPDF() {
  const transactions = await fetchTransactions();
  if (!transactions.length) return alert('No transactions to export.');
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Financial Report', 14, 22);
  
  const tableColumn = ["Date", "Type", "Category", "Amount", "Notes"];
  const tableRows = transactions.map(t => {
    const isIncome = t.type === 'income';
    return [
      formatDate(t.date),
      t.type.toUpperCase(),
      t.category?.name || 'General',
      `${isIncome ? '+' : '-'}${formatCurrency(Math.abs(t.amount))}`,
      t.notes || '-'
    ];
  });
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [0, 51, 69], textColor: 255 } 
  });

  doc.save(`finance_ledger_${new Date().toISOString().split('T')[0]}.pdf`);
}

window.deleteTx = async function (id) {
  if (!confirm('Delete this transaction?')) return;
  try {
    await fetch(`${API_URL}/transactions/${id}`, { method: 'DELETE', headers: getHeaders() });
    loadTransactionsPage();
  } catch (err) { alert(err.message); }
};

// --- GOALS & BUDGETS ---

async function loadGoalsPage() {
   const budgets = await fetchBudgets();
   const listB = document.getElementById('budgets-list');
   listB.innerHTML = budgets.map(b => `
     <div class="bg-[#121416] rounded-xl p-4 border border-[#40484C]/30 flex justify-between items-center hover:border-[#00DAF3]/20 transition-all">
       <div>
         <span class="font-bold text-[#E2E2E5] text-sm">${b.category}</span>
         <span class="text-[10px] text-[#00DAF3] block uppercase tracking-widest mt-0.5">Limit: ${formatCurrency(b.amount)}</span>
       </div>
       <button onclick="deleteBudget('${b._id}')" class="text-[#ffb4ab] hover:text-red-400 hover:bg-[#333537] p-1 rounded transition-all material-symbols-outlined text-base">delete</button>
     </div>
   `).join('') || '<p class="text-[#C0C7CD] text-sm py-6 italic text-center">No active budgets.</p>';

   const goals = await fetchGoals();
   const listG = document.getElementById('goals-list');
   listG.innerHTML = goals.map(g => {
     const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
     const barColor = pct >= 100 ? '#00DAF3' : pct >= 50 ? '#96CEEB' : '#ffb59f';
     return `
     <div class="bg-[#121416] rounded-xl p-4 border border-[#40484C]/30 hover:border-[#00DAF3]/20 transition-all">
       <div class="flex justify-between items-start mb-3">
         <div>
           <span class="font-bold text-[#E2E2E5] text-sm">${g.name}</span>
           <span class="text-[10px] text-[#C0C7CD] block mt-0.5">Due: ${formatDate(g.deadline)}</span>
         </div>
         <button onclick="deleteGoal('${g._id}')" class="text-[#ffb4ab] hover:text-red-400 hover:bg-[#333537] p-1 rounded transition-all material-symbols-outlined text-base">delete</button>
       </div>
       <div class="w-full bg-[#0C0E10] rounded-full h-1.5 overflow-hidden">
         <div class="h-1.5 rounded-full transition-all duration-700" style="width:${pct}%;background:${barColor}"></div>
       </div>
       <div class="flex justify-between mt-2">
         <span class="text-[10px] font-bold" style="color:${barColor}">${pct}%</span>
         <span class="text-[10px] text-[#C0C7CD]">${formatCurrency(g.currentAmount)} / ${formatCurrency(g.targetAmount)}</span>
       </div>
     </div>
   `}).join('') || '<p class="text-[#C0C7CD] text-sm py-6 italic text-center">No goals set.</p>';
}

document.getElementById('add-budget-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/budgets`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ category: document.getElementById('budget-category').value, amount: document.getElementById('budget-amount').value })
    });
    if(!res.ok) throw new Error('Failed to save budget');
    document.getElementById('add-budget-form').reset();
    loadGoalsPage();
  } catch(e) { alert(e.message); }
});

document.getElementById('add-goal-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/goals`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ name: document.getElementById('goal-name').value, targetAmount: document.getElementById('goal-target').value, currentAmount: document.getElementById('goal-current').value, deadline: document.getElementById('goal-deadline').value })
    });
    if(!res.ok) throw new Error('Failed to save goal');
    document.getElementById('add-goal-form').reset();
    loadGoalsPage();
  } catch(e) { alert(e.message); }
});

window.deleteBudget = async (id) => { if(confirm('Delete budget?')) { await fetch(`${API_URL}/budgets/${id}`, { method: 'DELETE', headers: getHeaders() }); loadGoalsPage(); } };
window.deleteGoal = async (id) => { if(confirm('Delete goal?')) { await fetch(`${API_URL}/goals/${id}`, { method: 'DELETE', headers: getHeaders() }); loadGoalsPage(); } };

// --- BILLS & ALERTS ---

async function loadBillsPage() {
   const bills = (await fetchBills()).sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));
   const listB = document.getElementById('bills-list');
   listB.innerHTML = bills.map(b => {
     const daysLeft = Math.ceil((new Date(b.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
     const isDueSoon = !b.isPaid && daysLeft <= 3 && daysLeft >= 0;
     const isOverdue = !b.isPaid && daysLeft < 0;
     return `
     <tr class="hover:bg-[#1A1C1E] transition-colors border-b border-[#40484C]/10 last:border-0 ${b.isPaid ? 'opacity-40' : ''}">
       <td class="px-4 sm:px-6 py-4">
         <div class="flex items-center gap-3">
           <input type="checkbox" ${b.isPaid ? 'checked' : ''} onchange="toggleBill('${b._id}', this.checked)" class="w-4 h-4 rounded cursor-pointer accent-[#00DAF3]">
           <div class="min-w-0">
             <p class="font-bold text-sm text-[#E2E2E5] ${b.isPaid ? 'line-through opacity-60' : ''} truncate">${b.name}</p>
             <p class="text-[10px] text-[#C0C7CD]">${formatDate(b.dueDate)}</p>
           </div>
         </div>
       </td>
       <td class="px-4 sm:px-6 py-4">
         ${isOverdue ? '<span class="bg-[#93000a]/20 text-[#ffb4ab] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-[#ffb4ab]/20">Overdue</span>' :
           isDueSoon ? '<span class="bg-[#00DAF3]/10 text-[#00DAF3] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-[#00DAF3]/20">Due Soon</span>' :
           b.isPaid ? '<span class="bg-[#005049]/30 text-[#00DAF3] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Paid</span>' :
           '<span class="text-[10px] text-[#C0C7CD] uppercase tracking-wider">Upcoming</span>'}
       </td>
       <td class="px-4 sm:px-6 py-4 text-right font-bold text-sm" style="color:${isOverdue ? '#ffb4ab' : b.isPaid ? '#00DAF3' : '#E2E2E5'}">${formatCurrency(b.amount)}</td>
       <td class="px-4 sm:px-6 py-4 text-right">
         <button onclick="deleteBill('${b._id}')" class="text-[#ffb4ab] hover:text-red-400 hover:bg-[#333537] p-1 rounded transition-all">
           <span class="material-symbols-outlined text-base">delete</span>
         </button>
       </td>
     </tr>`;
   }).join('') || '<tr><td colspan="4" class="p-8 text-center text-[#C0C7CD] text-sm italic">No upcoming bills set.</td></tr>';
}

document.getElementById('add-bill-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/bills`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ name: document.getElementById('bill-name').value, amount: document.getElementById('bill-amount').value, dueDate: document.getElementById('bill-deadline').value })
    });
    if(!res.ok) throw new Error('Failed to save bill');
    document.getElementById('add-bill-form').reset();
    loadBillsPage();
  } catch(e) { alert(e.message); }
});

window.deleteBill = async (id) => { if(confirm('Delete bill?')) { await fetch(`${API_URL}/bills/${id}`, { method: 'DELETE', headers: getHeaders() }); loadBillsPage(); } };
window.toggleBill = async (id, isPaid) => { await fetch(`${API_URL}/bills/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({isPaid}) }); loadBillsPage(); };

// --- PROFILE SETTINGS ---
function loadProfilePage() {
  if (currentUser && currentUser.preferences) {
    document.getElementById('pref-currency').value = currentUser.preferences.currency || 'USD';
    document.getElementById('pref-locale').value = currentUser.preferences.locale || 'en-US';
    document.getElementById('pref-timezone').value = currentUser.preferences.timezone || 'UTC';
  }
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const res = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT', headers: getHeaders(), body: JSON.stringify({ currency: document.getElementById('pref-currency').value, locale: document.getElementById('pref-locale').value, timezone: document.getElementById('pref-timezone').value })
    });
    if(!res.ok) throw new Error('Failed to update profile');
    const updatedUser = await res.json();
    currentUser = updatedUser;
    localStorage.setItem('user', JSON.stringify(currentUser));
    alert('Regional Settings Saved!');
    showView('dashboard');
  } catch(e) { 
    console.error('Profile Update Error:', e);
    alert('Error: ' + e.message); 
  }
});

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
     Notification.requestPermission();
  }
});
showView(currentUser ? 'dashboard' : 'login');
