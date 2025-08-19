#!/bin/bash

# Event Manager Database Setup Script
# Dieses Skript richtet die Datenbank-Infrastruktur ein

echo "🚀 Event Manager Database Setup"
echo "================================"

# Prüfen ob Docker läuft
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker läuft nicht. Bitte starten Sie Docker und versuchen Sie es erneut."
    exit 1
fi

# Prüfen ob Docker Compose verfügbar ist
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose ist nicht installiert. Bitte installieren Sie Docker Compose."
    exit 1
fi

echo "✅ Docker und Docker Compose sind verfügbar"

# Datenbank-Container starten
echo ""
echo "📦 Starte Datenbank-Container..."
docker-compose up -d postgres redis minio

# Warten bis PostgreSQL bereit ist
echo ""
echo "⏳ Warte auf PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U event_user -d event_manager > /dev/null 2>&1; do
    echo "   PostgreSQL startet noch..."
    sleep 2
done
echo "✅ PostgreSQL ist bereit"

# Warten bis Redis bereit ist
echo ""
echo "⏳ Warte auf Redis..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo "   Redis startet noch..."
    sleep 2
done
echo "✅ Redis ist bereit"

# Warten bis MinIO bereit ist
echo ""
echo "⏳ Warte auf MinIO..."
until curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1; do
    echo "   MinIO startet noch..."
    sleep 2
done
echo "✅ MinIO ist bereit"

echo ""
echo "🎯 Alle Datenbank-Services sind bereit!"
echo ""
echo "📊 Zugangsdaten:"
echo "   PostgreSQL: localhost:5432 (event_user/event_password)"
echo "   Redis: localhost:6379"
echo "   MinIO: http://localhost:9001 (minioadmin/minioadmin)"
echo "   pgAdmin: http://localhost:5050 (admin@elementaro.com/admin123)"
echo ""
echo "🔧 Nächste Schritte:"
echo "   1. cd apps/api"
echo "   2. npm install"
echo "   3. npm run db:generate"
echo "   4. npm run db:push"
echo "   5. npm run db:seed"
echo ""
echo "✅ Setup abgeschlossen!"
