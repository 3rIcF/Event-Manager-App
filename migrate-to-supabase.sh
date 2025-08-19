#!/bin/bash

# Event Manager Migration zu Supabase
# Dieses Skript führt die Migration von lokaler Datenbank zu Supabase durch

echo "🚀 Event Manager Migration zu Supabase"
echo "====================================="

# Prüfen ob .env-Datei existiert
if [ ! -f "apps/api/.env" ]; then
    echo "❌ .env-Datei nicht gefunden!"
    echo "Bitte kopieren Sie env.supabase.example zu .env und konfigurieren Sie die Werte."
    exit 1
fi

# In das API-Verzeichnis wechseln
cd apps/api

echo ""
echo "📦 Installiere Abhängigkeiten..."
npm install

echo ""
echo "🔧 Prüfe Umgebungsvariablen..."
if ! grep -q "SUPABASE_URL" .env; then
    echo "❌ SUPABASE_URL nicht in .env gefunden!"
    echo "Bitte konfigurieren Sie alle erforderlichen Supabase-Umgebungsvariablen."
    exit 1
fi

if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL nicht in .env gefunden!"
    echo "Bitte konfigurieren Sie die Supabase-Datenbankverbindung."
    exit 1
fi

echo "✅ Umgebungsvariablen sind konfiguriert"

echo ""
echo "🗄️ Generiere Prisma Client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Fehler beim Generieren des Prisma Clients"
    exit 1
fi

echo "✅ Prisma Client generiert"

echo ""
echo "🚀 Starte Migration zu Supabase..."
echo "WARNUNG: Dies wird alle bestehenden Daten überschreiben!"

read -p "Sind Sie sicher, dass Sie fortfahren möchten? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration abgebrochen"
    exit 1
fi

echo ""
echo "📊 Führe Migration durch..."
npm run db:migrate:deploy

if [ $? -ne 0 ]; then
    echo "❌ Migration fehlgeschlagen!"
    echo ""
    echo "🔧 Versuche Schema direkt zu pushen..."
    npm run db:push
    
    if [ $? -ne 0 ]; then
        echo "❌ Auch Schema-Push fehlgeschlagen!"
        echo "Bitte überprüfen Sie:"
        echo "1. Supabase-Projekt-Status"
        echo "2. Datenbankverbindung"
        echo "3. Umgebungsvariablen"
        exit 1
    fi
fi

echo "✅ Migration erfolgreich!"

echo ""
echo "🌱 Füge Demo-Daten hinzu..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "⚠️  Demo-Daten konnten nicht hinzugefügt werden"
    echo "Dies ist nicht kritisch - Sie können die Daten manuell hinzufügen"
else
    echo "✅ Demo-Daten hinzugefügt"
fi

echo ""
echo "🎯 Migration zu Supabase abgeschlossen!"
echo ""
echo "📊 Nächste Schritte:"
echo "1. Überprüfen Sie die Datenbank in der Supabase-Konsole"
echo "2. Testen Sie die API-Endpunkte"
echo "3. Konfigurieren Sie Row Level Security (RLS)"
echo "4. Setzen Sie Produktions-Umgebungsvariablen"
echo ""
echo "🔗 Supabase Dashboard: $(grep SUPABASE_URL .env | cut -d'=' -f2)"
echo ""
echo "✅ Migration erfolgreich abgeschlossen!"
