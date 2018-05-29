// Run as $ node -r ./lib/register.js example.js

const fs = require("fs"); // I can require built ins
const path = require("path");
const foo = require("foo");

const pkgJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "package.json"), "utf-8")
);

console.log("foo", foo());
console.log("This example is a", pkgJson.name);
