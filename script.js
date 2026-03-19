function loadPartial(id, file, callback) {
  fetch(file)
    .then(response => response.text())
    .then(html => {
      const target = document.getElementById(id);
      if (target) {
        target.innerHTML = html;
        if (callback) callback();
      }
    })
    .catch(error => {
      console.error(`Error loading ${file}:`, error);
    });
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("nav a").forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPage) {
      link.classList.add("active");
    }
  });
}

loadPartial("header", "header.html", setActiveNavLink);
loadPartial("footer", "footer.html");

const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTozUI-utKd6SRMDi58wQ3SuY5wodkmPIx5MaxZj2VeP_7tv6rmflzqWxoBk-7wdZfjE6w5MAMu8WPL/pub?gid=0&single=true&output=csv";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function parseDateString(dateStr) {
  if (!dateStr) return null;

  const trimmed = String(dateStr).trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);

  const date = new Date(year, month, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateForDisplay(dateStr) {
  const date = parseDateString(dateStr);
  if (!date) return escapeHtml(dateStr);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function getTodayStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function normalizeYesNo(value) {
  return String(value || "").trim().toLowerCase();
}

function expandFutureDates(sheetRows) {
  const today = getTodayStart();
  const expanded = [];

  sheetRows.forEach(row => {
    const status = String(row["Status"] || "").trim().toLowerCase();
    if (status && status !== "live") return;

    const futureDatesCell = String(row["Future Show Dates"] || "").trim();
    if (!futureDatesCell) return;

    const splitDates = futureDatesCell
      .split(";")
      .map(date => date.trim())
      .filter(Boolean);

    splitDates.forEach(dateStr => {
      const parsedDate = parseDateString(dateStr);
      if (!parsedDate) return;
      if (parsedDate < today) return;

      expanded.push({
        showName: row["Show Name"] || "",
        city: row["City"] || "",
        state: row["State"] || "",
        address: row["Location / Address"] || "",
        showDateRaw: dateStr,
        showDateObj: parsedDate,
        promoter: row["Promoter / Host"] || "",
        tables: row["Size (# Tables)"] || "",
        mapLink: row["Map Link"] || "",
        sourceUrl: row["Source URL"] || "",
        tableCost: row["Table Size & Cost"] || "",
        vendorSignup: row["Vendor Signup Contact"] || "",
        vendorSetup: row["Vendor Setup Time"] || "",
        dealerTier: row["Dealer Size Tier"] || "",
        attending: row["Jungle Grails Attending"] || "",
        jungleStatus: row["Jungle Grails Status"] || "",
        jungleNotes: row["Jungle Grails Notes"] || ""
      });
    });
  });

  expanded.sort((a, b) => a.showDateObj - b.showDateObj);
  return expanded;
}

function fetchEventData() {
  return new Promise((resolve, reject) => {
    if (typeof Papa === "undefined") {
      reject(new Error("Papa Parse is not loaded."));
      return;
    }

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        const expanded = expandFutureDates(results.data || []);
        resolve(expanded);
      },
      error: function(error) {
        reject(error);
      }
    });
  });
}

function getAttendingEvents(rows) {
  return rows.filter(row => normalizeYesNo(row.attending) === "yes");
}

function renderTicker(events) {
  const ticker = document.getElementById("showTicker");
  if (!ticker) return;

  const attended = getAttendingEvents(events).slice(0, 6);

  if (!attended.length) {
    ticker.innerHTML = `<span class="ticker-item">No upcoming Jungle Grails appearances listed yet.</span>`;
    return;
  }

  const tickerItems = [...attended, ...attended]
    .map(event => {
      const text = `${escapeHtml(event.showName)} — ${escapeHtml(event.city)}, ${escapeHtml(event.state)} — ${formatDateForDisplay(event.showDateRaw)}`;
      return `<span class="ticker-item">${text}</span>`;
    })
    .join("");

  ticker.innerHTML = tickerItems;
}

document.addEventListener("DOMContentLoaded", () => {
  fetchEventData()
    .then(events => {
      renderTicker(events);
    })
    .catch(error => {
      console.error("Event data load error:", error);
      const ticker = document.getElementById("showTicker");
      if (ticker) {
        ticker.innerHTML = `<span class="ticker-item">Unable to load upcoming appearances right now.</span>`;
      }
    });
});
