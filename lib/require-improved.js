// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js

const Module = require("module");
const resolve = require("./improved-resolve");

function modifyRequire(moduleDirectory) {
  const originalResolve = Module._resolveFilename;
  Module._resolveFilename = function requireImprovedResolveFilename(
    request,
    parent,
    isMain,
    options
  ) {
    const improvedResolution = resolve(
      moduleDirectory,
      request,
      parent,
      isMain
    );

    if (improvedResolution) {
      return improvedResolution;
    }

    return originalResolve.apply(this, arguments);
  };

  return function restoreOriginalRequire() {
    Module._resolveFilename = originalResolve;
  };
}

module.exports = modifyRequire;
