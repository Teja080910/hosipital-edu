#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building Next.js client..."
npm run build

echo "==> Copying static chunks into standalone..."
rm -rf .next/standalone/.next/static
cp -r .next/static .next/standalone/.next/static

echo "==> Copying public/ into standalone (required for /_next/image optimizer)..."
rm -rf .next/standalone/public
cp -r public .next/standalone/public

echo "==> Restarting md-exam-client..."
pm2 restart md-exam-client --update-env

echo "==> Done."
