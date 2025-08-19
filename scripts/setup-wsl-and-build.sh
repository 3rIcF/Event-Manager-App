#!/usr/bin/env bash
set -euo pipefail

# Detect WSL
if grep -qi microsoft /proc/version 2>/dev/null; then
  echo "[info] Running inside WSL."
fi

ensure_nvm() {
  if [ ! -d "$HOME/.nvm" ]; then
    echo "[setup] Installing NVM..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  fi
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1090
  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
}

ensure_node() {
  if ! command -v node >/dev/null 2>&1; then
    echo "[setup] Installing Node.js LTS (v20)..."
    ensure_nvm
    nvm install 20
  fi
  ensure_nvm
  nvm use 20 >/dev/null
  echo "[ok] Node $(node -v)"
}

ensure_pnpm() {
  if ! command -v corepack >/dev/null 2>&1; then
    echo "[warn] corepack not found; ensure Node >= 16 is installed."
  fi
  echo "[setup] Enabling Corepack + pnpm@9..."
  corepack enable || true
  corepack prepare pnpm@9 --activate || true
  echo "[ok] pnpm $(pnpm -v)"
}

main() {
  ensure_node
  ensure_pnpm

  echo "[install] Installing workspace dependencies..."
  pnpm -w install

  echo "[build] Building API package..."
  pnpm --filter @elementaro/api build

  echo "[done] Build complete. You can start the API with:"
  echo "       pnpm --filter @elementaro/api start:dev"
}

main "$@"
