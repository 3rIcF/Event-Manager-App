import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Upload, FileText, CheckCircle, AlertTriangle, Download, Zap } from 'lucide-react';

interface BOMItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  phase: string;
  confidence: number;
  status: 'new' | 'changed' | 'unchanged' | 'removed';
  suggestedMapping?: string;
}

const mockBOMData: BOMItem[] = [
  { id: '1', name: 'Hauptbühne 12x8m', quantity: 1, unit: 'Stk', category: 'Bühnen', phase: 'Aufbau', confidence: 95, status: 'new' },
  { id: '2', name: 'Bauzaun Element 3,5m', quantity: 150, unit: 'Stk', category: 'Absperrung', phase: 'Aufbau', confidence: 90, status: 'changed' },
  { id: '3', name: 'Pagodenzelt 3x3m', quantity: 20, unit: 'Stk', category: 'Zelte', phase: 'Aufbau', confidence: 98, status: 'new' },
  { id: '4', name: 'Stromanschluss 32A CEE', quantity: 15, unit: 'Stk', category: 'Technik', phase: 'Aufbau', confidence: 85, status: 'unchanged' },
  { id: '5', name: 'Hubsteiger 18m', quantity: 2, unit: 'Stk', category: 'Baumaschinen', phase: 'Aufbau', confidence: 75, status: 'new', suggestedMapping: 'Arbeitsbühne' },
];

export function BOMImport() {
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'mapping' | 'diff'>('upload');
  const [bomItems, setBomItems] = useState<BOMItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simuliere Import
      setTimeout(() => {
        setBomItems(mockBOMData);
        setImportStep('preview');
      }, 1000);
    }
  };

  const handleMappingUpdate = (itemId: string, category: string) => {
    setBomItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, category, confidence: 95 } : item
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'changed': return 'bg-yellow-100 text-yellow-800';
      case 'unchanged': return 'bg-gray-100 text-gray-800';
      case 'removed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (importStep === 'upload') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">BOM Import</h2>
          <p className="text-muted-foreground">SketchUp BOM-Datei importieren und automatisch mappen</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Datei hochladen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">JSON/CSV Datei hier ablegen</p>
                <p className="text-sm text-muted-foreground">oder klicken zum Durchsuchen</p>
              </div>
              <Input
                type="file"
                accept=".json,.csv"
                onChange={handleFileUpload}
                className="mt-4"
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4" />
              <span>Automatisches Mapping auf Standardkategorien aktiviert</span>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Unterstützte Formate:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• JSON Export aus SketchUp</li>
                <li>• CSV mit Spalten: Name, Menge, Einheit, Kategorie</li>
                <li>• Excel Export (.xlsx)</li>
              </ul>
            </div>

            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Vorlage herunterladen
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (importStep === 'preview') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Import Vorschau</h2>
            <p className="text-muted-foreground">
              {bomItems.length} Positionen erkannt • Auto-Mapping: {bomItems.filter(item => item.confidence >= 85).length} erfolgreich
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setImportStep('mapping')}>
              Mapping überprüfen
            </Button>
            <Button onClick={() => setImportStep('diff')}>
              Weiter zu Diff
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{bomItems.filter(item => item.status === 'new').length}</div>
              <div className="text-sm text-muted-foreground">Neue Positionen</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{bomItems.filter(item => item.status === 'changed').length}</div>
              <div className="text-sm text-muted-foreground">Geänderte Positionen</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{bomItems.filter(item => item.confidence < 85).length}</div>
              <div className="text-sm text-muted-foreground">Benötigen Überprüfung</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Importierte Positionen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Position</th>
                    <th className="text-left p-2">Menge</th>
                    <th className="text-left p-2">Kategorie</th>
                    <th className="text-left p-2">Phase</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {bomItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.suggestedMapping && (
                            <div className="text-xs text-muted-foreground">
                              Vorschlag: {item.suggestedMapping}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">{item.quantity} {item.unit}</td>
                      <td className="p-2">
                        <Badge variant="outline">{item.category}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge variant="secondary">{item.phase}</Badge>
                      </td>
                      <td className="p-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <span className={getConfidenceColor(item.confidence)}>
                          {item.confidence}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (importStep === 'mapping') {
    const needsReview = bomItems.filter(item => item.confidence < 85);
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Mapping überprüfen</h2>
            <p className="text-muted-foreground">
              {needsReview.length} Positionen benötigen manuelle Überprüfung
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setImportStep('preview')}>
              Zurück
            </Button>
            <Button onClick={() => setImportStep('diff')}>
              Mapping übernehmen
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Positionen mit niedriger Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {needsReview.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} {item.unit}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm">Aktuelle Kategorie:</span>
                        <Badge variant="outline">{item.category}</Badge>
                        <span className={`text-sm ${getConfidenceColor(item.confidence)}`}>
                          ({item.confidence}% Confidence)
                        </span>
                      </div>
                    </div>
                    <div className="w-48">
                      <Select 
                        value={item.category} 
                        onValueChange={(value: string) => handleMappingUpdate(item.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bühnen">Bühnen</SelectItem>
                          <SelectItem value="Zelte">Zelte</SelectItem>
                          <SelectItem value="Absperrung">Absperrung</SelectItem>
                          <SelectItem value="Technik">Technik</SelectItem>
                          <SelectItem value="Baumaschinen">Baumaschinen</SelectItem>
                          <SelectItem value="Möbel">Möbel</SelectItem>
                          <SelectItem value="Catering">Catering</SelectItem>
                          <SelectItem value="Sicherheit">Sicherheit</SelectItem>
                          <SelectItem value="Sonstiges">Sonstiges</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // diff step
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Änderungen übernehmen</h2>
          <p className="text-muted-foreground">
            Überprüfen Sie die Unterschiede zur aktuellen BOM
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setImportStep('mapping')}>
            Zurück
          </Button>
          <Button>
            <CheckCircle className="w-4 h-4 mr-2" />
            Import abschließen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {bomItems.filter(item => item.status === 'new').length}
            </div>
            <div className="text-sm text-muted-foreground">Neue Positionen werden hinzugefügt</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {bomItems.filter(item => item.status === 'changed').length}
            </div>
            <div className="text-sm text-muted-foreground">Positionen werden aktualisiert</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-sm text-muted-foreground">Positionen werden entfernt</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Änderungsprotokoll</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {bomItems.filter(item => item.status !== 'unchanged').map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <Badge variant="outline">{item.category}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}