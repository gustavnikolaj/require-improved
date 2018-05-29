// Modify require
require("./lib/irequire")(`${__dirname}/modules`);

const foo = require("foo");

console.log("foo", foo());
