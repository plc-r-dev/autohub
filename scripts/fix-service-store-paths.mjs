import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("apps/web");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", "lib/generated"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

// Rename files: merchant-* -> service-store-*, serviceStore-* doesn't exist as files yet
const files = walk(ROOT);
for (const file of files) {
  const dir = path.dirname(file);
  const base = path.basename(file);
  let newBase = base;
  if (base.includes("merchant-")) {
    newBase = base.replace(/merchant-/g, "service-store-");
  }
  if (newBase !== base) {
    const target = path.join(dir, newBase);
    if (!fs.existsSync(target)) {
      fs.renameSync(file, target);
      console.log(`Renamed ${base} -> ${newBase}`);
    }
  }
}

// Fix import paths serviceStore- -> service-store-
const textFiles = walk(ROOT).filter((f) => /\.(ts|tsx)$/.test(f));
for (const file of textFiles) {
  let content = fs.readFileSync(file, "utf8");
  const updated = content.replace(/serviceStore-/g, "service-store-");
  if (updated !== content) {
    fs.writeFileSync(file, updated);
  }
}

// Fix featured-merchants -> featured-service-stores if exists
const featuredOld = path.join(ROOT, "components/customer/featured-merchants.tsx");
const featuredNew = path.join(ROOT, "components/customer/featured-service-stores.tsx");
if (fs.existsSync(featuredOld) && !fs.existsSync(featuredNew)) {
  fs.renameSync(featuredOld, featuredNew);
}

// browse [merchantId] -> [serviceStoreId]
const browseOld = path.join(ROOT, "app/(customer)/browse/[merchantId]");
const browseNew = path.join(ROOT, "app/(customer)/browse/[serviceStoreId]");
if (fs.existsSync(browseOld) && !fs.existsSync(browseNew)) {
  fs.renameSync(browseOld, browseNew);
}

const browseOld2 = path.join(ROOT, "app/browse/[merchantId]");
const browseNew2 = path.join(ROOT, "app/browse/[serviceStoreId]");
if (fs.existsSync(browseOld2) && !fs.existsSync(browseNew2)) {
  fs.renameSync(browseOld2, browseNew2);
}

console.log("File renames and import fixes done");
