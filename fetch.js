const fetch = require("npm-registry-fetch");
const semver = require("semver");
const tar = require("tar");
const { promisify } = require("util");
const mkdirp = promisify(require("mkdirp"));

async function getMetadata(packageName) {
  console.log("fetching metadata for %s", packageName);
  const res = await fetch(`/${packageName}`);
  return await res.json();
}

async function getMetadataForVersion(packageName, version) {
  console.error("fetching metadata for %s @ %s", packageName, version);
  const res = await fetch(`/${packageName}/${version}`);
  return await res.json();
}

async function scanPackage(packageName, semverVersion, packagesToInstall = []) {
  const metadata = await getMetadata(packageName);
  const versions = Object.keys(metadata.versions);
  const resolvedVersion = semver.maxSatisfying(versions, semverVersion);

  packagesToInstall.push({ name: packageName, version: resolvedVersion });

  const metadataForVersion = await getMetadataForVersion(
    packageName,
    resolvedVersion
  );

  if (metadataForVersion.dependencies) {
    for (const dependency of Object.keys(metadataForVersion.dependencies)) {
      await scanPackage(
        dependency,
        metadataForVersion.dependencies[dependency],
        packagesToInstall
      );
    }
  }

  return packagesToInstall;
}

async function untarStream(stream, cwd) {
  await mkdirp(cwd);
  return new Promise((resolve, reject) => {
    const untar = tar.x({
      strip: 1,
      cwd: cwd
    });

    stream.on("error", reject);
    untar.on("error", reject);

    untar.on("close", resolve);

    stream.pipe(untar);
  });
}

async function main() {
  const packagesToInstall = await scanPackage("unexpected", "^10.0.0");

  for (const { name, version } of packagesToInstall) {
    console.log("fetching %s@%s", name, version);
    const res = await fetch(`/${name}/-/${name}-${version}.tgz`);

    await untarStream(res.body, `real_world_modules/${name}/${version}`);
  }

  console.log(packagesToInstall);
}

main().then(
  () => console.error("Done."),
  err => {
    console.error(err);
    process.exit(1);
  }
);
