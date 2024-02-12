#!/bin/bash

echo "Triaging Vercel build ignore for $VERCEL_GIT_COMMIT_REF"

if [[ $VERCEL_GIT_COMMIT_REF =~ ^renovate ]]; then
  echo "Renovate bot commit, skipping build"
  exit 0;
else
  exit 1;
fi
