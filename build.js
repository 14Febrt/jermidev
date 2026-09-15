const fs = require("fs");
const CleanCSS = require("clean-css");
const { minify } = require("terser");
const { minify: minifyHtml } = require("html-minifier-terser");
async function run() {
  const css = fs.readFileSync("css/style.css", "utf8");
  const js = fs.readFileSync("js/main.js", "utf8");
  const html = fs.readFileSync("index.html", "utf8");
  fs.mkdirSync("dist/css", { recursive: true });
  fs.mkdirSync("dist/js", { recursive: true });
  for (const dir of ["img", "video"]) {
    fs.mkdirSync("dist/" + dir, { recursive: true });
    for (const f of fs.readdirSync(dir)) {
      if (f === ".gitkeep") continue;
      fs.copyFileSync(dir + "/" + f, "dist/" + dir + "/" + f);
    }
  }
  fs.writeFileSync("dist/css/style.css", new CleanCSS({ level: 2 }).minify(css).styles);
  const jsOut = await minify(js);
  fs.writeFileSync("dist/js/main.js", jsOut.code);
  fs.writeFileSync("dist/index.html", await minifyHtml(html, { collapseWhitespace: true, minifyCSS: true, minifyJS: true, removeComments: true, removeEmptyAttributes: true, removeRedundantAttributes: true, useShortDoctype: true }));
}
run();
