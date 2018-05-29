const isBuiltIn = require("../lib/isBuiltIn");
const expect = require("unexpected");

const builtIns = ["fs", "net", "http", "module"];

for (const builtIn of builtIns) {
  it(`should consider ${builtIn} a builtin`, () => {
    expect(isBuiltIn(builtIn), "to be true");
  });
}

const nonBuiltIns = ["foo", "express", "./foo/bar"];

for (const nonBuiltIn of nonBuiltIns) {
  it(`should NOT consider ${nonBuiltIn} a builtin`, () => {
    expect(isBuiltIn(nonBuiltIn), "to be false");
  });
}
