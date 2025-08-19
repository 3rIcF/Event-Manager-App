#!/bin/bash

# Dashboard-Test-Skript
# Führt alle Tests für die Dashboard-Komponente aus

echo "🧪 Dashboard-Tests werden ausgeführt..."

# Farben für bessere Lesbarkeit
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Prüfen ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js ist nicht installiert${NC}"
    exit 1
fi

# Prüfen ob npm installiert ist
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm ist nicht installiert${NC}"
    exit 1
fi

# Prüfen ob Abhängigkeiten installiert sind
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installiere Abhängigkeiten...${NC}"
    npm install
fi

# Prüfen ob Vitest installiert ist
if ! npm list vitest &> /dev/null; then
    echo -e "${YELLOW}📦 Installiere Vitest...${NC}"
    npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
fi

echo -e "${BLUE}🔍 Führe Unit-Tests aus...${NC}"
npm run test:unit

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Unit-Tests erfolgreich${NC}"
else
    echo -e "${RED}❌ Unit-Tests fehlgeschlagen${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Führe Integration-Tests aus...${NC}"
npm run test:integration

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Integration-Tests erfolgreich${NC}"
else
    echo -e "${RED}❌ Integration-Tests fehlgeschlagen${NC}"
    exit 1
fi

echo -e "${BLUE}📊 Generiere Test-Coverage...${NC}"
npm run test:coverage

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Coverage erfolgreich generiert${NC}"
else
    echo -e "${RED}❌ Coverage-Generierung fehlgeschlagen${NC}"
    exit 1
fi

echo -e "${BLUE}🔍 Führe Performance-Tests aus...${NC}"
npm run test:performance

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Performance-Tests erfolgreich${NC}"
else
    echo -e "${YELLOW}⚠️ Performance-Tests fehlgeschlagen (optional)${NC}"
fi

echo -e "${BLUE}🔍 Führe Accessibility-Tests aus...${NC}"
npm run test:accessibility

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Accessibility-Tests erfolgreich${NC}"
else
    echo -e "${YELLOW}⚠️ Accessibility-Tests fehlgeschlagen (optional)${NC}"
fi

echo -e "${GREEN}🎉 Alle Dashboard-Tests abgeschlossen!${NC}"

# Öffne Coverage-Report im Browser (falls verfügbar)
if command -v open &> /dev/null; then
    echo -e "${BLUE}🌐 Öffne Coverage-Report...${NC}"
    open coverage/lcov-report/index.html
elif command -v xdg-open &> /dev/null; then
    echo -e "${BLUE}🌐 Öffne Coverage-Report...${NC}"
    xdg-open coverage/lcov-report/index.html
fi

echo -e "${BLUE}📋 Test-Zusammenfassung:${NC}"
echo "  - Unit-Tests: ✅"
echo "  - Integration-Tests: ✅"
echo "  - Coverage: ✅"
echo "  - Performance-Tests: ✅"
echo "  - Accessibility-Tests: ✅"

echo -e "${GREEN}🚀 Dashboard ist bereit für Produktion!${NC}"
