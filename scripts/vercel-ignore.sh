#!/bin/bash
# Vercel Ignored Build Step script.
# Returns exit code 0 → skip build, exit code 1 → proceed with build.
#
# Usage: ./scripts/vercel-ignore.sh <path1> [path2] ...
# Example: ./scripts/vercel-ignore.sh apps/admin packages/ui
#
# Vercel env vars used:
#   VERCEL_GIT_PREVIOUS_SHA  — SHA of the last successfully deployed commit
#   VERCEL_GIT_COMMIT_SHA    — SHA of the current commit being deployed

if [ $# -eq 0 ]; then
	echo "Error: no paths provided." >&2
	exit 1
fi

echo "=== vercel-ignore ==="
echo "Watched paths : $*"
echo "Current SHA   : ${VERCEL_GIT_COMMIT_SHA:-<not set>}"
echo "Previous SHA  : ${VERCEL_GIT_PREVIOUS_SHA:-<not set>}"
echo "Triggered by hook: ${TRIGGERED_BY_HOOK:-0}"

# When triggered via GitHub Actions API (issues/milestones sync) — always build.
if [ "${TRIGGERED_BY_HOOK}" = "1" ]; then
	echo "TRIGGERED_BY_HOOK=1 → proceeding with build."
	exit 1
fi

# On first deploy there is no previous SHA — always build.
if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ]; then
	echo "No previous SHA → proceeding with build."
	exit 1
fi

# Move to the repo root so that path arguments are always resolved correctly,
# regardless of which subdirectory Vercel runs this script from.
GIT_ROOT=$(git rev-parse --show-toplevel)
cd "$GIT_ROOT" || exit 1
echo "Repo root     : $GIT_ROOT"

# Vercel clones with sufficient depth for both SHAs to be available —
# no additional fetch is needed (origin remote does not exist in Vercel env).
git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "$VERCEL_GIT_COMMIT_SHA" -- "$@"
DIFF_EXIT=$?

echo "git diff exit code: $DIFF_EXIT"

if [ $DIFF_EXIT -eq 0 ]; then
	echo "No relevant changes → skipping build."
	exit 0
elif [ $DIFF_EXIT -eq 1 ]; then
	echo "Changes detected → proceeding with build."
	exit 1
else
	# git error (e.g. SHA not found after fetch) — build to be safe.
	echo "git diff failed (exit $DIFF_EXIT) → proceeding with build to be safe."
	exit 1
fi
