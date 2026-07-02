let requestList = [];

async function loadData() {
  const url = "https://data.boston.gov/api/3/action/datastore_search?resource_id=1a0b420d-99f1-4887-9851-990b2a5a6e17&limit=5000";

  const res = await fetch(url);
  const data = await res.json();

  const records = data.result.records;

  requestList = records
    .filter(r => r.open_dt && r.closed_dt)
    .map(r => ({
      neighborhood: r.neighborhood,
      openDate: r.open_dt,
      closedDate: r.closed_dt,
      type: r.type
    }));

  renderDashboard();
}

function calculateHours(openDate, closedDate) {
  try {
    const open = new Date(openDate);
    const closed = new Date(closedDate);
    return (closed - open) / (1000 * 60 * 60);
  } catch {
    return -1;
  }
}

function getNeighborhoodStats() {
  let stats = {};

  requestList.forEach(r => {
    const hours = calculateHours(r.openDate, r.closedDate);
    if (hours < 0) return;

    if (!stats[r.neighborhood]) {
      stats[r.neighborhood] = { total: 0, count: 0 };
    }

    stats[r.neighborhood].total += hours;
    stats[r.neighborhood].count += 1;
  });

  let result = [];

  for (let n in stats) {
    const avg = stats[n].total / stats[n].count;
    result.push({ name: n, avgHours: avg, count: stats[n].count });
  }

  result.sort((a, b) => a.avgHours - b.avgHours);

  return result;
}

function renderDashboard() {
  const container = document.getElementById("output");
  container.innerHTML = "";

  const stats = getNeighborhoodStats();

  stats.forEach((s, i) => {
    const div = document.createElement("div");
    div.innerHTML =
      `Rank ${i+1}: ${s.name} — ${s.avgHours.toFixed(1)} hrs (${s.count} tickets)`;
    container.appendChild(div);
  });
}

loadData();
