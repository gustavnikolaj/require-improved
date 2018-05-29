// https://github.com/nodejs/node/blob/master/lib/internal/modules/cjs/loader.js

const Module = require("module");
const fs = require("fs");
const path = require("path");

function findPackageJson(filePath) {
  filePath = path.dirname(filePath);
  while (filePath !== "/") {
    try {
      const pkgJsonPath = path.resolve(filePath, "package.json");
      const pkgJsonContent = fs.readFileSync(pkgJsonPath, "utf-8");
      console.log("loaded package.json from", pkgJsonPath);
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

function checkPackage(packagePath) {
  try {
    fs.statSync(packagePath);
    return true;
  } catch (e) {
    return false;
  }
}

const resolveModuleName = (moduleDirectory, moduleName, moduleVersion) =>
  path.resolve(moduleDirectory, `${moduleName}/${moduleVersion}`);

module.exports = function modifyRequire(moduleDirectory) {
  const originalRequire = Module.prototype.require;

  Module.prototype.require = function(moduleName) {
    if (moduleName[0] !== ".") {
      const { dependencies, devDependencies } = findPackageJson(this.filename);

      if (dependencies[moduleName]) {
        const moduleVersion = dependencies[moduleName];
        const resolvedModuleName = resolveModuleName(
          moduleDirectory,
          moduleName,
          moduleVersion
        );

        if (!checkPackage(resolvedModuleName)) {
          throw new Error(
            `Package not installed ${moduleName} in version ${moduleVersion}`
          );
        }

        console.log("resolved", resolvedModuleName);

        return originalRequire.apply(this, [resolvedModuleName]);
      } else if (devDependencies[moduleName]) {
        throw new Error("Not yet implemented");
      } else {
        throw new Error("Not found in dependencies");
      }
    }

    return originalRequire.apply(this, arguments);
  };
};
