import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Search, 
  Star, 
  MapPin, 
  Truck, 
  Clock, 
  Euro, 
  Send,
  CheckCircle,
  AlertTriangle,
  Users,
  Award
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  location: string;
  distance: number;
  rating: number;
  score: number;
  capabilities: string[];
  coverage: 'full' | 'partial' | 'none';
  lastProject: string;
  responseRate: number;
  onTimeRate: number;
  priceLevel: 'low' | 'medium' | 'high';
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Eventpartner München GmbH',
    location: 'München',
    distance: 5,
    rating: 4.8,
    score: 95,
    capabilities: ['Zelte', 'Möbel', 'Catering'],
    coverage: 'full',
    lastProject: 'Oktoberfest 2024',
    responseRate: 98,
    onTimeRate: 96,
    priceLevel: 'medium'
  },
  {
    id: '2', 
    name: 'Bühnentechnik Bayern',
    location: 'Augsburg',
    distance: 65,
    rating: 4.6,
    score: 88,
    capabilities: ['Bühnen', 'Technik', 'Beleuchtung'],
    coverage: 'partial',
    lastProject: 'Rock im Park 2024',
    responseRate: 85,
    onTimeRate: 92,
    priceLevel: 'high'
  },
  {
    id: '3',
    name: 'Zeltverleih Süddeutschland',
    location: 'Stuttgart',
    distance: 220,
    rating: 4.2,
    score: 75,
    capabilities: ['Zelte', 'Absperrung'],
    coverage: 'partial',
    lastProject: 'Stuttgarter Frühlingsfest',
    responseRate: 78,
    onTimeRate: 88,
    priceLevel: 'low'
  },
  {
    id: '4',
    name: 'Universal Events & More',
    location: 'München',
    distance: 12,
    rating: 4.4,
    score: 82,
    capabilities: ['Absperrung', 'Sicherheit', 'Personal'],
    coverage: 'full',
    lastProject: 'BMW Pressekonferenz',
    responseRate: 92,
    onTimeRate: 94,
    priceLevel: 'medium'
  }
];

export function SupplierMatching() {
  const [selectedCategory, setSelectedCategory] = useState('Zelte');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [showRFQDialog, setShowRFQDialog] = useState(false);

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'none': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriceLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const toggleSupplierSelection = (supplierId: string) => {
    setSelectedSuppliers(prev => 
      prev.includes(supplierId) 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Anbieter-Matching</h2>
          <p className="text-muted-foreground">
            Finden Sie die passenden Anbieter für Ihre Anforderungen
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog open={showRFQDialog} onOpenChange={setShowRFQDialog}>
            <DialogTrigger asChild>
              <Button disabled={selectedSuppliers.length === 0}>
                <Send className="w-4 h-4 mr-2" />
                RFQ senden ({selectedSuppliers.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>RFQ erstellen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ausgewählte Anbieter:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSuppliers.map(id => {
                      const supplier = mockSuppliers.find(s => s.id === id);
                      return supplier ? (
                        <Badge key={id} variant="outline">{supplier.name}</Badge>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Angebotsfrist:</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Lieferfenster:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="datetime-local" placeholder="Von" />
                    <Input type="datetime-local" placeholder="Bis" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Anlieferungsort:</label>
                  <Input placeholder="Gate/Tor Bezeichnung" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nachricht:</label>
                  <Textarea 
                    placeholder="Zusätzliche Informationen für die Anbieter..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Anhänge:</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      BOM-CSV und Lageplan hier ablegen
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowRFQDialog(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={() => setShowRFQDialog(false)}>
                    <Send className="w-4 h-4 mr-2" />
                    RFQ senden
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Category Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-medium">Kategorie:</span>
            {['Zelte', 'Bühnen', 'Technik', 'Absperrung', 'Catering'].map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="text-sm text-muted-foreground">
            Benötigt: 20x Pagodenzelt 3x3m • Termin: 15.09.2025 - 17.09.2025
          </div>
        </CardContent>
      </Card>

      {/* Supplier Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Anbieter-Heatmap für {selectedCategory}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockSuppliers
              .filter(supplier => supplier.capabilities.includes(selectedCategory))
              .sort((a, b) => b.score - a.score)
              .map(supplier => (
                <div 
                  key={supplier.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedSuppliers.includes(supplier.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-muted-foreground/50'
                  }`}
                  onClick={() => toggleSupplierSelection(supplier.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{supplier.name}</h3>
                        <Badge className={getCoverageColor(supplier.coverage)}>
                          {supplier.coverage === 'full' ? 'Vollständig' : 
                           supplier.coverage === 'partial' ? 'Teilweise' : 'Nicht verfügbar'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{supplier.rating}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>{supplier.location} ({supplier.distance}km)</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{supplier.onTimeRate}% pünktlich</span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Send className="w-4 h-4" />
                          <span>{supplier.responseRate}% Antwortrate</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Euro className={`w-4 h-4 ${getPriceLevelColor(supplier.priceLevel)}`} />
                          <span className={getPriceLevelColor(supplier.priceLevel)}>
                            {supplier.priceLevel === 'low' ? 'Günstig' :
                             supplier.priceLevel === 'medium' ? 'Mittel' : 'Hoch'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Gesamtscore:</span>
                          <span className="text-sm">{supplier.score}/100</span>
                        </div>
                        <Progress value={supplier.score} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {supplier.capabilities.map(capability => (
                          <Badge key={capability} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground mt-2">
                        Letztes Projekt: {supplier.lastProject}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        supplier.score >= 90 ? 'bg-green-500' :
                        supplier.score >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <input 
                        type="checkbox" 
                        checked={selectedSuppliers.includes(supplier.id)}
                        onChange={() => toggleSupplierSelection(supplier.id)}
                        className="rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Vollständige Abdeckung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              2 Anbieter können die komplette Anfrage abdecken
            </p>
            <Button size="sm" className="w-full">
              Beste Anbieter auswählen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Split-Empfehlung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Aufteilung kann Kosten um 15% reduzieren
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Split-Vorschlag anzeigen
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              Wunschliste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Gesamte Kategorie an einen Anbieter senden
            </p>
            <Button size="sm" variant="outline" className="w-full">
              Wunschliste erstellen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}