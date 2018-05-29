const fs = require("fs");
const path = require("path");
const semver = require("semver");
const Module = require("module");

const DEBUG = !!process.env.DEBUG_REQUIRE_IMPROVED;

const debugLog = (...args) => {
  if (DEBUG) {
    console.error("[RI]", ...args);
  }
};

function findPackageJson(filePath) {
  filePath = path.dirname(filePath);
  while (filePath !== "/") {
    try {
      const pkgJsonPath = path.resolve(filePath, "package.json");
      const pkgJsonContent = fs.readFileSync(pkgJsonPath, "utf-8");
      debugLog("loaded package.json from", pkgJsonPath);
      return JSON.parse(pkgJsonContent);
    } catch (e) {
      if (e.code === "ENOENT") {
        filePath = path.dirname(filePath);
      }
      throw e;
    }
  }

  return filePath;
}

function findVersionInPackageJson(moduleName, pkj) {
  let type = null;
  let moduleVersion = null;

  if (pkj.dependencies && pkj.dependencies[moduleName]) {
    type = "dependencies";
    moduleVersion = pkj.dependencies[moduleName];
  } else if (pkj.devDependencies && pkj.devDependencies[moduleVersion]) {
    type = "devDependencies";
    moduleVersion = pkj.devDependencies[moduleName];
  } else {
    const err = new Error(
      `Cannot find module '${moduleName}'. Not mentioned in package.json.`
    );
    err.code = "MODULE_NOT_FOUND";
    throw err;
  }

  return { type, moduleVersion };
}

const getAvailableVersions = (moduleDirectory, moduleName) => {
  const modulePath = path.resolve(moduleDirectory, moduleName);
  try {
    return fs.readdirSync(modulePath);
  } catch (e) {
    return [];
  }
};

const resolveModuleName = (moduleDirectory, moduleName, moduleVersion) => {
  const possibleVersions = getAvailableVersions(moduleDirectory, moduleName);
  const resolvedVersion = semver.maxSatisfying(possibleVersions, moduleVersion);

  if (!resolvedVersion) {
    return null;
  }

  return path.resolve(moduleDirectory, `${moduleName}/${resolvedVersion}`);
};

module.exports = function improvedResolve(
  moduleDirectory,
  request,
  parent,
  isMain,
  packageJson // optional argument for testing purposes
) {
  if (request[0] !== "." && !path.isAbsolute(request)) {
    packageJson = packageJson || findPackageJson(parent.filename);
    const { moduleVersion } = findVersionInPackageJson(request, packageJson);

    const resolvedModulePath = resolveModuleName(
      moduleDirectory,
      request,
      moduleVersion
    );

    if (!resolvedModulePath) {
      const err = new Error(
        `Cannot find module '${request}' version ${moduleVersion}. No suitable version installed.`
      );
      err.code = "MODULE_NOT_FOUND";
      throw err;
    }

    const resolvedPath = Module._findPath(resolvedModulePath, [""], isMain);

    debugLog("Overridden built-in resolution, found:", resolvedPath);

    return resolvedPath;
  }

  return null;
};
