const BASE_URL = "https://api.themoviedb.org/3";

async function tmdb(path) {
  const separator = path.includes("?") ? "&" : "?";
  const res = await fetch(`${BASE_URL}${path}${separator}api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
  return res.json();
}
