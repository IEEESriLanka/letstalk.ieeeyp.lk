import fs from "node:fs";
import path from "node:path";

function patchFile(filePath, searchStr, replaceStr) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  if (content.includes(searchStr)) {
    fs.writeFileSync(filePath, content.replaceAll(searchStr, replaceStr), "utf8");
    console.log(`[patch] Patched ${path.basename(filePath)}`);
  }
}

// 1. TanStack Router code-splitter: handle path containing apostrophes/single quotes
const routerSplitter = path.resolve(
  "node_modules/@tanstack/router-plugin/dist/esm/core/code-splitter/compilers.js",
);
patchFile(
  routerSplitter,
  "template.statement(`const ${splitNodeMeta.localImporterIdent} = () => import('${splitUrl}')`)()",
  "template.statement(`const ${splitNodeMeta.localImporterIdent} = () => import(${JSON.stringify(splitUrl)})`)()",
);

// 2. Nitro virtual polyfills: handle path containing apostrophes/single quotes
const nitroCommon = path.resolve("node_modules/nitro/dist/_build/common.mjs");
patchFile(
  nitroCommon,
  "return polyfills.map((p) => `import '${p}';`).join",
  "return polyfills.map((p) => `import ${JSON.stringify(p)};`).join",
);
