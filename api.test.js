const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

function loadApi(response) {
  const urls = [];
  const context = {
    API_KEY: "KEY",
    fetch: async url => {
      urls.push(url);
      return response;
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "api.js"), "utf8"), context);
  return { tmdb: context.tmdb, urls };
}

test("adds the key to paths with and without a query", async () => {
  const { tmdb, urls } = loadApi({ ok: true, json: async () => ({ results: [] }) });
  await tmdb("/movie/popular");
  await tmdb("/search/multi?query=alien");
  assert.ok(urls[0].endsWith("/movie/popular?api_key=KEY"));
  assert.ok(urls[1].endsWith("/search/multi?query=alien&api_key=KEY"));
});

test("throws on an error response", async () => {
  const { tmdb } = loadApi({ ok: false, status: 401 });
  await assert.rejects(tmdb("/movie/popular"), /401/);
});
