#!/usr/bin/env node
// scripts/build-oui-db.js
// Download IEEE MA-L, MA-M, MA-S registries and convert to a JSON db.
// CLI params:
//   --out <path>    Output file (default: ./data/oui-db.json)
//   --format <fmt>  Output format: json | txt (default: json)

import { writeFileSync } from "node:fs";
import { argv } from "node:process";
import https from "node:https";

// IEEE sources
const SOURCES = {
  MAL: "https://standards-oui.ieee.org/oui/oui.csv",
  MAM: "https://standards-oui.ieee.org/oui28/mam.csv",
  MAS: "https://standards-oui.ieee.org/oui36/oui36.csv",
};

// Defaults
let outPath = "./data/oui-db.json";
let format = "json";

// CLI overrides
for (let i = 2; i < argv.length; i++) {
  if (argv[i] === "--out" && argv[i + 1]) outPath = argv[++i];
  if (argv[i] === "--format" && argv[i + 1]) format = argv[++i];
}

// Helper: fetch URL → string
function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

// Parser: handles IEEE CSV format (MA-L/M/S)
function parseCsv(content) {
  const lines = content.split(/\r?\n/).slice(1); // skip header
  const map = new Map();

  for (const l of lines) {
    if (!l) continue;
    // Format: TYPE,ASSIGNMENT,"ORG NAME",ORG ADDRESS
    // orgName can be quoted or not, address is ignored
    let type, assignment, orgName;

    const match = l.match(/^(MA-[LMS]),([^,]+),"(.*?)",(.*)$/);
    if (match) {
      [, type, assignment, orgName] = match;
    } else {
      // fallback for lines without quotes in orgName
      const parts = l.split(",", 4);
      if (parts.length >= 3) {
        type = parts[0];
        assignment = parts[1];
        orgName = parts[2].replace(/"/g, "");
      } else continue;
    }

    let prefixLen = 0;
    if (type === "MA-L") prefixLen = 6; // 24 bits
    if (type === "MA-M") prefixLen = 7; // 28 bits
    if (type === "MA-S") prefixLen = 9; // 36 bits

    const hex = assignment.toUpperCase().replace(/[^0-9A-F]/g, "");

    // if (hex.length >= prefixLen) {
    //   map.set(hex.slice(0, prefixLen), orgName.trim());
    // }
    if (hex.length >= prefixLen) {
      const key = hex.slice(0, prefixLen);
      const normalized = key
      // const normalized = `${key.slice(0,2)}:${key.slice(2,4)}:${key.slice(4,6)}`;
      map.set(normalized, orgName.trim());
    }
    
  }
  return map;
}

async function main() {
  console.log("Fetching IEEE OUI registries...");
  const [mal, mam, mas] = await Promise.all([
    fetch(SOURCES.MAL),
    fetch(SOURCES.MAM),
    fetch(SOURCES.MAS),
  ]);

  const map = new Map([
    ...parseCsv(mal),
    ...parseCsv(mam),
    ...parseCsv(mas),
  ]);

  console.log(`Parsed ${map.size} entries total`);

  const obj = Object.fromEntries(map);
  const txt = [...map.entries()].map(([k, v]) => `${k}\t${v}`).join("\n");

  const base = outPath.replace(/\.[^.]+$/, "");

  // Always Write all output Formats
  writeFileSync(`${base}.json`, JSON.stringify(obj, null, 2));
  writeFileSync(`${base}.txt`, txt);
  console.log(`OUI DB written to ${base}.json`);
  console.log(`OUI DB written to ${base}.txt`);

  // Export
//   if (format === "json") {
//     const obj = Object.fromEntries(map);
//     writeFileSync(outPath, JSON.stringify(obj, null, 2));
//   } else if (format === "txt") {
//     const txt = [...map.entries()]
//       .map(([k, v]) => `${k}\t${v}`)
//       .join("\n");
//     writeFileSync(outPath, txt);
//   } else {
//     console.error("Unsupported format:", format);
//     process.exit(1);
//   }

//   console.log(`OUI DB written to ${outPath}`);
}

main().catch((err) => {
  console.error("Build OUI DB failed:", err);
  process.exit(1);
});
