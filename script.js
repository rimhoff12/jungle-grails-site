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