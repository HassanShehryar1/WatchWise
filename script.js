const IMG_URL = "https://image.tmdb.org/t/p/w300";

const movieGrid = document.getElementById("movie-grid");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const sectionTitle = document.getElementById("section-title");

function showLoadError(err) {
  console.error(err);
  movieGrid.innerHTML = "<p>Could not load titles. Please try again.</p>";
}

async function fetchPopular() {
  try {
    const data = await tmdb("/movie/popular");
    renderMovies(data.results);
  } catch (err) {
    showLoadError(err);
  }
}

async function searchTitles(query) {
  try {
    const data = await tmdb(`/search/multi?query=${encodeURIComponent(query)}`);
    const filtered = data.results.filter(item => item.media_type === "movie" || item.media_type === "tv");
    renderMovies(filtered);
  } catch (err) {
    showLoadError(err);
  }
}

const detailsCache = new Map();

async function loadMovieDetails(card, itemId, mediaType) {
  const cacheKey = `${mediaType}-${itemId}`;

  if (detailsCache.has(cacheKey)) {
    applyDetails(card, detailsCache.get(cacheKey));
    return;
  }

  try {
    const data = await tmdb(`/${mediaType}/${itemId}`);
    detailsCache.set(cacheKey, data);
    applyDetails(card, data);
  } catch (err) {
    console.error(err);
    card.querySelector(".overlay-tagline").textContent = "Could not load details.";
  }
}

function applyDetails(card, data) {
  const taglineEl = card.querySelector(".overlay-tagline");
  const descEl = card.querySelector(".overlay-desc");

  taglineEl.textContent = data.tagline || "";
  descEl.textContent = data.overview || "No description available.";
}

function formatDate(dateStr) {
  if (!dateStr) return "Release date unknown";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
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
      <img>
      <div class="info">
        <h3></h3>
        <p></p>
      </div>
      <div class="movie-overlay">
        <h3></h3>
        <p class="overlay-date"></p>
        <p class="overlay-tagline">Loading...</p>
        <p class="overlay-desc"></p>
      </div>
    `;

    const img = card.querySelector("img");
    img.src = posterPath;
    img.alt = displayTitle;
    card.querySelectorAll("h3").forEach(h3 => {
      h3.textContent = displayTitle;
    });
    card.querySelector(".info p").textContent = displayDate ? displayDate.slice(0, 4) : "N/A";
    card.querySelector(".overlay-date").textContent = formatDate(displayDate);

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
    searchTitles(query);
  } else {
    sectionTitle.textContent = "Popular Movies";
    fetchPopular();
  }
});

fetchPopular();