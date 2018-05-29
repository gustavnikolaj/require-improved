const Module = require("module");

const requireResolve = Module._resolveFilename;

module.exports = function isBuiltIn(moduleName) {
  try {
    return (
      // Calling the original Module_resolveFilename like this will cause
      // it to fast track through to failure except when it immediately
      // exits and returns the same string because it is a builtin.
      //
      // https://github.com/nodejs/node/blob/9ae658e362b24df8eff0afab1ccf762171bc88cd/lib/internal/modules/cjs/loader.js#L560-L599
      // line 561: If it is a built in, return identity immediately
      // line 567: If options paths is an array iterate through those paths (no
      //           iteration because the array is empty)
      // line 591: It calls out to Module._findPath which exists immediately
      //           when the paths list is empty leading us into the throw.

      requireResolve(moduleName, null, false, { paths: [] }) === moduleName
    );
  } catch (e) {
    return false;
  }
};
