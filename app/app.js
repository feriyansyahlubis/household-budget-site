// NestEgg — the whole site's behaviour: routing, every page, every control.
// All pages read the same state (data.js) and re-render from it, so a change
// made on one page — a new transaction, an edited budget, money added to a
// goal — shows up everywhere else at once. Nothing here fetches anything.

let state = loadState();
let txFilterCategory = "all";
let txSearch = "";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function monthName(offset) {
  const base = new Date(2026, 10, 1); // November 2026, the sample month
  const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function route() {
  const hash = (location.hash || "#/dashboard").replace(/^#\/?/, "");
  return ["dashboard", "budget", "transactions", "goals", "reports", "tips"].includes(hash) ? hash : "dashboard";
}

function render() {
  const page = route();
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.page === page);
  });
  const view = document.getElementById("view");
  if (page === "dashboard") view.innerHTML = viewDashboard();
  else if (page === "budget") view.innerHTML = viewBudget();
  else if (page === "transactions") view.innerHTML = viewTransactions();
  else if (page === "goals") view.innerHTML = viewGoals();
  else if (page === "reports") view.innerHTML = viewReports();
  else view.innerHTML = viewTips();
  afterRender(page);
  window.scrollTo(0, 0);
}

function afterRender(page) {
  if (page === "dashboard") {
    const spent = spentByCategory(state);
    const slices = CATEGORIES.filter((c) => c.id !== "income" && spent[c.id] > 0)
      .map((c) => ({ value: spent[c.id], color: c.color }));
    drawDonut(document.getElementById("donut"), slices, "Spent in Nov", money0(totalSpending(state)));
  }
  if (page === "reports") {
    drawIncomeBars(document.getElementById("income-bars"), state.history);
  }
  if (page === "tips") {
    updateCompound();
  }
}

// ---------- shared bits ----------

function statCard(label, value, sub, tone) {
  return `<div class="stat ${tone || ""}">
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}</div>
    <div class="stat-sub">${sub}</div>
  </div>`;
}

function progressBar(pct, color) {
  const safe = Math.max(0, Math.min(100, pct));
  return `<div class="bar"><div class="bar-fill" style="width:${safe.toFixed(1)}%;background:${color || "#2f6f4f"}"></div></div>`;
}

// ---------- Dashboard ----------

function viewDashboard() {
  const income = totalIncome(state);
  const spending = totalSpending(state);
  const left = round2(income - spending);
  const saved = spentByCategory(state).savings || 0;
  const rate = income > 0 ? (saved / income) * 100 : 0;
  const spent = spentByCategory(state);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const needs = state.buckets.needs.reduce((s, id) => s + (spent[id] || 0), 0);
  const wants = state.buckets.wants.reduce((s, id) => s + (spent[id] || 0), 0);
  const needsPct = (needs / income) * 100, wantsPct = (wants / income) * 100, savePct = rate;
  const topGoal = [...state.goals].sort((a, b) => (b.saved / b.target) - (a.saved / a.target))[0];

  return `
  <section class="page-head">
    <div>
      <h1>Good evening, Whitfields 👋</h1>
      <p class="lede">${esc(state.family.note)} November is nearly done — here is where the household stands.</p>
    </div>
    <div class="month-chip">${esc(state.family.month)} · ${esc(state.family.members)}</div>
  </section>

  <section class="stats">
    ${statCard("Income", money(income), "Salary + freelance + interest", "good")}
    ${statCard("Spending", money(spending), "All expenses incl. savings transfers", "bad")}
    ${statCard("Money left", money(left), "Income minus spending", left >= 0 ? "good" : "bad")}
    ${statCard("Savings rate", rate.toFixed(1) + "%", money(saved) + " moved to savings", "good")}
  </section>

  <section class="grid-2">
    <div class="card">
      <h2>Where the money went</h2>
      <canvas id="donut" class="donut" height="220" aria-label="Donut chart of spending by category"></canvas>
      <ul class="legend">
        ${CATEGORIES.filter((c) => c.id !== "income" && spent[c.id] > 0)
          .sort((a, b) => spent[b.id] - spent[a.id])
          .map((c) => `<li><span class="dot" style="background:${c.color}"></span>${c.name} <b>${money(spent[c.id])}</b> <span class="muted">(${(spent[c.id] / spending * 100).toFixed(1)}%)</span></li>`).join("")}
      </ul>
    </div>

    <div class="card">
      <h2>The 50 / 30 / 20 check</h2>
      <p class="muted">Needs should be near 50% of income, wants near 30%, savings near 20%.</p>
      ${ruleRow("Needs", needsPct, 50, money(needs))}
      ${ruleRow("Wants", wantsPct, 30, money(wants))}
      ${ruleRow("Savings", savePct, 20, money(saved))}
      <p class="verdict">${needsPct <= 55 ? "✅ Needs are under control this month." : "⚠️ Needs are running high — see the budget page."}
      ${savePct >= 15 ? " Savings are on track." : " Savings need attention."}</p>
      <hr>
      <h3>Closest goal: ${esc(topGoal.name)}</h3>
      ${progressBar((topGoal.saved / topGoal.target) * 100)}
      <p class="muted">${money(topGoal.saved)} of ${money(topGoal.target)} saved — ${(topGoal.saved / topGoal.target * 100).toFixed(0)}% there.
      <a href="#/goals">See all goals →</a></p>
    </div>
  </section>

  <section class="card">
    <h2>Latest transactions</h2>
    <table class="tx-table">
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead>
      <tbody>
        ${recent.map((t) => `<tr>
          <td>${fmtDate(t.date)}</td>
          <td>${esc(t.merchant)}</td>
          <td><span class="tag" style="background:${categoryById(t.category).color}">${categoryById(t.category).name}</span></td>
          <td class="num ${t.amount > 0 ? "pos" : "neg"}">${t.amount > 0 ? "+" : "−"}${money(Math.abs(t.amount)).slice(0)}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <p><a class="btn" href="#/transactions">See all ${state.transactions.length} transactions →</a></p>
  </section>`;
}

function ruleRow(label, actual, target, amount) {
  const ok = label === "Savings" ? actual >= target - 5 : actual <= target + 5;
  return `<div class="rule-row">
    <div class="rule-head"><span>${label} — ${actual.toFixed(1)}% of income <span class="muted">(target ${target}%)</span></span><b>${amount}</b></div>
    ${progressBar((actual / 60) * 100, ok ? "#2f6f4f" : "#c0563f")}
    <div class="muted small">${ok ? "On track" : label === "Savings" ? "Below target — try moving payday transfers up" : "Over target — look for one cut to make"}</div>
  </div>`;
}

// ---------- Budget ----------

function viewBudget() {
  const spent = spentByCategory(state);
  const plannedTotal = totalPlanned(state);
  const spentTotal = totalSpending(state);
  return `
  <section class="page-head">
    <div><h1>November budget</h1>
    <p class="lede">Planned vs. spent for every category. Edit a planned amount and press Save — every total on the site updates at once.</p></div>
    <div class="month-chip">Planned ${money(plannedTotal)} · Spent ${money(spentTotal)}</div>
  </section>

  <section class="card">
    <table class="budget-table">
      <thead><tr><th>Category</th><th class="num">Planned</th><th class="num">Spent</th><th class="num">Left</th><th>Progress</th><th></th></tr></thead>
      <tbody>
      ${CATEGORIES.filter((c) => c.id !== "income").map((c) => {
        const p = state.planned[c.id] || 0;
        const s = spent[c.id] || 0;
        const left = round2(p - s);
        const pct = p > 0 ? (s / p) * 100 : 0;
        const over = s > p;
        return `<tr class="${over ? "over" : ""}">
          <td><span class="dot" style="background:${c.color}"></span> ${c.name}</td>
          <td class="num"><input type="number" min="0" step="5" value="${p}" data-plan="${c.id}" aria-label="Planned amount for ${c.name}"> </td>
          <td class="num">${money(s)}</td>
          <td class="num ${left < 0 ? "neg" : "pos"}">${left < 0 ? "−" : ""}${money(Math.abs(left))}</td>
          <td>${progressBar(pct, over ? "#c0563f" : c.color)}<span class="small muted">${pct.toFixed(0)}% used${over ? " — over budget" : ""}</span></td>
          <td></td>
        </tr>`;
      }).join("")}
      <tr class="total-row"><td><b>Total</b></td><td class="num"><b>${money(plannedTotal)}</b></td><td class="num"><b>${money(spentTotal)}</b></td><td class="num"><b>${money(round2(plannedTotal - spentTotal))}</b></td><td colspan="2"></td></tr>
      </tbody>
    </table>
    <div class="actions">
      <button class="btn primary" id="save-budget">Save planned amounts</button>
      <span class="muted" id="budget-msg">Tip: Clothing is ${money((spent.clothing || 0) - state.planned.clothing)} over plan — the winter jackets did it.</span>
    </div>
  </section>

  <section class="card">
    <h2>How the budget was built</h2>
    <p>Planned amounts come from the family's average spending over the last three months, rounded to the nearest $5, then adjusted together at the kitchen table on the last Sunday of October. Savings ($1,400) is set first — it leaves the account on payday, before anything else is spent. The $1,100 left unplanned is the buffer: it covers surprises without touching the emergency fund.</p>
  </section>`;
}

// ---------- Transactions ----------

function viewTransactions() {
  const list = filteredTransactions();
  const income = list.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const out = list.filter((t) => t.amount < 0).reduce((s, t) => s - t.amount, 0);
  return `
  <section class="page-head">
    <div><h1>All transactions</h1>
    <p class="lede">${state.transactions.length} transactions in November. Filter by category, search by shop or person, add a new one, or delete a mistake — the dashboard and budget update straight away.</p></div>
    <div class="month-chip">Showing ${list.length} · In ${money(income)} · Out ${money(out)}</div>
  </section>

  <section class="card">
    <div class="filter-row">
      <label>Category
        <select id="tx-category">
          <option value="all">All categories</option>
          ${CATEGORIES.map((c) => `<option value="${c.id}" ${txFilterCategory === c.id ? "selected" : ""}>${c.name}</option>`).join("")}
        </select>
      </label>
      <label class="grow">Search
        <input type="search" id="tx-search" placeholder="Search a shop, person or note…" value="${esc(txSearch)}">
      </label>
    </div>
    <table class="tx-table">
      <thead><tr><th>Date</th><th>What</th><th>Category</th><th>Note</th><th class="num">Amount</th><th></th></tr></thead>
      <tbody>
        ${list.length === 0 ? `<tr><td colspan="6" class="muted">No transactions match that filter.</td></tr>` : list.map((t) => `<tr>
          <td>${fmtDate(t.date)}</td>
          <td>${esc(t.merchant)}</td>
          <td><span class="tag" style="background:${categoryById(t.category).color}">${categoryById(t.category).name}</span></td>
          <td class="muted">${esc(t.note || "")}</td>
          <td class="num ${t.amount > 0 ? "pos" : "neg"}">${t.amount > 0 ? "+" : "−"}${money(Math.abs(t.amount))}</td>
          <td><button class="btn small danger" data-delete-tx="${t.id}">Delete</button></td>
        </tr>`).join("")}
      </tbody>
    </table>
  </section>

  <section class="card">
    <h2>Add a transaction</h2>
    <form id="add-tx" class="form-grid">
      <label>Date <input type="date" name="date" value="2026-11-26" required></label>
      <label>What <input type="text" name="merchant" placeholder="e.g. GreenMart Supermarket" required maxlength="80"></label>
      <label>Category
        <select name="category">${CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}</select>
      </label>
      <label>Type
        <select name="kind"><option value="expense">Expense</option><option value="income">Income</option></select>
      </label>
      <label>Amount ($) <input type="number" name="amount" min="0.01" step="0.01" placeholder="0.00" required></label>
      <label>Note <input type="text" name="note" placeholder="Optional note" maxlength="120"></label>
      <div class="form-actions"><button class="btn primary" type="submit">Add transaction</button></div>
    </form>
  </section>`;
}

function filteredTransactions() {
  const q = txSearch.trim().toLowerCase();
  return [...state.transactions]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
    .filter((t) => (txFilterCategory === "all" || t.category === txFilterCategory))
    .filter((t) => !q || (t.merchant + " " + (t.note || "")).toLowerCase().includes(q));
}

// ---------- Goals ----------

function viewGoals() {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  return `
  <section class="page-head">
    <div><h1>Savings goals</h1>
    <p class="lede">Four things the family is saving for. Finish dates are worked out from the monthly contribution — raise the contribution and the date moves closer.</p></div>
    <div class="month-chip">${money(totalSaved)} saved of ${money(totalTarget)} total</div>
  </section>

  <section class="grid-2">
    ${state.goals.map((g) => {
      const pct = (g.saved / g.target) * 100;
      const remaining = g.target - g.saved;
      const months = remaining <= 0 ? 0 : Math.ceil(remaining / g.monthly);
      const finish = remaining <= 0 ? "Done — fully funded!" : "Done around " + monthName(months);
      return `<div class="card goal-card">
        <h2>${g.icon} ${esc(g.name)}</h2>
        <p class="muted">${esc(g.detail)}</p>
        <div class="goal-numbers"><b>${money(g.saved)}</b><span class="muted"> of ${money(g.target)}</span></div>
        ${progressBar(pct)}
        <p class="muted">${pct.toFixed(0)}% funded · ${money(g.monthly)}/month · <b>${finish}</b></p>
        <form class="add-money" data-goal="${g.id}">
          <label>Add money ($) <input type="number" name="amount" min="1" step="1" placeholder="50" required></label>
          <button class="btn primary" type="submit">Add to goal</button>
        </form>
      </div>`;
    }).join("")}
  </section>

  <section class="card">
    <h2>Start a new goal</h2>
    <form id="add-goal" class="form-grid">
      <label>Goal name <input type="text" name="name" placeholder="e.g. New washing machine" required maxlength="60"></label>
      <label>What is it for? <input type="text" name="detail" placeholder="A short description" maxlength="140"></label>
      <label>Target amount ($) <input type="number" name="target" min="1" step="1" placeholder="1000" required></label>
      <label>Already saved ($) <input type="number" name="saved" min="0" step="1" value="0"></label>
      <label>Monthly contribution ($) <input type="number" name="monthly" min="1" step="1" placeholder="100" required></label>
      <div class="form-actions"><button class="btn primary" type="submit">Create goal</button></div>
    </form>
  </section>`;
}

// ---------- Reports ----------

function viewReports() {
  const spent = spentByCategory(state);
  const income = totalIncome(state);
  const spending = totalSpending(state);
  const rows = CATEGORIES.filter((c) => c.id !== "income" && spent[c.id] > 0)
    .sort((a, b) => spent[b.id] - spent[a.id]);
  const top = rows[0];
  const avgSpending = state.history.reduce((s, m) => s + m.spending, 0) / state.history.length;
  const avgIncome = state.history.reduce((s, m) => s + m.income, 0) / state.history.length;
  const biggest = [...state.transactions].filter((t) => t.amount < 0)
    .sort((a, b) => a.amount - b.amount)[0];
  const over = CATEGORIES.filter((c) => c.id !== "income" && (spent[c.id] || 0) > (state.planned[c.id] || 0));
  const bestMonth = [...state.history].sort((a, b) => (a.income - a.spending) - (b.income - b.spending)).pop();

  return `
  <section class="page-head">
    <div><h1>Reports — June to November 2026</h1>
    <p class="lede">Six months of the household's money, side by side. Every insight below is calculated from the family's real transactions — not written in advance.</p></div>
    <div class="month-chip">Avg income ${money0(avgIncome)}/mo · Avg spending ${money0(avgSpending)}/mo</div>
  </section>

  <section class="card">
    <h2>Income vs spending, last 6 months</h2>
    <canvas id="income-bars" class="bars" height="260" aria-label="Bar chart of income versus spending for June to November 2026"></canvas>
    <p class="muted">November's bar is drawn from the transactions on this site — income ${money(income)}, spending ${money(spending)}.</p>
  </section>

  <section class="grid-2">
    <div class="card">
      <h2>Spending by category — November</h2>
      <table class="tx-table">
        <thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th><th class="num">vs plan</th></tr></thead>
        <tbody>
          ${rows.map((c) => {
            const diff = (spent[c.id] || 0) - (state.planned[c.id] || 0);
            return `<tr><td><span class="dot" style="background:${c.color}"></span> ${c.name}</td>
            <td class="num">${money(spent[c.id])}</td>
            <td class="num">${(spent[c.id] / spending * 100).toFixed(1)}%</td>
            <td class="num ${diff > 0 ? "neg" : "pos"}">${diff > 0 ? "+" : ""}${money(diff)}</td></tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
    <div class="card">
      <h2>What the numbers say</h2>
      <ul class="insights">
        <li><b>Biggest category:</b> ${top.name} at ${money(spent[top.id])} — ${(spent[top.id] / spending * 100).toFixed(1)}% of all November spending. It is fixed (the mortgage), so the family looks elsewhere to save.</li>
        <li><b>Biggest single expense:</b> ${esc(biggest.merchant)} — ${money(Math.abs(biggest.amount))} on ${fmtDate(biggest.date)}.</li>
        <li><b>Over budget:</b> ${over.length === 0 ? "nothing — every category stayed inside its plan." : over.map((c) => `${c.name} (+${money((spent[c.id] || 0) - (state.planned[c.id] || 0))})`).join(", ") + "."}</li>
        <li><b>Best month:</b> ${bestMonth.month} 2026 — the family kept ${money(bestMonth.income - bestMonth.spending)} of its income, the widest gap in six months.</li>
        <li><b>Trend:</b> spending averaged ${money0(avgSpending)} a month over six months; November (${money(spending)}) sits ${spending > avgSpending ? "above" : "below"} that average, mostly because of the car service and winter jackets.</li>
        <li><b>Savings rate:</b> ${((spent.savings || 0) / income * 100).toFixed(1)}% of November's income went to savings — within reach of the family's 20% target.</li>
      </ul>
    </div>
  </section>`;
}

// ---------- Tips ----------

function viewTips() {
  const totalMonthly = state.tips.reduce((s, t) => s + t.saving, 0);
  return `
  <section class="page-head">
    <div><h1>Money-saving habits</h1>
    <p class="lede">Six habits this family actually uses, with the real dollars each one saves. Together they free about ${money0(totalMonthly)} a month — money that goes straight to the goals.</p></div>
    <div class="month-chip">≈ ${money0(totalMonthly)} saved every month</div>
  </section>

  <section class="grid-2">
    ${state.tips.map((t) => `<div class="card tip-card">
      <div class="tip-icon">${t.icon}</div>
      <h2>${esc(t.title)}</h2>
      <p>${esc(t.text)}</p>
      <p class="tip-saving">Saves about <b>${money(t.saving)}/month</b></p>
    </div>`).join("")}
  </section>

  <section class="card">
    <h2>Compound growth calculator</h2>
    <p class="muted">See what steady monthly saving becomes. The calculator compounds monthly at the annual return you pick — the same maths a savings account or index fund uses.</p>
    <div class="form-grid calc">
      <label>Monthly deposit ($) <input type="number" id="calc-deposit" min="0" step="10" value="400"></label>
      <label>Annual return (%) <input type="number" id="calc-rate" min="0" max="20" step="0.5" value="5"></label>
      <label>Years <input type="number" id="calc-years" min="1" max="40" step="1" value="10"></label>
    </div>
    <div class="calc-result" id="calc-result"></div>
    <p class="muted small">Example: $400 a month at 5% a year for 10 years grows to about $62,100 — $48,000 of it your own deposits and about $14,100 of growth.</p>
  </section>`;
}

function updateCompound() {
  const deposit = Number(document.getElementById("calc-deposit")?.value || 0);
  const rate = Number(document.getElementById("calc-rate")?.value || 0);
  const years = Number(document.getElementById("calc-years")?.value || 0);
  const months = years * 12;
  const r = rate / 100 / 12;
  let future;
  if (r === 0) future = deposit * months;
  else future = deposit * ((Math.pow(1 + r, months) - 1) / r);
  const contributed = deposit * months;
  const growth = future - contributed;
  const el = document.getElementById("calc-result");
  if (el) {
    el.innerHTML = `<div class="calc-box">
      <div><span class="muted">After ${years} years you would have</span><div class="calc-big">${money(future)}</div></div>
      <div class="calc-split"><span>You put in <b>${money(contributed)}</b></span><span>Growth added <b>${money(growth)}</b></span></div>
    </div>`;
  }
}

// ---------- events (one delegated listener for the whole site) ----------

document.addEventListener("input", (e) => {
  if (e.target.id === "tx-search") { txSearch = e.target.value; render(); keepFocus("tx-search", e.target.selectionStart); }
  if (["calc-deposit", "calc-rate", "calc-years"].includes(e.target.id)) updateCompound();
});

function keepFocus(id, pos) {
  const el = document.getElementById(id);
  if (el) { el.focus(); el.setSelectionRange(pos, pos); }
}

document.addEventListener("change", (e) => {
  if (e.target.id === "tx-category") { txFilterCategory = e.target.value; render(); }
});

document.addEventListener("click", (e) => {
  const del = e.target.closest("[data-delete-tx]");
  if (del) {
    const id = Number(del.dataset.deleteTx);
    state.transactions = state.transactions.filter((t) => t.id !== id);
    saveState(state);
    render();
    return;
  }
  if (e.target.id === "save-budget") {
    document.querySelectorAll("[data-plan]").forEach((input) => {
      const v = Math.max(0, Number(input.value) || 0);
      state.planned[input.dataset.plan] = v;
    });
    saveState(state);
    render();
    const msg = document.getElementById("budget-msg");
    if (msg) msg.textContent = "Saved — every page now uses the new planned amounts.";
    return;
  }
  if (e.target.id === "restore-sample") {
    state = resetState();
    txFilterCategory = "all";
    txSearch = "";
    render();
    const msg = document.getElementById("restore-msg");
    if (msg) msg.textContent = "Sample data restored.";
  }
});

document.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  if (form.id === "add-tx") {
    const fd = new FormData(form);
    const kind = fd.get("kind");
    let amount = Math.abs(Number(fd.get("amount")) || 0);
    if (amount <= 0) return;
    if (kind === "expense") amount = -amount;
    const nextId = state.transactions.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    state.transactions.push({
      id: nextId,
      date: fd.get("date") || "2026-11-26",
      merchant: String(fd.get("merchant") || "").trim(),
      category: fd.get("category") || "misc",
      amount: round2(amount),
      note: String(fd.get("note") || "").trim(),
    });
    saveState(state);
    render();
  }
  if (form.id === "add-goal") {
    const fd = new FormData(form);
    const target = Number(fd.get("target")) || 0;
    if (target <= 0) return;
    state.goals.push({
      id: "g" + Date.now(),
      name: String(fd.get("name") || "").trim(),
      detail: String(fd.get("detail") || "").trim() || "A new family goal",
      target,
      saved: Math.max(0, Number(fd.get("saved")) || 0),
      monthly: Math.max(1, Number(fd.get("monthly")) || 1),
      icon: "🎯",
    });
    saveState(state);
    render();
  }
  const goalForm = form.closest("[data-goal]");
  if (goalForm) {
    const fd = new FormData(form);
    const amount = Number(fd.get("amount")) || 0;
    if (amount <= 0) return;
    const goal = state.goals.find((g) => g.id === goalForm.dataset.goal);
    if (goal) {
      goal.saved = round2(goal.saved + amount);
      // Adding money to a goal is a savings transfer: record it as a transaction too.
      const nextId = state.transactions.reduce((m, t) => Math.max(m, t.id), 0) + 1;
      state.transactions.push({
        id: nextId,
        date: "2026-11-26",
        merchant: "Added to " + goal.name,
        category: "savings",
        amount: -round2(amount),
        note: "Manual top-up from the Goals page",
      });
      saveState(state);
      render();
    }
  }
});

window.addEventListener("hashchange", render);
render();
