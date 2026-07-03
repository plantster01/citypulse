const RECORD_LIMIT = 25000;
const MIN_TICKETS_PER_AREA = 25;
const MAX_RESOLUTION_HOURS = 24 * 30;

const BOSTON_AREA_ALIASES = {
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

const NYC_AREA_ALIASES = {
  "bronx": "Bronx",
  "brooklyn": "Brooklyn",
  "manhattan": "Manhattan",
  "queens": "Queens",
  "staten island": "Staten Island"
};

const SF_AREA_ALIASES = {};
const LA_AREA_ALIASES = {};

const CITY_CONFIGS = {
  boston: {
    name: "Boston",
    source: "Analyze Boston",
    apiUrl:
      "https://data.boston.gov/api/3/action/datastore_search?resource_id=1a0b420d-99f1-4887-9851-990b2a5a6e17&limit=25000",
    responseType: "ckan",
    areaAliases: BOSTON_AREA_ALIASES,
    areaFields: ["neighborhood"],
    openFields: ["open_dt", "open_date"],
    closedFields: ["closed_dt", "closed_date"],
    typeFields: ["type", "case_title", "reason"],
    contacts: [
      {
        title: "Boston 311",
        lines: ["boston.gov/311", "@Boston311"]
      },
      {
        title: "Boston City Council",
        lines: ["city.council@boston.gov", "617-635-4400"]
      },
      {
        title: "Mayor's Office of Neighborhood Services",
        lines: ["ons@boston.gov", "617-635-3485"]
      }
    ]
  },
  nyc: {
    name: "New York City",
    source: "NYC Open Data",
    apiUrl:
      "https://data.cityofnewyork.us/resource/erm2-nwe9.json?$limit=25000&$select=created_date,closed_date,complaint_type,borough&$where=closed_date%20IS%20NOT%20NULL%20AND%20borough%20IS%20NOT%20NULL&$order=closed_date%20DESC",
    responseType: "socrata",
    areaAliases: NYC_AREA_ALIASES,
    areaFields: ["borough"],
    openFields: ["created_date"],
    closedFields: ["closed_date"],
    typeFields: ["complaint_type"],
    contacts: [
      {
        title: "NYC 311",
        lines: ["portal.311.nyc.gov", "Call 311 in NYC"]
      },
      {
        title: "NYC Council",
        lines: ["council.nyc.gov", "Share borough-level evidence with your council member."]
      },
      {
        title: "Mayor's Community Affairs Unit",
        lines: ["nyc.gov/cau", "Use response data when raising service gaps."]
      }
    ]
  },
  sf: {
    name: "San Francisco",
    source: "DataSF",
    apiUrl:
      "https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=25000&$select=requested_datetime,updated_datetime,service_name,neighborhoods_sffind_boundaries,status_description&$where=updated_datetime%20IS%20NOT%20NULL%20AND%20neighborhoods_sffind_boundaries%20IS%20NOT%20NULL%20AND%20status_description%3D%27Closed%27&$order=updated_datetime%20DESC",
    responseType: "socrata",
    areaAliases: SF_AREA_ALIASES,
    allowUnmappedAreas: true,
    areaFields: ["neighborhoods_sffind_boundaries"],
    openFields: ["requested_datetime"],
    closedFields: ["updated_datetime"],
    typeFields: ["service_name"],
    contacts: [
      {
        title: "SF 311",
        lines: ["sf.gov/311", "Call 311 in San Francisco"]
      },
      {
        title: "San Francisco Board of Supervisors",
        lines: ["sfbos.org", "Share neighborhood-level evidence with your supervisor."]
      },
      {
        title: "Mayor's Office of Neighborhood Services",
        lines: ["sf.gov", "Use response data when raising service gaps."]
      }
    ]
  },
  la: {
    name: "Los Angeles",
    source: "LA Open Data",
    apiUrl:
      "https://data.lacity.org/resource/pvft-t768.json?$limit=25000",
    responseType: "socrata",
    areaAliases: LA_AREA_ALIASES,
    allowUnmappedAreas: true,
    numericAreaPrefix: "Council District",
    areaFields: [
      "nc_name",
      "neighborhood_council_name",
      "neighborhoodcouncilname",
      "neighborhood_council",
      "community",
      "community_name",
      "nc",
      "council_district",
      "councildistrict",
      "cd"
    ],
    openFields: ["createddate", "created_date", "created_dt", "open_date"],
    closedFields: ["closeddate", "closed_date", "updateddate", "updated_date"],
    typeFields: ["requesttype", "request_type", "srtype", "service_name"],
    contacts: [
      {
        title: "LA 311",
        lines: ["lacity.gov/myla311", "Call 311 in Los Angeles"]
      },
      {
        title: "Los Angeles City Council",
        lines: ["council.lacity.gov", "Share neighborhood-level evidence with your council district."]
      },
      {
        title: "Mayor's Help Desk",
        lines: ["mayor.lacity.gov", "Use response data when raising service gaps."]
      }
    ]
  }
};

const savedCityKey = localStorage.getItem("citypulseCity");

const state = {
  cityKey: CITY_CONFIGS[savedCityKey] ? savedCityKey : "boston",
  requests: [],
  neighborhoods: [],
  excludedNeighborhoods: [],
  sortSlowestFirst: false,
  searchTerm: "",
  targetHours: 72
};

const els = {
  citySelect: document.querySelector("#city-select"),
  selectedCity: document.querySelector("#selected-city"),
  dataSource: document.querySelector("#data-source"),
  recordLimit: document.querySelector("#record-limit"),
  totalNeighborhoods: document.querySelector("#total-neighborhoods"),
  cityAverage: document.querySelector("#city-average"),
  fastestArea: document.querySelector("#fastest-area"),
  rankingBody: document.querySelector("#ranking-body"),
  statsList: document.querySelector("#stats-list"),
  typeList: document.querySelector("#type-list"),
  contactGrid: document.querySelector("#contact-grid"),
  sortToggle: document.querySelector("#sort-toggle"),
  search: document.querySelector("#neighborhood-search"),
  targetSlider: document.querySelector("#target-slider"),
  targetLabel: document.querySelector("#target-label"),
  simSummary: document.querySelector("#sim-summary"),
  simResults: document.querySelector("#sim-results")
};

const hasDataViews = Boolean(
  els.totalNeighborhoods ||
  els.rankingBody ||
  els.typeList ||
  els.statsList ||
  els.simResults ||
  els.contactGrid
);

function currentCity() {
  return CITY_CONFIGS[state.cityKey];
}

function renderStaticCityStatus() {
  const city = currentCity();
  if (els.citySelect) els.citySelect.value = state.cityKey;
  if (els.dataSource) els.dataSource.textContent = city.source;
  if (els.recordLimit) els.recordLimit.textContent = RECORD_LIMIT.toLocaleString();
  if (els.selectedCity) els.selectedCity.textContent = city.name;
}

function normalizeArea(value, city) {
  if (!value) {
    return "null";
  }

  const cleaned = String(value).replace(/\s+/g, " ").trim();
  const key = cleaned.toLowerCase();
  if (city.numericAreaPrefix && /^\d+$/.test(cleaned)) {
    return `${city.numericAreaPrefix} ${Number(cleaned)}`;
  }
  return city.areaAliases[key] || (city.allowUnmappedAreas ? cleaned : "null");
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

function extractRecords(data, city) {
  if (city.responseType === "ckan") {
    return data?.result?.records || [];
  }
  return Array.isArray(data) ? data : [];
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
    .filter((entry) => entry.count < MIN_TICKETS_PER_AREA)
    .sort((a, b) => a.neighborhood.localeCompare(b.neighborhood));

  return allNeighborhoods.filter((entry) => entry.count >= MIN_TICKETS_PER_AREA);
}

function parseRecords(records, city) {
  return records
    .map((record) => {
      const neighborhood = normalizeArea(getField(record, city.areaFields), city);
      const openDate = getField(record, city.openFields);
      const closedDate = getField(record, city.closedFields);
      const type = getField(record, city.typeFields);
      const hours = calculateHoursToResolve(openDate, closedDate);

      return { neighborhood, openDate, closedDate, type, hours };
    })
    .filter(
      (request) =>
        request.hours >= 0 &&
        request.hours <= MAX_RESOLUTION_HOURS &&
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
  const city = currentCity();
  const totalHours = state.requests.reduce((sum, request) => sum + request.hours, 0);
  const cityAvg = state.requests.length ? roundTenths(totalHours / state.requests.length) : 0;
  const fastest = state.neighborhoods.slice().sort((a, b) => a.avgHours - b.avgHours)[0];

  if (els.dataSource) els.dataSource.textContent = city.source;
  if (els.selectedCity) els.selectedCity.textContent = city.name;
  if (els.recordLimit) els.recordLimit.textContent = RECORD_LIMIT.toLocaleString();
  if (els.totalNeighborhoods) els.totalNeighborhoods.textContent = state.neighborhoods.length.toLocaleString();
  if (els.cityAverage) els.cityAverage.textContent = `${formatTenths(cityAvg)} hrs / ${formatTenths(cityAvg / 24)} days`;
  if (els.fastestArea) els.fastestArea.textContent = fastest ? fastest.neighborhood : "--";
}

function renderRankings() {
  if (!els.rankingBody) {
    return;
  }

  const sorted = getSortedNeighborhoods();
  const fastestName = state.neighborhoods.slice().sort((a, b) => a.avgHours - b.avgHours)[0]?.neighborhood;
  const slowestName = state.neighborhoods.slice().sort((a, b) => b.avgHours - a.avgHours)[0]?.neighborhood;

  if (!sorted.length) {
    els.rankingBody.innerHTML = `<tr><td colspan="5">No areas match that filter.</td></tr>`;
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
  if (!els.statsList) {
    return;
  }

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
            <span>Excluded: ${entry.count} tickets, below ${MIN_TICKETS_PER_AREA} minimum</span>
          </article>
        `
      )
      .join("");
}

function renderRequestTypes() {
  if (!els.typeList) {
    return;
  }

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

function renderContacts() {
  if (!els.contactGrid) {
    return;
  }

  const city = currentCity();

  els.contactGrid.innerHTML = city.contacts
    .map(
      (contact) => `
        <article>
          <h3>${contact.title}</h3>
          ${contact.lines.map((line) => `<p>${line}</p>`).join("")}
        </article>
      `
    )
    .join("");
}

function renderSimulator() {
  if (!els.targetLabel || !els.simSummary || !els.simResults) {
    return;
  }

  const targetDays = roundTenths(state.targetHours / 24);
  const passing = state.neighborhoods.filter((entry) => entry.avgHours <= state.targetHours);
  const passRate = state.neighborhoods.length
    ? roundTenths((passing.length / state.neighborhoods.length) * 100)
    : 0;

  els.targetLabel.textContent = `${formatTenths(state.targetHours)} hours (${formatTenths(targetDays)} days)`;
  els.simSummary.textContent = `Pass Rate: ${passRate}% Passed (${passing.length}/${state.neighborhoods.length} areas)`;

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
  renderContacts();
  renderSimulator();
}

function updateSliderBounds() {
  if (!els.targetSlider || !state.neighborhoods.length) {
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

function renderLoading(city) {
  if (els.citySelect) els.citySelect.value = state.cityKey;
  if (els.dataSource) els.dataSource.textContent = city.source;
  if (els.selectedCity) els.selectedCity.textContent = city.name;
  if (els.recordLimit) els.recordLimit.textContent = RECORD_LIMIT.toLocaleString();
  if (els.totalNeighborhoods) els.totalNeighborhoods.textContent = "--";
  if (els.cityAverage) els.cityAverage.textContent = "--";
  if (els.fastestArea) els.fastestArea.textContent = "--";
  if (els.rankingBody) els.rankingBody.innerHTML = `<tr><td colspan="5">Loading ${city.name} rankings...</td></tr>`;
  if (els.statsList) els.statsList.innerHTML = `<p>Loading ${city.name} area statistics...</p>`;
  if (els.typeList) els.typeList.innerHTML = `<p>Loading ${city.name} request types...</p>`;
  renderContacts();
  if (els.simSummary) els.simSummary.textContent = "Waiting for live data...";
  if (els.simResults) els.simResults.innerHTML = "";
}

async function loadData() {
  const city = currentCity();
  renderLoading(city);

  try {
    const response = await fetch(city.apiUrl);
    if (!response.ok) {
      throw new Error(`${city.name} data request failed with status ${response.status}`);
    }

    const data = await response.json();
    const records = extractRecords(data, city);
    state.requests = parseRecords(records, city);
    state.neighborhoods = buildNeighborhoodStats(state.requests);
    renderAll();
  } catch (error) {
    if (els.rankingBody) els.rankingBody.innerHTML = `<tr><td colspan="5">Could not load ${city.name} 311 data. Try refreshing the page later.</td></tr>`;
    if (els.statsList) els.statsList.innerHTML = `<p>Could not load area statistics.</p>`;
    if (els.typeList) els.typeList.innerHTML = `<p>Could not load request types.</p>`;
    if (els.simSummary) els.simSummary.textContent = "Simulator unavailable until data loads.";
    console.error(error);
  }
}

if (els.citySelect) {
  renderStaticCityStatus();
  els.citySelect.addEventListener("change", (event) => {
    state.cityKey = event.target.value;
    state.searchTerm = "";
    localStorage.setItem("citypulseCity", state.cityKey);
    if (els.search) els.search.value = "";
    if (hasDataViews) {
      loadData();
    } else {
      renderStaticCityStatus();
    }
  });
}

if (els.sortToggle) {
  els.sortToggle.addEventListener("click", () => {
    state.sortSlowestFirst = !state.sortSlowestFirst;
    els.sortToggle.textContent = state.sortSlowestFirst ? "Fastest first" : "Slowest first";
    els.sortToggle.setAttribute("aria-pressed", String(state.sortSlowestFirst));
    renderRankings();
  });
}

if (els.search) {
  els.search.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim().toLowerCase();
    renderRankings();
  });
}

if (els.targetSlider) {
  els.targetSlider.addEventListener("input", (event) => {
    state.targetHours = Number(event.target.value);
    renderSimulator();
  });
}

if (hasDataViews) {
  loadData();
} else {
  renderStaticCityStatus();
}
