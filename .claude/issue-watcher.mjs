#!/usr/bin/env node
// issue-watcher.mjs — vigilante de issues: el disparador principal del flujo
// "SDD desde GitHub Issue" (spec 002-sdd-desde-issue).
//
// Corre en la máquina del dueño (npm run watch:issues). Cada 60 s consulta los
// issues abiertos con gh; los que no están en su registro de vistos abren una
// ventana nueva de PowerShell con Claude Code trabajando ese issue en
// autopilot. Una ventana por issue; el registro se persiste ANTES de lanzar
// (nunca ventanas duplicadas). Fail-open: si gh falla, anota y reintenta.
//
// Modos: --once (un ciclo y sale; útil para tarea programada y verificación)
//        --dry-run (imprime qué haría sin lanzar ventanas ni marcar vistos)
//
// Registro de vistos: .claude/.issue-watcher-seen.json (gitignored, local).
// Fallback complementario: .claude/issue-trigger.mjs (hook de SessionStart).

import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const POLL_MS = 60_000;
const MAX_ISSUES = 50;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJ_DIR = path.dirname(__dirname);
const SEEN_FILE = path.join(__dirname, ".issue-watcher-seen.json");

/** Issues abiertos cuyo número no está en el registro de vistos. */
export function computeNewIssues(seen, issues) {
  return issues.filter((i) => !seen.has(i.number));
}

/** Carga el registro de vistos; archivo ausente o corrupto → conjunto vacío. */
export function loadSeen(file) {
  try {
    if (!existsSync(file)) return new Set();
    const data = JSON.parse(readFileSync(file, "utf8"));
    return new Set(Array.isArray(data) ? data : []);
  } catch {
    return new Set();
  }
}

/** Persiste el registro de vistos (números ordenados). */
export function saveSeen(file, seen) {
  writeFileSync(file, JSON.stringify([...seen].sort((a, b) => a - b), null, 2));
}

function ghRun() {
  const cmd = `gh issue list --state open --json number,title,url --limit ${MAX_ISSUES}`;
  return spawnSync(cmd, { shell: true, encoding: "utf8", timeout: 15000 });
}

/** Issues abiertos vía gh; null ante cualquier fallo (fail-open, AC5).
 *  `run` inyectable para tests. */
export function listOpenIssues(run = ghRun) {
  const r = run();
  if (r.error || r.status !== 0 || !r.stdout) return null;
  try {
    const issues = JSON.parse(r.stdout);
    return Array.isArray(issues) ? issues : null;
  } catch {
    return null;
  }
}

/** Prompt de la sesión auto-abierta (AC6: `issue: N` en spec, `Closes #N` en PR).
 *  Sin comillas simples ni dobles: viaja dentro de un string de PowerShell. */
export function buildPrompt(n) {
  return [
    `Lee el issue #${n} de este repositorio con gh issue view ${n} --comments`,
    "y desarrolla esa feature completa en autopilot con el flujo SDD del",
    "harness: specify, plan, tasks, implement, verify y review, sin pedir",
    `autorizaciones. Registra issue: ${n} en el frontmatter de la spec y deja`,
    `el PR abierto con Closes #${n} en el cuerpo. No hagas merge.`,
  ].join(" ");
}

export function launchWindow(n) {
  // Defensa en profundidad: n llega del JSON de gh; si no fuera entero,
  // no es un número de issue válido y podría romper el quoting.
  if (!Number.isInteger(n)) return;
  // En PowerShell, una comilla simple dentro de un string single-quoted
  // se escapa doblándola.
  const safeDir = PROJ_DIR.replace(/'/g, "''");
  const psCommand =
    `Set-Location -LiteralPath '${safeDir}'; claude "${buildPrompt(n)}"`;
  const child = spawn(
    "powershell.exe",
    ["-NoExit", "-Command", psCommand],
    { detached: true, stdio: "ignore" },
  );
  // Un 'error' de spawn sin listener mata el proceso (Unhandled 'error'
  // event) — la spec exige que el vigilante nunca muera por un fallo.
  child.on("error", (err) => {
    console.log(
      `[${new Date().toISOString()}] spawn falló: ${err.message}; ` +
      `el issue queda visto y la ventana se recupera manualmente`,
    );
  });
  child.unref();
}

/** Un ciclo del vigilante. `deps` inyectable para tests (AC1, AC2, AC5). */
export function cycle(dryRun, deps = {}) {
  const {
    seenFile = SEEN_FILE,
    listIssues = () => listOpenIssues(),
    launch = launchWindow,
    log = console.log,
  } = deps;
  const issues = listIssues();
  if (issues === null) {
    log(`[${new Date().toISOString()}] gh no disponible; reintento`);
    return;
  }
  const seen = loadSeen(seenFile);
  const nuevos = computeNewIssues(seen, issues);
  if (nuevos.length === 0) {
    log(`[${new Date().toISOString()}] sin issues nuevos (${issues.length} abiertos)`);
    return;
  }
  for (const issue of nuevos) {
    if (dryRun) {
      log(
        `[${new Date().toISOString()}] DRY-RUN: abriría ventana para ` +
        `#${issue.number} ${issue.title} — ${issue.url}`,
      );
      continue;
    }
    // Marcar visto ANTES de lanzar: si la ventana falla, no se duplica después.
    seen.add(issue.number);
    saveSeen(seenFile, seen);
    launch(issue.number);
    log(
      `[${new Date().toISOString()}] ventana abierta para ` +
      `#${issue.number} ${issue.title} — ${issue.url}`,
    );
  }
}

function main() {
  const once = process.argv.includes("--once");
  const dryRun = process.argv.includes("--dry-run");
  console.log(
    `[${new Date().toISOString()}] vigilante activo (proyecto: ${PROJ_DIR}` +
    `${once ? ", --once" : ""}${dryRun ? ", --dry-run" : ""})`,
  );
  if (once) {
    cycle(dryRun);
    return;
  }
  cycle(dryRun);
  setInterval(() => cycle(dryRun), POLL_MS);
}

// Solo corre como script directo; la importación desde los tests no dispara el loop.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
