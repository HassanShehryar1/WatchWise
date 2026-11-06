const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w300";

const movieGrid = document.getElementById("movie-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const sectionTitle = document.getElementById("section-title");

async function fetchPopular() {
  const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await res.json();
  renderMovies(data.results);
}

async function searchTitles(query) {
  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  const filtered = data.results.filter(item => item.media_type === "movie" || item.media_type === "tv");
  renderMovies(filtered);
}

const detailsCache = new Map();

async function loadMovieDetails(card, itemId, mediaType) {
  if (detailsCache.has(itemId)) {
    applyDetails(card, detailsCache.get(itemId));
    return;
  }

  const res = await fetch(`${BASE_URL}/${mediaType}/${itemId}?api_key=${API_KEY}`);
  const data = await res.json();
  detailsCache.set(itemId, data);
  applyDetails(card, data);
}

function applyDetails(card, data) {
  const taglineEl = card.querySelector(".overlay-tagline");
  const descEl = card.querySelector(".overlay-desc");

  taglineEl.textContent = data.tagline || "";
  descEl.textContent = data.overview
    ? data.overview.split(". ")[0] + "."
    : "No description available.";
}

function formatDate(dateStr) {
  if (!dateStr) return "Release date unknown";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function renderMovies(movies) {
  movieGrid.innerHTML = "";

  if (movies.length === 0) {
    movieGrid.innerHTML = "<p>No results found.</p>";
    return;
  }

  movies.forEach(item => {
    const mediaType = item.media_type || "movie";
    const displayTitle = item.title || item.name;
    const displayDate = item.release_date || item.first_air_date;

    const card = document.createElement("div");
    card.className = "movie-card";

    const posterPath = item.poster_path
      ? `${IMG_URL}${item.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Image";

    card.innerHTML = `
      <img src="${posterPath}" alt="${displayTitle}">
      <div class="info">
        <h3>${displayTitle}</h3>
        <p>${displayDate ? displayDate.slice(0, 4) : "N/A"}</p>
      </div>
      <div class="movie-overlay">
        <h3>${displayTitle}</h3>
        <p class="overlay-date">${formatDate(displayDate)}</p>
        <p class="overlay-tagline">Loading...</p>
        <p class="overlay-desc"></p>
      </div>
    `;

    card.addEventListener("mouseenter", () => {
      loadMovieDetails(card, item.id, mediaType);
    }, { once: true });

    card.addEventListener("click", () => {
      window.location.href = `detail.html?type=${mediaType}&id=${item.id}`;
    });

    movieGrid.appendChild(card);
  });
}

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (query) {
    sectionTitle.textContent = `Results for "${query}"`;
    searchMovies(query);
  } else {
    sectionTitle.textContent = "Popular Movies";
    fetchPopular();
  }
});

fetchPopular();