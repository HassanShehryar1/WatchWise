const params = new URLSearchParams(window.location.search);
const mediaType = params.get("type");
const itemId = params.get("id");

const BACKDROP_URL = "https://image.tmdb.org/t/p/original";
const PROVIDER_ICON_URL = "https://image.tmdb.org/t/p/w45";

function showDetailError() {
  document.getElementById("detail-title").textContent = "Could not load this title.";
}

async function loadDetail() {
  if (!["movie", "tv"].includes(mediaType) || !/^\d+$/.test(itemId)) {
    showDetailError();
    return;
  }

  try {
    const data = await tmdb(`/${mediaType}/${itemId}`);
    renderDetail(data);
    loadProviders();
  } catch (err) {
    console.error(err);
    showDetailError();
  }
}

function renderDetail(data) {
  const title = data.title || data.name;
  const date = data.release_date || data.first_air_date;
  const year = date ? date.slice(0, 4) : "N/A";
  const runtime = data.runtime
    ? `${data.runtime} min`
    : data.episode_run_time?.[0]
    ? `${data.episode_run_time[0]} min/ep`
    : "";

  document.getElementById("detail-hero").style.backgroundImage =
    `url(${BACKDROP_URL}${data.backdrop_path})`;

  document.getElementById("detail-title").textContent = title;
  document.getElementById("detail-tagline").textContent = data.tagline || "";
  document.getElementById("detail-meta").textContent =
    `${year} • ${runtime} • ⭐ ${data.vote_average.toFixed(1)}`;
  document.getElementById("detail-overview").textContent = data.overview || "No description available.";
}

async function loadProviders() {
  const container = document.getElementById("detail-providers");

  let data;
  try {
    data = await tmdb(`/${mediaType}/${itemId}/watch/providers`);
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Could not load streaming information.</p>";
    return;
  }

  const region = data.results?.US; // change to your region code if needed

  if (!region || !region.flatrate) {
    container.innerHTML = "<p>Not currently streaming.</p>";
    return;
  }

  container.innerHTML = "<p>Streaming on:</p>";
  const list = document.createElement("div");
  list.className = "provider-list";

  region.flatrate.forEach(provider => {
    const img = document.createElement("img");
    img.src = `${PROVIDER_ICON_URL}${provider.logo_path}`;
    img.alt = provider.provider_name;
    img.title = provider.provider_name;
    list.appendChild(img);
  });

  container.appendChild(list);
}

loadDetail();