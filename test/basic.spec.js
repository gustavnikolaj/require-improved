const resolve = require("../lib/improved-resolve");
const { resolve: pathResolve } = require("path");

const projectRoot = pathResolve(__dirname, "..");
const moduleDirectory = pathResolve(projectRoot, "modules");

const expect = require("unexpected")
  .clone()
  .addAssertion("<object> to resolve to <string>", (expect, subject, value) => {
    const { request, packageJson, isMain = true } = subject;

    return expect(
      resolve(moduleDirectory, request, {}, isMain, packageJson),
      "to equal",
      pathResolve(projectRoot, value)
    );
  })
  .addAssertion("<object> not to be resolved", (expect, subject) => {
    const { request, packageJson, isMain = true } = subject;

    return expect(
      resolve(moduleDirectory, request, {}, isMain, packageJson),
      "to be null"
    );
  })
  .addAssertion(
    "<object> to reject resolution with error <any>",
    (expect, subject, value) => {
      const { request, packageJson, isMain = true } = subject;

      return expect(
        () => resolve(moduleDirectory, request, {}, isMain, packageJson),
        "to throw",
        value
      );
    }
  );

it("should load the foo module", () => {
  expect(
    {
      request: "foo",
      packageJson: {
        dependencies: {
          foo: "^1.0.0"
        }
      }
    },
    "to resolve to",
    "modules/foo/1.0.1/index.js"
  );
});

it("should not attempt to resolve a relative path", () => {
  expect({ request: "./foobar", packageJson: {} }, "not to be resolved");
});

it("should not allow loading foo from when it's not listed as a dependency", () => {
  expect(
    {
      request: "foo",
      packageJson: {}
    },
    "to reject resolution with error",
    "Cannot find module 'foo'. Not mentioned in package.json."
  );
});

it("should not allow loading foo from when it's listed in a missing version", () => {
  expect(
    {
      request: "foo",
      packageJson: {
        dependencies: {
          foo: "^10"
        }
      }
    },
    "to reject resolution with error",
    "Cannot find module 'foo' version ^10. No suitable version installed."
  );
});
