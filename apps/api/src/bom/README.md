# BOM (Bill of Materials) Management

## Übersicht

Das BOM-Management-System ermöglicht es, Materiallisten für Event-Projekte zu verwalten, zu importieren und zu exportieren. Es unterstützt automatische Kategorie-Zuordnung und intelligente Mapping-Konfidenz.

## Architektur

### Komponenten

- **BomController**: REST-API-Endpunkte für BOM-Operationen
- **BomService**: Geschäftslogik für BOM-Management
- **BomModule**: NestJS-Modul-Konfiguration
- **Types**: TypeScript-Interfaces und Zod-Schemas

### Datenmodell

```typescript
interface BomItem {
  id: string;
  projectId: string;
  name: string;
  categoryStd: string;
  subcategoryStd?: string;
  quantity: number;
  unit: string;
  phase?: string;
  mappingConfidence?: number;
  needsReview?: boolean;
  sourceVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## API-Endpunkte

### 1. BOM Import

**POST** `/bom/import`

Importiert eine BOM aus CSV- oder JSON-Dateien.

**Request:**
- `file`: CSV/JSON-Datei (multipart/form-data)
- `projectId`: ID des Projekts
- `mappingConfidence`: Mapping-Konfidenz (0-1, optional)
- `categoryMapping`: Manuelle Kategorie-Zuordnung (optional)

**Response:**
```json
{
  "success": true,
  "importedCount": 25,
  "skippedCount": 0,
  "items": [...],
  "errors": [],
  "warnings": [],
  "mappingConfidence": 0.8,
  "message": "25 BOM-Items erfolgreich importiert"
}
```

**Unterstützte Dateiformate:**
- CSV mit Spalten: name, category, quantity, unit, phase, cost, etc.
- JSON mit Array von BOM-Items

### 2. BOM-Delta abrufen

**GET** `/bom/delta/:projectId?sourceVersion=v1.0.0`

Zeigt Änderungen zwischen verschiedenen BOM-Versionen an.

**Response:**
```json
{
  "projectId": "proj_123",
  "sourceVersion": "v1.0.0",
  "items": [...],
  "added": [...],
  "modified": [...],
  "removed": [...],
  "conflicts": [...]
}
```

### 3. BOM-Items abrufen

**GET** `/bom/items/:projectId?phase=SETUP&category=ELECTRICAL`

Ruft BOM-Items für ein Projekt ab mit optionaler Filterung.

**Filter:**
- `phase`: Projektphase (SETUP, BUILD, TEARDOWN)
- `category`: Materialkategorie

### 4. BOM-Item aktualisieren

**PUT** `/bom/items/:id`

Aktualisiert ein bestehendes BOM-Item.

**Request Body:**
```json
{
  "name": "Aktualisierter Name",
  "quantity": 10,
  "unit": "Stück",
  "phase": "BUILD",
  "mappingConfidence": 0.9
}
```

### 5. BOM-Item löschen

**DELETE** `/bom/items/:id`

Löscht ein BOM-Item permanent.

### 6. BOM synchronisieren

**POST** `/bom/sync/:projectId`

Synchronisiert die BOM mit globalen Master-Daten.

**Response:**
```json
{
  "success": true,
  "syncedItems": 20,
  "updatedItems": 5,
  "conflicts": 2,
  "totalItems": 27,
  "message": "20/27 Items erfolgreich synchronisiert",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### 7. BOM exportieren

**GET** `/bom/export/:projectId?format=csv`

Exportiert die BOM in verschiedenen Formaten.

**Formate:**
- CSV: Tabellarische Darstellung
- PDF: Strukturierter Bericht (vereinfacht)

## Automatische Kategorie-Zuordnung

Das System unterstützt automatische Kategorie-Zuordnung basierend auf Materialnamen:

### Standard-Kategorien

- **Zelte**: zelt, tent, pavillon
- **Baumaterialien**: holz, balken, platte, schrauben
- **Baumaschinen**: bagger, kran, stapler
- **Sanitär**: toilette, waschbecken, dusche
- **Strom**: kabel, steckdose, verteiler
- **Deko**: blume, tuch, ballon
- **Bühne**: bühne, podest, stage
- **Beleuchtung**: scheinwerfer, licht, lampe
- **Ton**: mikrofon, lautsprecher, mischpult
- **Sicherheit**: absperrung, warntafel, feuerlöscher
- **Verpflegung**: essen, getränk, küche
- **Transport**: lkw, transporter, anhänger

### Mapping-Konfidenz

- **1.0**: Exakte Übereinstimmung
- **0.8**: Hohe Konfidenz (automatisch gemappt)
- **0.3**: Niedrige Konfidenz (manuelle Überprüfung erforderlich)

## Berechtigungen

### Rollen-basierte Zugriffskontrolle

- **ADMIN**: Alle Operationen
- **ORGANIZER**: Import, Update, Delete, Sync, Export
- **ONSITE**: Lesen, Update, Export
- **EXTERNAL_VENDOR**: Nur Lesen

## Fehlerbehandlung

### Validierung

- Projekt-Existenz wird überprüft
- Dateityp-Validierung (nur CSV/JSON)
- Mapping-Konfidenz-Bereich (0-1)
- Pflichtfelder: name, quantity, unit

### Fehlertypen

- **BadRequestException**: Validierungsfehler
- **NotFoundException**: Projekt/BOM nicht gefunden
- **Internal Server Error**: Systemfehler

## Performance-Optimierungen

- Temporäre Dateien werden automatisch gelöscht
- Batch-Processing für große Imports
- Memoized Kategorie-Lookups
- Effiziente Datenbankabfragen mit Includes

## Logging

Alle Operationen werden mit strukturiertem Logging protokolliert:

```typescript
this.logger.log(`Importing BOM from file: ${file.originalname} for project: ${importData.projectId}`);
this.logger.error(`BOM import failed: ${error.message}`, error.stack);
this.logger.warn(`Fehler beim Synchronisieren des Items ${item.id}:`, error);
```

## Beispiele

### CSV-Import

```csv
name,category,quantity,unit,phase
Zelt 3x3m,Zelte,2,Stück,SETUP
Holzbalken 4m,Baumaterialien,10,Stück,BUILD
Scheinwerfer 1000W,Beleuchtung,4,Stück,BUILD
```

### JSON-Import

```json
[
  {
    "name": "Zelt 3x3m",
    "category": "Zelte",
    "quantity": 2,
    "unit": "Stück",
    "phase": "SETUP"
  },
  {
    "name": "Holzbalken 4m",
    "category": "Baumaterialien",
    "quantity": 10,
    "unit": "Stück",
    "phase": "BUILD"
  }
]
```

## Wartung und Troubleshooting

### Häufige Probleme

1. **Datei zu groß**: Maximal 10MB
2. **Ungültiger Dateityp**: Nur CSV/JSON unterstützt
3. **Fehlende Projekt-ID**: Projekt muss existieren
4. **Kategorie-Mapping-Fehler**: Überprüfen Sie die Mapping-Konfidenz

### Monitoring

- Import-Erfolgsrate
- Mapping-Konfidenz-Verteilung
- Synchronisations-Konflikte
- Export-Performance

## Zukünftige Erweiterungen

- **BOM-Versionsverwaltung**: Vollständige Versionshistorie
- **Konfliktlösung**: Automatische Konfliktbehandlung
- **Erweiterte Kategorien**: Hierarchische Kategorie-Struktur
- **BOM-Templates**: Wiederverwendbare BOM-Strukturen
- **Integration**: Anbindung an externe Systeme
