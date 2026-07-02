const API_URL =
  "https://data.boston.gov/api/3/action/datastore_search?resource_id=1a0b420d-99f1-4887-9851-990b2a5a6e17&limit=2500";

const state = {
  requests: [],
  neighborhoods: [],
  sortSlowestFirst: false,
  searchTerm: "",
  targetHours: 72
};

const els = {
  loadStatus: document.querySelector("#load-status"),
  totalRequests: document.querySelector("#total-requests"),
  totalNeighborhoods: document.querySelector("#total-neighborhoods"),
  cityAverage: document.querySelector("#city-average"),
  fastestArea: document.querySelector("#fastest-area"),
  rankingBody: document.querySelector("#ranking-body"),
  statsList: document.querySelector("#stats-list"),
  sortToggle: document.querySelector("#sort-toggle"),
  search: document.querySelector("#neighborhood-search"),
  targetSlider: document.querySelector("#target-slider"),
  targetLabel: document.querySelector("#target-label"),
  simSummary: document.querySelector("#sim-summary"),
  simResults: document.querySelector("#sim-results")
};

function getField(record, names) {
  for (const name of names) {
    if (record[name] !== undefined && record[name] !== null && String(record[name]).trim() !== "") {
      return String(record[name]).trim();
    }
  }
  return "null";
}

function calculateHoursToResolve(openDate, closedDate) {
  const opened = new Date(openDate);
  const closed = new Date(closedDate);

  if (Number.isNaN(opened.getTime()) || Number.isNaN(closed.getTime())) {
    return -1;
  }

  const hours = (closed.getTime() - opened.getTime()) / (1000 * 60 * 60);
  return hours >= 0 ? hours : -1;
}

function roundTenths(value) {
  return Math.round(value * 10) / 10;
}

function formatTenths(value) {
  return Number(value).toFixed(1);
}

function buildNeighborhoodStats(requests) {
  const grouped = new Map();

  requests.forEach((request) => {
    if (!grouped.has(request.neighborhood)) {
      grouped.set(request.neighborhood, { neighborhood: request.neighborhood, totalHours: 0, count: 0 });
    }

    const entry = grouped.get(request.neighborhood);
    entry.totalHours += request.hours;
    entry.count += 1;
  });

  return Array.from(grouped.values())
    .filter((entry) => entry.count > 0)
    .map((entry) => ({
      neighborhood: entry.neighborhood,
      avgHours: roundTenths(entry.totalHours / entry.count),
      avgDays: roundTenths(entry.totalHours / entry.count / 24),
      count: entry.count
    }));
}

function parseRecords(records) {
  return records
    .map((record) => {
      const neighborhood = getField(record, ["neighborhood"]);
      const openDate = getField(record, ["open_dt", "open_date"]);
      const closedDate = getField(record, ["closed_dt", "closed_date"]);
      const type = getField(record, ["type", "case_title", "reason"]);
      const hours = calculateHoursToResolve(openDate, closedDate);

      return { neighborhood, openDate, closedDate, type, hours };
    })
    .filter(
      (request) =>
        request.hours >= 0 &&
        request.neighborhood !== "null" &&
        request.neighborhood.toLowerCase() !== "null"
    );
}

function getSortedNeighborhoods() {
  const direction = state.sortSlowestFirst ? -1 : 1;
  return state.neighborhoods
    .filter((entry) => entry.neighborhood.toLowerCase().includes(state.searchTerm))
    .slice()
    .sort((a, b) => {
      if (a.avgHours === b.avgHours) {
        return a.neighborhood.localeCompare(b.neighborhood);
      }
      return (a.avgHours - b.avgHours) * direction;
    });
}

function renderSnapshot() {
  const totalHours = state.requests.reduce((sum, request) => sum + request.hours, 0);
  const cityAvg = state.requests.length ? roundTenths(totalHours / state.requests.length) : 0;
  const fastest = state.neighborhoods.slice().sort((a, b) => a.avgHours - b.avgHours)[0];

  els.totalRequests.textContent = state.requests.length.toLocaleString();
  els.totalNeighborhoods.textContent = state.neighborhoods.length.toLocaleString();
  els.cityAverage.textContent = `${formatTenths(cityAvg)} hrs`;
  els.fastestArea.textContent = fastest ? fastest.neighborhood : "--";
}

function renderRankings() {
  const sorted = getSortedNeighborhoods();
  const fastestName = state.neighborhoods.slice().sort((a, b) => a.avgHours - b.avgHours)[0]?.neighborhood;
  const slowestName = state.neighborhoods.slice().sort((a, b) => b.avgHours - a.avgHours)[0]?.neighborhood;

  if (!sorted.length) {
    els.rankingBody.innerHTML = `<tr><td colspan="5">No neighborhoods match that filter.</td></tr>`;
    return;
  }

  els.rankingBody.innerHTML = sorted
    .map((entry, index) => {
      const className =
        entry.neighborhood === fastestName
          ? "fastest-row"
          : entry.neighborhood === slowestName
            ? "slowest-row"
            : "";

      return `
        <tr class="${className}">
          <td>${index + 1}</td>
          <td><strong>${entry.neighborhood}</strong></td>
          <td>${formatTenths(entry.avgHours)}</td>
          <td>${formatTenths(entry.avgDays)}</td>
          <td>${entry.count}</td>
        </tr>
      `;
    })
    .join("");
}

function renderRawStats() {
  const sorted = state.neighborhoods.slice().sort((a, b) => a.neighborhood.localeCompare(b.neighborhood));

  els.statsList.innerHTML = sorted
    .map(
      (entry) => `
        <article class="stat-item">
          <span>${entry.neighborhood}</span>
          <strong>${entry.count} issues | ${formatTenths(entry.avgDays)} days (${formatTenths(entry.avgHours)} hours)</strong>
        </article>
      `
    )
    .join("");
}

function renderSimulator() {
  const targetDays = roundTenths(state.targetHours / 24);
  const passing = state.neighborhoods.filter((entry) => entry.avgHours <= state.targetHours);
  const passRate = state.neighborhoods.length
    ? roundTenths((passing.length / state.neighborhoods.length) * 100)
    : 0;

  els.targetLabel.textContent = `${formatTenths(state.targetHours)} hours (${formatTenths(targetDays)} days)`;
  els.simSummary.textContent = `Pass Rate: ${passRate}% Passed (${passing.length}/${state.neighborhoods.length} neighborhoods)`;

  if (passRate >= 80) {
    els.simSummary.style.borderLeft = "6px solid var(--green)";
  } else if (passRate >= 50) {
    els.simSummary.style.borderLeft = "6px solid var(--amber)";
  } else {
    els.simSummary.style.borderLeft = "6px solid var(--red)";
  }

  els.simResults.innerHTML = state.neighborhoods
    .slice()
    .sort((a, b) => a.neighborhood.localeCompare(b.neighborhood))
    .map((entry) => {
      const didPass = entry.avgHours <= state.targetHours;
      const overBy = roundTenths(entry.avgHours - state.targetHours);
      return `
        <article class="result-item ${didPass ? "pass" : "fail"}">
          <strong>${didPass ? "Yes" : "No"}: ${entry.neighborhood}</strong>
          <span>
            ${formatTenths(entry.avgHours)} hrs avg${didPass ? "" : `, over by ${formatTenths(overBy)} hrs`}
          </span>
        </article>
      `;
    })
    .join("");
}

function renderAll() {
  renderSnapshot();
  renderRankings();
  renderRawStats();
  renderSimulator();
}

async function loadData() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Boston data request failed with status ${response.status}`);
    }

    const data = await response.json();
    const records = data?.result?.records || [];
    state.requests = parseRecords(records);
    state.neighborhoods = buildNeighborhoodStats(state.requests);
    els.loadStatus.textContent = `Loaded ${state.requests.length.toLocaleString()} valid records`;
    renderAll();
  } catch (error) {
    els.loadStatus.textContent = "Live data unavailable";
    els.rankingBody.innerHTML = `<tr><td colspan="5">Could not load Boston 311 data. Try refreshing the page later.</td></tr>`;
    els.statsList.innerHTML = `<p>Could not load neighborhood statistics.</p>`;
    els.simSummary.textContent = "Simulator unavailable until data loads.";
    console.error(error);
  }
}

els.sortToggle.addEventListener("click", () => {
  state.sortSlowestFirst = !state.sortSlowestFirst;
  els.sortToggle.textContent = state.sortSlowestFirst ? "Fastest first" : "Slowest first";
  els.sortToggle.setAttribute("aria-pressed", String(state.sortSlowestFirst));
  renderRankings();
});

els.search.addEventListener("input", (event) => {
  state.searchTerm = event.target.value.trim().toLowerCase();
  renderRankings();
});

els.targetSlider.addEventListener("input", (event) => {
  state.targetHours = Number(event.target.value);
  renderSimulator();
});

loadData();
