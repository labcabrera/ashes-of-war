#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  npm run create-release -- <version> [--no-finish]

Examples:
  npm run create-release -- 0.2.0
  npm run create-release -- v0.2.0 --no-finish

Creates a git-flow release, updates the npm package version, runs quality checks,
commits the version bump, and finishes the release unless --no-finish is provided.
USAGE
}

release_version="${1:-}"
finish_release="true"

if [[ -z "$release_version" || "$release_version" == "-h" || "$release_version" == "--help" ]]; then
  usage
  exit 0
fi

shift || true
for arg in "$@"; do
  case "$arg" in
    --no-finish)
      finish_release="false"
      ;;
    *)
      echo "Unknown option: $arg" >&2
      usage
      exit 1
      ;;
  esac
done

release_version="${release_version#v}"

if [[ ! "$release_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?(\+[0-9A-Za-z.-]+)?$ ]]; then
  echo "Invalid semantic version: $release_version" >&2
  exit 1
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command not found: $1" >&2
    exit 1
  fi
}

require_command git
require_command npm

if ! git flow version >/dev/null 2>&1; then
  echo "git-flow is required. Install git-flow and initialize this repository before creating a release." >&2
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree must be clean before creating a release." >&2
  exit 1
fi

git flow release start "$release_version"

npm version "$release_version" --no-git-tag-version
npm run lint
npm run test:run
npm run build

git add package.json package-lock.json
git commit -m "chore: prepare release v$release_version"

if [[ "$finish_release" == "true" ]]; then
  GIT_MERGE_AUTOEDIT=no git flow release finish -m "Release v$release_version" "$release_version"

  echo "Release v$release_version created."
  echo "Review the result and push the updated branches and tags:"
  echo "  git push origin develop main --tags"
else
  echo "Release branch created and version bump committed."
  echo "Finish it manually with:"
  echo "  git flow release finish -m \"Release v$release_version\" \"$release_version\""
fi
