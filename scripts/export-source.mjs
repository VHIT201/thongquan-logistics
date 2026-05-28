/**
 * Export all source files into a single Markdown file.
 * Usage: node scripts/export-source.mjs
 */
import fs from "fs"
import path from "path"

const ROOT = process.cwd()
const OUTPUT = path.join(ROOT, "source-export.md")

// Patterns to skip
const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "out",
  "dist",
  "build",
  "public",
  "scripts",
  "lib\\generated",
  "lib/generated",
])

const SKIP_FILES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "source-export.md",
  ".gitignore",
])

const EXT_ALLOW = new Set([".ts", ".tsx", ".css", ".json", ".mjs", ".js", ".md"])

function shouldSkipDir(dirPath) {
  const parts = dirPath.split(path.sep)
  for (const part of parts) {
    if (SKIP_DIRS.has(part)) return true
  }
  return false
}

function shouldSkipFile(filePath) {
  const base = path.basename(filePath)
  if (SKIP_FILES.has(base)) return true
  const ext = path.extname(base)
  if (!EXT_ALLOW.has(ext)) return true
  return false
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const relPath = path.relative(ROOT, fullPath)
    if (entry.isDirectory()) {
      if (!shouldSkipDir(relPath)) {
        yield* walk(fullPath)
      }
    } else {
      if (!shouldSkipFile(relPath)) {
        yield relPath
      }
    }
  }
}

const lines = []
lines.push(`# Logistics Platform – Source Export`)
lines.push(``)
lines.push(`Generated: ${new Date().toISOString()}`)
lines.push(``)
lines.push(`---`)
lines.push(``)

for (const relPath of walk(ROOT)) {
  const fullPath = path.join(ROOT, relPath)
  const content = fs.readFileSync(fullPath, "utf-8")
  const ext = path.extname(relPath).slice(1) || "text"
  lines.push(`## File: \`${relPath}\``)
  lines.push(``)
  lines.push(`\`\`\`${ext}`)
  lines.push(content)
  lines.push(`\`\`\``)
  lines.push(``)
  lines.push(`---`)
  lines.push(``)
}

fs.writeFileSync(OUTPUT, lines.join("\n"), "utf-8")
console.log(`✅ Exported to ${OUTPUT}`)
console.log(`   Total size: ${(fs.statSync(OUTPUT).size / 1024).toFixed(1)} KB`)
