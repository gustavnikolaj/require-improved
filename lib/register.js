const defaultModulesPath = require("path").resolve(process.cwd(), "modules");
const modulesPath = process.env.MODULES_PATH || defaultModulesPath;

require("./require-improved")(modulesPath);
