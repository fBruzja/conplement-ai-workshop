#!/usr/bin/env bash
# Mirrors agent context from the canonical .claude/ directory into .github/.
#
# NOTE — read this before assuming you need it:
#
#   Copilot CLI already reads .claude/skills/ directly. Officially supported project skill
#   directories are .github/skills, .claude/skills and .agents/skills. So SKILLS DO NOT NEED
#   SYNCING for Copilot CLI at all — they are portable as-is. The skills sync below exists
#   only for tools that look exclusively in .github/skills.
#
#   Agents and prompts genuinely differ: Copilot expects a .agent.md / .prompt.md suffix.
#   (Prompt files are an IDE-only feature — VS Code/JetBrains — and are ignored by Copilot CLI.)
#
# This whole script is a stopgap and a teaching exhibit. Prefer a plugin marketplace —
# both Claude Code and Copilot CLI support them — once more than one project needs the
# same skills.
#
# Usage: scripts/sync-context.sh

set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

sync() {
  local src="${root}/.claude/$1"
  local dst="${root}/.github/$2"

  [[ -d "${src}" ]] || return 0

  rm -rf "${dst}"
  mkdir -p "${dst}"
  cp -R "${src}/." "${dst}/"
  echo "synced .claude/$1 -> .github/$2"
}

# Renames <name>.md to <name>.<suffix>.md, which is what Copilot expects.
sync_suffixed() {
  local src="${root}/.claude/$1"
  local dst="${root}/.github/$2"
  local suffix="$3"

  [[ -d "${src}" ]] || return 0

  rm -rf "${dst}"
  mkdir -p "${dst}"
  for file in "${src}"/*.md; do
    [[ -e "${file}" ]] || continue
    local base
    base="$(basename "${file}" .md)"
    cp "${file}" "${dst}/${base}.${suffix}.md"
  done
  echo "synced .claude/$1 -> .github/$2 (*.${suffix}.md)"
}

sync skills skills
sync_suffixed agents agents agent
sync_suffixed commands prompts prompt

echo "done. review with: git status --short .github"
