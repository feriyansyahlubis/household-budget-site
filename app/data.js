// NestEgg — sample data and state for the Whitfield household, November 2026.
// All figures are one consistent set: every page of the site (dashboard, budget,
// transactions, goals, reports) is computed from this same data, so the numbers
// always agree with each other. Money is in US dollars.

const STORAGE_KEY = "nestegg-state-v1";

const CATEGORIES = [
  { id: "housing", name: "Housing", color: "#2f6f4f", icon: "🏠" },
  { id: "groceries", name: "Groceries", color: "#d97706", icon: "🛒" },
  { id: "utilities", name: "Utilities", color: "#2563eb", icon: "💡" },
  { id: "transport", name: "Transport", color: "#7c3aed", icon: "🚗" },
  { id: "dining", name: "Dining Out", color: "#dc2626", icon: "🍽️" },
  { id: "entertainment", name: "Entertainment", color: "#db2777", icon: "🎬" },
  { id: "clothing", name: "Clothing", color: "#0891b2", icon: "👕" },
  { id: "healthcare", name: "Healthcare", color: "#059669", icon: "🩺" },
  { id: "education", name: "Education", color: "#65a30d", icon: "📚" },
  { id: "savings", name: "Savings", color: "#b45309", icon: "🐣" },
  { id: "misc", name: "Miscellaneous", color: "#6b7280", icon: "🧺" },
  { id: "income", name: "Income", color: "#16a34a", icon: "💵" },
];

function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 2];
}

// The sample month. Planned amounts are the family's November budget; "spent"
// is never typed in — it is always summed from the transactions below.
const SAMPLE_DATA = {
  family: {
    name: "The Whitfield Family",
    members: "Daniel & Sarah Whitfield, Emma (9) and Leo (6)",
    month: "November 2026",
    monthLabel: "Nov 2026",
    note: "One household, one shared budget. Every dollar below is real sample data for November 2026.",
  },
  planned: {
    housing: 1850, groceries: 720, utilities: 310, transport: 420,
    dining: 240, entertainment: 180, clothing: 150, healthcare: 260,
    education: 320, savings: 1400, misc: 145,
  },
  // 50/30/20 buckets: which categories count as needs, wants and savings.
  buckets: {
    needs: ["housing", "groceries", "utilities", "transport", "healthcare", "education"],
    wants: ["dining", "entertainment", "clothing", "misc"],
    savings: ["savings"],
  },
  transactions: [
    { id: 1, date: "2026-11-01", merchant: "Daniel Whitfield — Salary", category: "income", amount: 5200.00, note: "Monthly salary, paid 1st" },
    { id: 2, date: "2026-11-01", merchant: "Mortgage — First National Bank", category: "housing", amount: -1850.00, note: "Monthly mortgage payment" },
    { id: 3, date: "2026-11-01", merchant: "Transfer to Emergency Fund", category: "savings", amount: -400.00, note: "Automatic transfer on payday" },
    { id: 4, date: "2026-11-01", merchant: "Transfer to Vacation Fund", category: "savings", amount: -250.00, note: "Automatic transfer on payday" },
    { id: 5, date: "2026-11-01", merchant: "Transfer to Car Fund", category: "savings", amount: -300.00, note: "Automatic transfer on payday" },
    { id: 6, date: "2026-11-01", merchant: "Transfer to College Fund", category: "savings", amount: -350.00, note: "Automatic transfer on payday" },
    { id: 7, date: "2026-11-02", merchant: "GreenMart Supermarket", category: "groceries", amount: -186.40, note: "Weekly shop" },
    { id: 8, date: "2026-11-03", merchant: "City Power — Electricity", category: "utilities", amount: -96.40, note: "October usage" },
    { id: 9, date: "2026-11-03", merchant: "Piano Lessons — Emma", category: "education", amount: -140.00, note: "4 lessons, November" },
    { id: 10, date: "2026-11-04", merchant: "Shell — Fuel", category: "transport", amount: -52.30, note: "Family car, full tank" },
    { id: 11, date: "2026-11-05", merchant: "Sarah Whitfield — Freelance Design", category: "income", amount: 1150.00, note: "Brand project, client invoice 1042" },
    { id: 12, date: "2026-11-05", merchant: "Corner Pharmacy", category: "healthcare", amount: -38.60, note: "Prescriptions" },
    { id: 13, date: "2026-11-06", merchant: "Bella Italia Restaurant", category: "dining", amount: -64.50, note: "Friday family dinner" },
    { id: 14, date: "2026-11-07", merchant: "City Water — Water Bill", category: "utilities", amount: -52.15, note: "Quarterly water" },
    { id: 15, date: "2026-11-08", merchant: "StreamBundle — TV & Music", category: "entertainment", amount: -24.99, note: "Monthly subscription" },
    { id: 16, date: "2026-11-09", merchant: "GreenMart Supermarket", category: "groceries", amount: -142.75, note: "Weekly shop" },
    { id: 17, date: "2026-11-09", merchant: "Gift for Aunt Margaret", category: "misc", amount: -35.00, note: "Birthday present" },
    { id: 18, date: "2026-11-10", merchant: "NorthNet — Internet", category: "utilities", amount: -79.00, note: "Monthly fibre internet" },
    { id: 19, date: "2026-11-10", merchant: "Swimming Lessons — Leo", category: "education", amount: -85.00, note: "November term" },
    { id: 20, date: "2026-11-11", merchant: "Shell — Fuel", category: "transport", amount: -48.75, note: "Family car" },
    { id: 21, date: "2026-11-12", merchant: "Kids' Shoes — Shoe Barn", category: "clothing", amount: -72.40, note: "Emma's school shoes" },
    { id: 22, date: "2026-11-13", merchant: "Sushi House", category: "dining", amount: -58.20, note: "Date night" },
    { id: 23, date: "2026-11-14", merchant: "Metro Card Top-up", category: "transport", amount: -60.00, note: "Sarah's commute card" },
    { id: 24, date: "2026-11-15", merchant: "Movie Night — Cinema", category: "entertainment", amount: -38.00, note: "Family film, 4 tickets" },
    { id: 25, date: "2026-11-15", merchant: "Extra Transfer to Emergency Fund", category: "savings", amount: -100.00, note: "Leftover from freelance work" },
    { id: 26, date: "2026-11-16", merchant: "Fresh Foods Market", category: "groceries", amount: -168.20, note: "Weekly shop" },
    { id: 27, date: "2026-11-17", merchant: "Dentist — Family Check-up", category: "healthcare", amount: -120.00, note: "Emma & Leo check-up" },
    { id: 28, date: "2026-11-18", merchant: "Sarah Whitfield — Freelance Logo", category: "income", amount: 700.00, note: "Logo project, client invoice 1043" },
    { id: 29, date: "2026-11-18", merchant: "BP — Fuel", category: "transport", amount: -51.20, note: "Family car" },
    { id: 30, date: "2026-11-19", merchant: "Books & School Supplies", category: "education", amount: -52.30, note: "Workbooks and stationery" },
    { id: 31, date: "2026-11-20", merchant: "Pizza Night — Tony's", category: "dining", amount: -42.80, note: "Takeaway Friday" },
    { id: 32, date: "2026-11-21", merchant: "Mobile Plan — NorthTel", category: "utilities", amount: -45.00, note: "Family mobile plan" },
    { id: 33, date: "2026-11-21", merchant: "Plumber — Kitchen Tap Repair", category: "misc", amount: -85.00, note: "Leaking tap fixed" },
    { id: 34, date: "2026-11-22", merchant: "Board Game — Toy Store", category: "entertainment", amount: -46.50, note: "Family game night" },
    { id: 35, date: "2026-11-23", merchant: "GreenMart Supermarket", category: "groceries", amount: -154.60, note: "Weekly shop" },
    { id: 36, date: "2026-11-24", merchant: "Winter Jackets — Outlet Store", category: "clothing", amount: -118.00, note: "Two jackets for the kids" },
    { id: 37, date: "2026-11-25", merchant: "AutoCare — Car Service", category: "transport", amount: -145.00, note: "Annual service, family car" },
    { id: 38, date: "2026-11-26", merchant: "Concert Tickets — City Hall", category: "entertainment", amount: -58.00, note: "Two tickets, December show" },
    { id: 39, date: "2026-11-27", merchant: "Burger Joint", category: "dining", amount: -36.40, note: "Lunch out with the kids" },
    { id: 40, date: "2026-11-28", merchant: "Savings Account — Interest", category: "income", amount: 45.00, note: "November interest" },
    { id: 41, date: "2026-11-29", merchant: "Corner Deli", category: "groceries", amount: -58.90, note: "Top-up shop" },
  ],
  goals: [
    { id: "g1", name: "Emergency Fund", detail: "6 months of essential expenses, kept in a high-yield savings account", target: 12000, saved: 8450, monthly: 400, icon: "🛡️" },
    { id: "g2", name: "Family Beach Vacation", detail: "One week by the coast next summer — flights, stay and spending money", target: 3500, saved: 2150, monthly: 250, icon: "🏖️" },
    { id: "g3", name: "New Family Car", detail: "Replace the 2014 sedan with a reliable used SUV", target: 9000, saved: 3200, monthly: 300, icon: "🚙" },
    { id: "g4", name: "Kids' College Fund", detail: "A head start on Emma and Leo's education, invested monthly", target: 25000, saved: 6800, monthly: 350, icon: "🎓" },
  ],
  // June–October are the family's real past months; November is computed from
  // the transactions above (income $7,095.00, spending $5,706.34) so the chart
  // and the dashboard always agree.
  history: [
    { month: "Jun", income: 6980, spending: 5420 },
    { month: "Jul", income: 7120, spending: 5610 },
    { month: "Aug", income: 6850, spending: 5890 },
    { month: "Sep", income: 7240, spending: 5480 },
    { month: "Oct", income: 7010, spending: 5730 },
    { month: "Nov", income: 7095, spending: 5706.34 },
  ],
  tips: [
    { icon: "📋", title: "Plan meals on Sunday", text: "A 10-minute meal plan before the weekly shop cut our impulse buys. We spend about $95 less on groceries a month now — the list, not the shelf, decides what goes in the cart.", saving: 95 },
    { icon: "⏳", title: "The 24-hour rule", text: "Anything that is not a need waits a day before we buy it. In October that one rule stopped $210 of spending we would have regretted — most of it was still in the cart, forgotten, a week later.", saving: 210 },
    { icon: "✂️", title: "Audit subscriptions twice a year", text: "In September we found two streaming services and a magazine app nobody had opened in months. Cancelling them freed $31.98 a month — $384 a year — for the vacation fund.", saving: 31.98 },
    { icon: "💡", title: "Switch off and turn down", text: "LED bulbs in every room and the thermostat one degree lower in winter trimmed our power bill by about $28 a month. The kids now race to switch lights off — the winner picks Friday's dinner.", saving: 28 },
    { icon: "🥪", title: "Pack lunch three days a week", text: "Daniel takes lunch from home on Mondays, Wednesdays and Fridays instead of buying it near the office. That is roughly $132 a month back in the budget, and the food is better.", saving: 132 },
    { icon: "🔁", title: "Pay yourself first", text: "Savings leave the account the morning payday lands — $1,400 a month, before any spending happens. What we never see, we never miss, and the emergency fund grows on its own.", saving: 1400, movesToSavings: true },
  ],
};

// ---- derived figures: always computed, never typed twice ----

function totalIncome(data) {
  return data.transactions.filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
}

function totalSpending(data) {
  return data.transactions.filter((t) => t.amount < 0)
    .reduce((sum, t) => sum - t.amount, 0);
}

function spentByCategory(data) {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of data.transactions) {
    if (t.amount < 0) out[t.category] = (out[t.category] || 0) - t.amount;
  }
  return out;
}

function totalPlanned(data) {
  return Object.values(data.planned).reduce((a, b) => a + b, 0);
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function money0(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

// ---- state: load / save / reset (browser storage only) ----

function freshState() {
  return JSON.parse(JSON.stringify(SAMPLE_DATA));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.transactions) || !parsed.planned) return freshState();
    return parsed;
  } catch {
    return freshState();
  }
}

function saveState(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable: the site still works for this visit.
  }
}

function resetState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  return freshState();
}
