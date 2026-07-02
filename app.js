let requestList = [];
let sortAscending = true;

// PAGE NAV
function showPage(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// LOAD DATA (10,000 tickets)
async function loadData() {
  const url =
    "https://data.boston.gov/api/3/action/datastore_search?resource_id=1a0b420d-99f1-4887-9851-990b2a5a6e17&limit=10000";

  const res = await fetch(url);
  const data = await res.json();

  requestList = data.result.records
    .filter(r =>
      r.open_dt &&
      r.closed_dt &&
      r.neighborhood &&
      r.neighborhood !== "null"
    )
    .map(r => ({
      neighborhood: normalize(r.neighborhood),
      open: r.open_dt,
      close: r.closed_dt
    }));

  renderAll();
}

// CLEAN NAMES
function normalize(n) {
  n = n.toLowerCase();

  if (n.includes("allston") && n.includes("brighton")) return "Allston-Brighton";
  if (n.includes("fenway")) return "Fenway/Kenmore";
  if (n.includes("south boston")) return "South Boston";
  if (n.includes("jamaica plain")) return "Jamaica Plain";

  return n.split(" ").map(w => w[0]?.toUpperCase() + w.slice(1)).join(" ");
}

// TIME
function hours(open, close) {
  return (Date.parse(close) - Date.parse(open)) / 36e5;
}

// MEDIAN
function median(arr) {
  arr = arr.sort((a, b) => a - b);
  let m = Math.floor(arr.length / 2);
  return arr.length % 2 ? arr[m] : (arr[m - 1] + arr[m]) / 2;
}

// STATS
function getStats() {
  let map = {};

  requestList.forEach(r => {
    let h = hours(r.open, r.close);
    if (h < 0) return;

    if (!map[r.neighborhood]) map[r.neighborhood] = [];
    map[r.neighborhood].push(h);
  });

  let out = [];

  for (let n in map) {
    if (map[n].length < 10) continue;

    out.push({
      name: n,
      median: median(map[n]),
      count: map[n].length
    });
  }

  return out;
}

// DASHBOARD
function renderAll() {
  renderSummary();
  renderChart();
  renderRankings();
}

// SUMMARY
function renderSummary() {
  let stats = getStats();

  document.getElementById("summary").innerHTML = `
    <b>${stats.length}</b> neighborhoods analyzed (min 10 tickets)
  `;
}

// CHART
function renderChart() {
  let stats = getStats().slice(0, 10);

  new Chart(document.getElementById("chart"), {
    type: "bar",
    data: {
      labels: stats.map(s => s.name),
      datasets: [{
        label: "Median Hours",
        data: stats.map(s => s.median)
      }]
    }
  });
}

// RANKINGS
function renderRankings() {
  let stats = getStats();

  stats.sort((a, b) =>
    sortAscending ? a.median - b.median : b.median - a.median
  );

  let box = document.getElementById("rankingList");
  box.innerHTML = "";

  stats.forEach((s, i) => {
    let div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <div>#${i + 1} ${s.name}</div>
      <div>${s.median.toFixed(1)} hrs (${s.count})</div>
    `;

    box.appendChild(div);
  });
}

// TOGGLE SORT
function toggleSort() {
  sortAscending = !sortAscending;

  document.getElementById("sortBtn").innerText =
    sortAscending ? "Sort: Fastest → Slowest" : "Sort: Slowest → Fastest";

  renderRankings();
}

// SIMULATOR
function runSim() {
  let target = document.getElementById("slider").value;

  document.getElementById("sliderVal").innerText =
    target + " hours";

  let stats = getStats();

  let pass = 0;

  let res = document.getElementById("simResults");
  res.innerHTML = "";

  stats.forEach(s => {
    let ok = s.median <= target;

    if (ok) pass++;

    let div = document.createElement("div");
    div.className = "card";
    div.innerText =
      (ok ? "✔ " : "✖ ") + s.name + " — " + s.median.toFixed(1) + " hrs";

    res.appendChild(div);
  });

  document.getElementById("simSummary").innerText =
    `${pass}/${stats.length} neighborhoods meet target`;
}

// SLIDER LIVE UPDATE
document.addEventListener("input", e => {
  if (e.target.id === "slider") {
    document.getElementById("sliderVal").innerText =
      e.target.value + " hours";
  }
});

loadData();
