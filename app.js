let requestList = [];

async function loadData() {
  const container = document.getElementById("summary");
  container.innerHTML = "Loading CityPulse data...";

  const url =
    "https://data.boston.gov/api/3/action/datastore_search?resource_id=1a0b420d-99f1-4887-9851-990b2a5a6e17&limit=10000";

  const res = await fetch(url);
  const data = await res.json();

  const records = data.result.records;

  // CLEANING (Java-style strict filtering)
  requestList = records
    .filter(r =>
      r.open_dt &&
      r.closed_dt &&
      r.neighborhood &&
      r.neighborhood !== "null" &&
      r.neighborhood.trim() !== ""
    )
    .map(r => ({
      neighborhood: r.neighborhood,
      openDate: r.open_dt,
      closedDate: r.closed_dt
    }));

  container.innerHTML = "";
  renderDashboard();
  renderSummary();
  renderChart();
}

function calculateHours(openDate, closedDate) {
  const open = Date.parse(openDate);
  const closed = Date.parse(closedDate);

  if (isNaN(open) || isNaN(closed)) return -1;

  return (closed - open) / (1000 * 60 * 60);
}

function getStats() {
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

    result.push({
      name: n,
      avgHours: avg,
      count: stats[n].count,
      underservedScore: avg * Math.log(stats[n].count + 1)
    });
  }

  result.sort((a, b) => a.avgHours - b.avgHours);

  return result;
}

function renderDashboard() {
  const container = document.getElementById("output");
  container.innerHTML = "";

  const stats = getStats();

  stats.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div>
        <div class="rank">#${i + 1} ${s.name}</div>
        <div>${s.avgHours.toFixed(1)} hrs • ${s.count} tickets</div>
      </div>
      <div class="${s.avgHours > 72 ? "bad" : "good"}">
        Score: ${s.underservedScore.toFixed(1)}
      </div>
    `;

    container.appendChild(div);
  });
}

function renderSummary() {
  const stats = getStats();

  const avgCity =
    stats.reduce((sum, s) => sum + s.avgHours, 0) / stats.length;

  const summary = document.getElementById("summary");

  summary.innerHTML = `
    <b>${stats.length}</b> neighborhoods analyzed |
    Avg city response: <b>${avgCity.toFixed(1)} hrs</b>
  `;
}

function renderChart() {
  const stats = getStats().slice(0, 10);

  const ctx = document.getElementById("chart");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: stats.map(s => s.name),
      datasets: [{
        label: "Avg Response Time (hrs)",
        data: stats.map(s => s.avgHours)
      }]
    },
    options: {
      responsive: true
    }
  });
}

loadData();
