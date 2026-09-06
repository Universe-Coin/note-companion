const path = require("path");
const Metro = require("metro");

const mobileRoot = path.resolve(__dirname, "..");
process.chdir(mobileRoot);

(async () => {
  const config = await Metro.loadConfig({
    cwd: mobileRoot,
    config: path.join(mobileRoot, "metro.config.js"),
  });
  config.projectRoot = mobileRoot;
  await Metro.runBuild(config, {
    platform: "ios",
    entry: path.join(mobileRoot, "index.ts"),
    out: "/tmp/nc-ios-bundle/main.jsbundle",
    minify: true,
    dev: false,
    sourceMap: true,
  });
  console.log("wrote /tmp/nc-ios-bundle/main.jsbundle");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
