#!/usr/bin/env bash
set -e

APP_DIR="/opt/cocktail-machine"
REPO_URL="$1"   # ex: https://github.com/TONUSER/Cocktail-machine.git
BRANCH="${2:-main}"

if [ -z "$REPO_URL" ]; then
  echo "Usage: ./deploy_rpi.sh <REPO_URL> [branch]"
  exit 1
fi

sudo mkdir -p "$APP_DIR"
sudo chown -R "$USER:$USER" "$APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  git clone -b "$BRANCH" "$REPO_URL" "$APP_DIR"
else
  cd "$APP_DIR"
  git fetch
  git checkout "$BRANCH"
  git pull
fi

cd "$APP_DIR/backend"
npm install --omit=dev

# (optionnel) build UI sur RPi si tu veux servir un build, sinon tu gardes Vite en dev
cd "$APP_DIR/ui"
npm install --omit=dev
npm run build

echo "Deployed in $APP_DIR"
