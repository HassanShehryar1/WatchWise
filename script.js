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

async function searchMovies(query) {
  const res = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
  const data = await res.json();
  renderMovies(data.results);
}

const detailsCache = new Map();

async function loadMovieDetails(card, movieId) {
  if (detailsCache.has(movieId)) {
    applyDetails(card, detailsCache.get(movieId));
    return;
  }

  const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
  const data = await res.json();
  detailsCache.set(movieId, data);
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

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const posterPath = movie.poster_path
      ? `${IMG_URL}${movie.poster_path}`
      : "https://via.placeholder.com/300x450?text=No+Image";

    card.innerHTML = `
  <img src="${posterPath}" alt="${movie.title}">
  <div class="info">
    <h3>${movie.title}</h3>
    <p>${movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}</p>
  </div>
  <div class="movie-overlay">
    <h3>${movie.title}</h3>
    <p class="overlay-date">${formatDate(movie.release_date)}</p>
    <p class="overlay-tagline">Loading...</p>
    <p class="overlay-desc"></p>
  </div>
`;

    movieGrid.appendChild(card);

    card.addEventListener("mouseenter", () => {
      loadMovieDetails(card, movie.id);
    }, { once: true });
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