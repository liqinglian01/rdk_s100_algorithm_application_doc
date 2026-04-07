
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const version = process.argv[2];

if (!version) {
  console.error("❌ 请传入版本号，例如: npm run release -- 1.2.0");
  process.exit(1);
}

const versionLabel = `V${version}`;

const ROOT = process.cwd();
const VERSIONS_FILE = path.join(ROOT, "versions.json");

console.log(`\n🚀 开始发布版本: ${version}\n`);

/**
 * ✅ Step 0: 版本校验
 */
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error("❌ 版本号必须是 x.y.z 格式，例如 1.2.0");
  process.exit(1);
}

/**
 * 📚 读取已有版本
 */
let versions = [];
if (fs.existsSync(VERSIONS_FILE)) {
  versions = JSON.parse(fs.readFileSync(VERSIONS_FILE));
}

/**
 * 🚫 防重复
 */
if (versions.includes(version)) {
  console.error(`❌ 版本 ${version} 已存在`);
  process.exit(1);
}

console.log("✅ 版本校验通过\n");

/**
 * 📦 Step 1: 生成版本快照
 */
console.log("📦 生成版本快照...");
execSync(`npx docusaurus docs:version ${version}`, {
  stdio: "inherit",
});

/**
 * 📚 Step 2: 更新 versions.json
 */
console.log("📚 更新 versions.json...");

versions.unshift(version);

fs.writeFileSync(VERSIONS_FILE, JSON.stringify(versions, null, 2));

console.log("✅ versions.json:", versions);

/**
 * 🌍 Step 3: 生成 i18n
 */
console.log("🌍 生成 i18n 文件...");

const i18nBase = path.join(
  ROOT,
  "i18n/en/docusaurus-plugin-content-docs"
);

// current（最新）
fs.mkdirSync(path.join(i18nBase, "current"), { recursive: true });

fs.writeFileSync(
  path.join(i18nBase, "current/version.json"),
  JSON.stringify(
    {
      version: "current",
      label: versionLabel,
      banner: "none",
      badge: false,
    },
    null,
    2
  )
);

// 历史版本
const versionDir = path.join(i18nBase, `version-${version}`);
fs.mkdirSync(versionDir, { recursive: true });

fs.writeFileSync(
  path.join(versionDir, "version.json"),
  JSON.stringify(
    {
      version,
      label: versionLabel,
      banner: "unmaintained",
      badge: false,
    },
    null,
    2
  )
);

console.log("✅ i18n 完成");

/**
 * 🌍 Step 4: 英文下拉标签（Docusaurus 从 current.json / version-*.json 的 version.label 读取，不是 code.json）
 */
console.log("🌍 修复英文版本下拉文案（version.label）...");

function patchEnDocsTranslationVersionLabel(relPath, description) {
  const fullPath = path.join(ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️  跳过（不存在）: ${relPath}`);
    return;
  }
  const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));
  data["version.label"] = {
    message: versionLabel,
    description:
      description ?? `The label for version ${path.basename(relPath, ".json")}`,
  };
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + "\n");
}

patchEnDocsTranslationVersionLabel(
  "i18n/en/docusaurus-plugin-content-docs/current.json",
  "The label for version current"
);
patchEnDocsTranslationVersionLabel(
  `i18n/en/docusaurus-plugin-content-docs/version-${version}.json`,
  `The label for version ${version}`
);

console.log("✅ 英文 version.label 已更新");

/**
 * 🧹 清缓存（避免 Next 不更新）
 */
try {
  fs.rmSync(path.join(ROOT, ".docusaurus"), {
    recursive: true,
    force: true,
  });
  fs.rmSync(path.join(ROOT, "build"), {
    recursive: true,
    force: true,
  });
  console.log("🧹 已清理缓存");
} catch {}

console.log("\n🎉 发布完成！🚀\n");