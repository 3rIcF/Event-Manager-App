# 🚀 Event Manager App

Eine umfassende Event-Management-Anwendung mit React Native Web, TypeScript und moderner UI-Architektur.

## ✨ Features

### 🎯 Event Management
- **Vollständige CRUD-Operationen** für Events
- **Event-Typen und Kategorien** (Konferenz, Workshop, Seminar, etc.)
- **Teilnehmer-Management** mit Rollen und Status
- **Event-Kalender** und Zeitplanung
- **Budget-Tracking** und Kostenkontrolle

### 🔄 Real-Time Updates
- **WebSocket-Integration** für Live-Updates
- **Echtzeit-Benachrichtigungen** für alle Service-Operationen
- **Connection-Monitoring** und Statistiken
- **Automatische Wiederverbindung** bei Verbindungsverlust

### 📊 Projekt-Management
- **Projekt-Dashboard** mit Übersicht
- **BOM-Struktur** (Bill of Materials)
- **Beschaffung** und Lieferanten-Management
- **Genehmigungsverfahren** und Dokumentation
- **Logistik** und Transport
- **Finanzen** und Budget-Tracking

### 🎨 Moderne UI
- **Responsive Design** mit Tailwind CSS
- **Komponenten-basierte Architektur** mit shadcn/ui
- **TypeScript** für bessere Entwicklererfahrung
- **Accessibility** und Barrierefreiheit

## 🛠️ Technologie-Stack

- **Frontend**: React 18 + TypeScript + React Native Web
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Hooks
- **Real-Time**: WebSocket + Event-Driven Architecture
- **Build Tools**: React Scripts + Webpack
- **Package Manager**: npm

## 🚀 Installation

### Voraussetzungen
- Node.js 18+ 
- npm 8+

### 1. Repository klonen
```bash
git clone <repository-url>
cd event-manager-app
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Umgebungsvariablen konfigurieren
```bash
cp env.example .env.local
```

Bearbeiten Sie `.env.local` und fügen Sie Ihre Konfiguration hinzu:
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=ws://localhost:3001/events
```

### 4. Anwendung starten
```bash
npm start
```

Die Anwendung läuft dann unter `http://localhost:3000`

## 📁 Projektstruktur

```
event-manager-app/
├── src/                    # Hauptquellcode
│   └── index.tsx          # Einstiegspunkt
├── components/             # React-Komponenten
│   ├── ui/                # UI-Bibliothek (shadcn/ui)
│   ├── EventManager.tsx   # Event-Management
│   ├── RealTimeUpdates.tsx # Real-Time Updates
│   └── ...                # Weitere Komponenten
├── types/                  # TypeScript-Typen
│   └── event.ts           # Event-bezogene Typen
├── lib/                    # Utility-Funktionen
│   └── utils.ts           # CSS-Klassen-Helper
├── styles/                 # Globale Styles
│   └── globals.css        # Tailwind CSS
└── public/                 # Statische Assets
```

## 🔧 Entwicklung

### Verfügbare Scripts

```bash
# Entwicklungsserver starten
npm start

# Production-Build erstellen
npm run build

# Tests ausführen
npm test

# Code-Build für Eject
npm run eject
```

### Code-Qualität

- **TypeScript strict mode** aktiviert
- **ESLint** für Code-Qualität
- **Prettier** für Code-Formatierung
- **Tailwind CSS** für konsistentes Styling

## 🌐 API-Integration

Die Anwendung ist für die Integration mit einem Backend-API vorbereitet:

- **RESTful API** für CRUD-Operationen
- **WebSocket** für Real-Time Updates
- **JWT-Authentifizierung** unterstützt
- **Error Handling** und Retry-Logic

## 📱 Responsive Design

- **Mobile-First** Ansatz
- **Breakpoint-optimiert** für alle Bildschirmgrößen
- **Touch-freundlich** für mobile Geräte
- **Progressive Web App** (PWA) bereit

## 🔒 Sicherheit

- **JWT-Token-basierte Authentifizierung**
- **CSRF-Schutz** implementiert
- **Input-Validierung** mit TypeScript
- **XSS-Schutz** durch React

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Docker (optional)
```bash
docker build -f Dockerfile.frontend -t event-manager-frontend .
docker run -p 3000:3000 event-manager-frontend
```

## 🤝 Beitragen

1. Fork des Repositories
2. Feature-Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request erstellen

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 🆘 Support

Bei Fragen oder Problemen:

- **Issues**: GitHub Issues verwenden
- **Dokumentation**: Siehe `/docs` Verzeichnis
- **Community**: Diskussionsforum beitreten

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] Event-Management-System
- [x] Real-Time Updates
- [x] Grundlegende UI-Komponenten
- [x] TypeScript-Integration

### Phase 2: Erweiterte Features 🔄
- [ ] Benutzer-Authentifizierung
- [ ] Erweiterte Berichte
- [ ] Mobile App (React Native)
- [ ] Offline-Funktionalität

### Phase 3: Enterprise Features ⏳
- [ ] Multi-Tenant-Support
- [ ] Erweiterte Workflows
- [ ] API-Gateway
- [ ] Microservices-Architektur

---

<<<<<<< Current (Your changes)
This project is proprietary software. All rights reserved.
=======
**Entwickelt mit ❤️ und modernen Web-Technologien**
>>>>>>> Incoming (Background Agent changes)
