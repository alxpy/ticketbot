const pl = require("ps-free-proxy-list");

let source;

function init() {
  source = new pl.Source();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

async function getProxy() {
  const proxies = await source.load();
  const idx = getRandomInt(proxies.length);
  return proxies[idx];
}

module.exports = { getProxy, init };
