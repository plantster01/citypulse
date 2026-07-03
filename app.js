const API_URL =
  "https://data.boston.gov/api/3/action/datastore_search?resource_id=1a0b420d-99f1-4887-9851-990b2a5a6e17&limit=10000";
const RECORD_LIMIT = 10000;
const MIN_TICKETS_PER_NEIGHBORHOOD = 25;

const NEIGHBORHOOD_ALIASES = {
  "allston / brighton": "Allston/Brighton",
  "allston/brighton": "Allston/Brighton",
  "allston": "Allston",
  "back bay": "Back Bay",
  "bay village": "Bay Village",
  "beacon hill": "Beacon Hill",
  "brighton": "Brighton",
  "charlestown": "Charlestown",
  "chinatown": "Chinatown",
  "dorchester": "Dorchester",
  "downtown": "Downtown",
  "east boston": "East Boston",
  "fenway": "Fenway",
  "hyde park": "Hyde Park",
  "jamaica plain": "Jamaica Plain",
  "leather district": "Leather District",
  "longwood": "Longwood",
  "mattapan": "Mattapan",
  "mission hill": "Mission Hill",
  "north end": "North End",
  "roslindale": "Roslindale",
  "roxbury": "Roxbury",
  "south boston": "South Boston",
  "south boston waterfront": "South Boston Waterfront",
  "south end": "South End",
  "west end": "West End",
  "west roxbury": "West Roxbury"
};

const state = {
  requests: [],
  neighborhoods: [],
  excludedNeighborhoods: [],
  sortSlowestFirst: false,
  searchTerm: "",
  targetHours: 72
};

const els = {
  recordLimit: document.querySelector("#record-limit"),
  totalNeighborhoods: document.querySelector("#total-neighborhoods"),
  cityAverage: document.querySelector("#city-average"),
  fastestArea: document.querySelector("#fastest-area"),
  rankingBody: document.querySelector("#ranking-body"),
  statsList: document.querySelector("#stats-list"),
  typeList: document.querySelector("#type-list"),
  sortToggle: document.querySelector("#sort-toggle"),
  search: document.querySelector("#neighborhood-search"),
  targetSlider: document.querySelector("#target-slider"),
  targetLabel: document.querySelector("#target-label"),
  simSummary: document.querySelector("#sim-summary"),
  simResults: document.querySelector("#sim-results")
};

function normalizeNeighborhood(value) {
  if (!value) {
    return "null";
  }

  const cleaned = String(value).replace(/\s+/g, " ").trim();
  const key = cleaned.toLowerCase();
  return NEIGHBORHOOD_ALIASES[key] || "null";
}

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

  const allNeighborhoods = Array.from(grouped.values()).map((entry) => ({
      neighborhood: entry.neighborhood,
      avgHours: roundTenths(entry.totalHours / entry.count),
      avgDays: roundTenths(entry.totalHours / entry.count / 24),
      count: entry.count
    }));

  state.excludedNeighborhoods = allNeighborhoods
    .filter((entry) => entry.count < MIN_TICKETS_PER_NEIGHBORHOOD)
    .sort((a, b) => a.neighborhood.localeCompare(b.neighborhood));

  return allNeighborhoods.filter((entry) => entry.count >= MIN_TICKETS_PER_NEIGHBORHOOD);
}

function parseRecords(records) {
  return records
    .map((record) => {
      const neighborhood = normalizeNeighborhood(getField(record, ["neighborhood"]));
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

  els.recordLimit.textContent = RECORD_LIMIT.toLocaleString();
  els.totalNeighborhoods.textContent = state.neighborhoods.length.toLocaleString();
  els.cityAverage.textContent = `${formatTenths(cityAvg)} hrs / ${formatTenths(cityAvg / 24)} days`;
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
          <td class="neighborhood-name">${entry.neighborhood}</td>
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
          <span>${entry.count} issues | ${formatTenths(entry.avgDays)} days (${formatTenths(entry.avgHours)} hours)</span>
        </article>
      `
    )
    .join("") +
    state.excludedNeighborhoods
      .map(
        (entry) => `
          <article class="stat-item muted-stat">
            <span>${entry.neighborhood}</span>
            <span>Excluded: ${entry.count} tickets, below ${MIN_TICKETS_PER_NEIGHBORHOOD} minimum</span>
          </article>
        `
      )
      .join("");
}

function renderRequestTypes() {
  const counts = new Map();

  state.requests.forEach((request) => {
    const type = request.type && request.type !== "null" ? request.type : "Unknown";
    counts.set(type, (counts.get(type) || 0) + 1);
  });

  const topTypes = Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type))
    .slice(0, 6);

  if (!topTypes.length) {
    els.typeList.innerHTML = `<p>No request types available.</p>`;
    return;
  }

  const maxCount = topTypes[0].count;
  els.typeList.innerHTML = topTypes
    .map((entry) => {
      const width = Math.max(8, Math.round((entry.count / maxCount) * 100));
      return `
        <article class="type-item">
          <div>
            <strong>${entry.type}</strong>
            <span>${entry.count.toLocaleString()} tickets</span>
          </div>
          <div class="type-bar" aria-hidden="true">
            <span style="width: ${width}%"></span>
          </div>
        </article>
      `;
    })
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
      const overByDays = roundTenths(overBy / 24);
      return `
        <article class="result-item ${didPass ? "pass" : "fail"}">
          <span>${didPass ? "Yes" : "No"}: ${entry.neighborhood}</span>
          <span>
            ${formatTenths(entry.avgHours)} hrs / ${formatTenths(entry.avgDays)} days avg${didPass ? "" : `, over by ${formatTenths(overBy)} hrs / ${formatTenths(overByDays)} days`}
          </span>
        </article>
      `;
    })
    .join("");
}

function renderAll() {
  updateSliderBounds();
  renderSnapshot();
  renderRankings();
  renderRawStats();
  renderRequestTypes();
  renderSimulator();
}

function updateSliderBounds() {
  if (!state.neighborhoods.length) {
    return;
  }

  const averages = state.neighborhoods.map((entry) => entry.avgHours);
  const minHours = Math.floor(Math.min(...averages));
  const maxHours = Math.ceil(Math.max(...averages));
  const startingTarget = Math.min(Math.max(72, minHours), maxHours);

  els.targetSlider.min = String(minHours);
  els.targetSlider.max = String(maxHours);
  els.targetSlider.value = String(startingTarget);
  state.targetHours = startingTarget;
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
    renderAll();
  } catch (error) {
    els.rankingBody.innerHTML = `<tr><td colspan="5">Could not load Boston 311 data. Try refreshing the page later.</td></tr>`;
    els.statsList.innerHTML = `<p>Could not load neighborhood statistics.</p>`;
    els.typeList.innerHTML = `<p>Could not load request types.</p>`;
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
