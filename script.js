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

const ticker = document.getElementById("showTicker");

const sampleShows = [
  "Cincinnati Card Show — Cincinnati, OH — Apr 12",
  "Queen City Collectibles Expo — Mason, OH — Apr 20",
  "Dayton Sports Card Show — Dayton, OH — May 4",
  "Louisville Card Convention — Louisville, KY — May 18",
  "Columbus Trade Night & Show — Columbus, OH — Jun 1"
];

if (ticker) {
  const items = [...sampleShows, ...sampleShows]
    .map(show => `<span class="ticker-item">${show}</span>`)
    .join("");
  ticker.innerHTML = items;
}
