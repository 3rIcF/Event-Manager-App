#!/bin/bash

# Event Manager App - Test Runner Script
# Führt alle Unit-Tests aus und generiert Coverage-Reports

set -e

echo "🚀 Starte Event Manager App Tests..."

# Prüfe ob wir im richtigen Verzeichnis sind
if [ ! -f "package.json" ]; then
    echo "❌ Fehler: package.json nicht gefunden. Bitte führen Sie das Skript aus dem apps/api Verzeichnis aus."
    exit 1
fi

# Installiere Dependencies falls nötig
if [ ! -d "node_modules" ]; then
    echo "📦 Installiere Dependencies..."
    npm install
fi

# Führe Tests aus
echo "🧪 Führe Unit-Tests aus..."
npm run test:cov

# Zeige Coverage-Report
echo "📊 Coverage-Report:"
if [ -d "coverage" ]; then
    echo "HTML-Report: file://$(pwd)/coverage/index.html"
    echo "LCOV-Report: $(pwd)/coverage/lcov.info"
fi

# Führe Linting aus
echo "🔍 Führe Linting aus..."
npm run lint

# Führe Type-Checking aus
echo "🔍 Führe Type-Checking aus..."
npx tsc --noEmit

echo "✅ Alle Tests erfolgreich abgeschlossen!"
echo ""
echo "📋 Verfügbare Test-Befehle:"
echo "  npm run test          - Führe Tests aus"
echo "  npm run test:watch    - Tests im Watch-Modus"
echo "  npm run test:cov      - Tests mit Coverage"
echo "  npm run test:debug    - Tests im Debug-Modus"
echo "  npm run test:e2e      - End-to-End Tests"
echo ""
echo "📁 Test-Dateien:"
echo "  - Unit-Tests: src/**/*.spec.ts"
echo "  - Test-Utilities: src/test-utils/"
echo "  - Jest-Konfiguration: jest.config.js"
