let cfg = null;
function initConfig(path) {
  if (!path) {
    throw new Error("no path for config specified");
  }
  cfg = require(path);
  return cfg;
}

function getConfig() {
  if (!cfg) {
    throw new Error("no initConfig was called");
  }
  return cfg;
}

module.exports = { getConfig, initConfig };
