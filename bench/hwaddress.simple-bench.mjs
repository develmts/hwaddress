// Simple benchmark (no deps) running against the built output in dist/
// Usage: npm run build && node bench/hwaddress.simple-bench.mjs
// Or via script: "bench:simple": "npm run build && node bench/hwaddress.simple-bench.mjs"

import { performance } from "node:perf_hooks";
import { promises as fs } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

import { HwAddress } from "../dist/esm/index.js";
// import { HwAddress } from "../dist/hwaddress.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const resultsDir = join(__dirname, "results");

// Optional: capture git commit hash (ignore errors if not a git repo)
function gitHash() {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

const RUN_META = {
  timestamp: new Date().toISOString(),
  node: process.version,
  platform: `${process.platform}-${process.arch}`,
  commit: gitHash(),
};

// Collected results
const tasks = [];

/**
 * Run a micro-benchmark.
 * @param {string} label - task name
 * @param {() => void} fn - function to benchmark
 * @param {number} iters - measured iterations
 * @param {number} warmupIters - warmup iterations
 */
function run(label, fn, iters = 500_000, warmupIters = 20_000) {
  // Warmup (JIT, caches)
  for (let i = 0; i < warmupIters; i++) fn();

  const t0 = performance.now();
  for (let i = 0; i < iters; i++) fn();
  const t1 = performance.now();

  const totalMs = t1 - t0;
  const nsPerOp = (totalMs * 1e6) / iters;
  const opsPerSec = (iters / totalMs) * 1000;

  console.log(
    `${label.padEnd(34)}  ${iters.toString().padStart(9)} iters  ${totalMs
      .toFixed(1)
      .padStart(8)} ms   ${nsPerOp.toFixed(1).padStart(10)} ns/op   ${Math.round(
      opsPerSec
    )
      .toString()
      .padStart(7)} ops/s`
  );

  tasks.push({
    label,
    iters,
    totalMs: +totalMs.toFixed(3),
    nsPerOp: +nsPerOp.toFixed(1),
    opsPerSec: Math.round(opsPerSec),
  });
}

// Sample data
const canon48 = "99:88:77:66:55:44";
const packed48 = new Uint8Array([0x99, 0x88, 0x77, 0x66, 0x55, 0x44]);
const num48 = 0x998877665544;

const canon64 = "00:11:22:33:44:55:66:77";
const packed64 = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]);

console.log("=== hwaddress simple benchmark (no deps) ===");

// 48-bit tasks
run("new HwAddress(canon48)", () => {
  new HwAddress(canon48);
}, 200_000);
run("new HwAddress(packed48)", () => {
  new HwAddress(packed48);
}, 200_000);
run("new HwAddress(number48, 48)", () => {
  new HwAddress(num48, 48);
}, 200_000);

run("canonicalToPacked(48)", () => {
  HwAddress.canonicalToPacked(canon48, 48);
}, 500_000);
run("packedToCanonical(48)", () => {
  HwAddress.packedToCanonical(packed48);
}, 500_000);
run("canonToNumeric(48)", () => {
  HwAddress.canonToNumeric(canon48, 48);
}, 500_000);
run("packedToNumeric(48)", () => {
  HwAddress.packedToNumeric(packed48);
}, 500_000);

run("format('canonical')", () => {
  new HwAddress(canon48).format("canonical");
}, 300_000);
run("compareTo (a<b)", () => {
  const a = new HwAddress("00:00:00:00:00:01");
  const b = new HwAddress("00:00:00:00:00:02");
  a.compareTo(b);
}, 500_000);

// 64-bit samples
run("new HwAddress(canon64)", () => {
  new HwAddress(canon64);
}, 150_000);
run("canonicalToPacked(64)", () => {
  HwAddress.canonicalToPacked(canon64, 64);
}, 300_000);
run("packedToCanonical(64)", () => {
  HwAddress.packedToCanonical(packed64);
}, 300_000);

// Persist results (JSON + CSV)
const outBase = `hwaddress-bench-${RUN_META.timestamp.replace(/[:.]/g, "-")}`;
const jsonPath = join(resultsDir, `${outBase}.json`);
const csvPath = join(resultsDir, `${outBase}.csv`);

const json = { meta: RUN_META, tasks };
const csv = [
  "label,iters,totalMs,nsPerOp,opsPerSec,node,platform,commit,timestamp",
  ...tasks.map((t) =>
    [
      JSON.stringify(t.label),
      t.iters,
      t.totalMs,
      t.nsPerOp,
      t.opsPerSec,
      RUN_META.node,
      RUN_META.platform,
      RUN_META.commit,
      RUN_META.timestamp,
    ].join(",")
  ),
].join("\n");

await fs.mkdir(resultsDir, { recursive: true });
await fs.writeFile(jsonPath, JSON.stringify(json, null, 2), "utf8");
await fs.writeFile(csvPath, csv, "utf8");

console.log(`Saved: ${jsonPath}`);
console.log(`Saved: ${csvPath}`);
