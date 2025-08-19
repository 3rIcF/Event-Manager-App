import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Package, 
  Search, 
  Filter, 
  Download, 
  ShoppingCart, 
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  TreePine,
  Building,
  Truck
} from 'lucide-react';

interface BOMItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  phase: string;
  coverage: number;
  reserved: number;
  needed: number;
  status: 'covered' | 'partial' | 'open' | 'critical';
  supplier?: string;
  price?: number;
}

const mockBOMItems: BOMItem[] = [
  {
    id: '1',
    name: 'Hauptbühne 12x8m',
    quantity: 1,
    unit: 'Stk',
    category: 'Bühnen',
    phase: 'Aufbau',
    coverage: 100,
    reserved: 1,
    needed: 0,
    status: 'covered',
    supplier: 'Bühnentechnik GmbH',
    price: 8500
  },
  {
    id: '2',
    name: 'Bauzaun Element 3,5m',
    quantity: 150,
    unit: 'Stk',
    category: 'Absperrung',
    phase: 'Aufbau',
    coverage: 70,
    reserved: 105,
    needed: 45,
    status: 'partial',
    price: 12
  },
  {
    id: '3',
    name: 'Pagodenzelt 3x3m',
    quantity: 20,
    unit: 'Stk',
    category: 'Zelte',
    phase: 'Aufbau',
    coverage: 0,
    reserved: 0,
    needed: 20,
    status: 'open'
  },
  {
    id: '4',
    name: 'Stromanschluss 32A CEE',
    quantity: 15,
    unit: 'Stk',
    category: 'Technik',
    phase: 'Aufbau',
    coverage: 80,
    reserved: 12,
    needed: 3,
    status: 'partial',
    supplier: 'Elektro Wagner',
    price: 45
  },
  {
    id: '5',
    name: 'Hubsteiger 18m',
    quantity: 2,
    unit: 'Stk',
    category: 'Baumaschinen',
    phase: 'Aufbau',
    coverage: 50,
    reserved: 1,
    needed: 1,
    status: 'critical',
    price: 250
  }
];

const categoryIcons = {
  'Bühnen': Building,
  'Zelte': TreePine,
  'Absperrung': Package,
  'Technik': Package,
  'Baumaschinen': Truck,
  'Möbel': Package,
  'Catering': Package,
  'Sicherheit': Package,
  'Sonstiges': Package
};

export function BOMView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [viewMode, setViewMode] = useState<'hierarchy' | 'categories' | 'phases'>('categories');

  const filteredItems = mockBOMItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesPhase = selectedPhase === 'all' || item.phase === selectedPhase;
    return matchesSearch && matchesCategory && matchesPhase;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'covered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'partial': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'open': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'covered': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-200 text-red-900';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const categories = Array.from(new Set(mockBOMItems.map(item => item.category)));
  const phases = Array.from(new Set(mockBOMItems.map(item => item.phase)));

  const getCategoryStats = (category: string) => {
    const items = mockBOMItems.filter(item => item.category === category);
    const totalItems = items.length;
    const covered = items.filter(item => item.status === 'covered').length;
    const partial = items.filter(item => item.status === 'partial').length;
    const open = items.filter(item => item.status === 'open' || item.status === 'critical').length;
    
    return { totalItems, covered, partial, open };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">BOM Übersicht</h2>
          <p className="text-muted-foreground">
            {mockBOMItems.length} Positionen • {mockBOMItems.filter(item => item.status === 'covered').length} abgedeckt • {mockBOMItems.filter(item => item.status === 'open' || item.status === 'critical').length} offen
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Package className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Positionen durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedPhase} onValueChange={setSelectedPhase}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Phasen</SelectItem>
                {phases.map(phase => (
                  <SelectItem key={phase} value={phase}>{phase}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Nach Kategorien</TabsTrigger>
          <TabsTrigger value="phases">Nach Phasen</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchie</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          {categories.map(category => {
            const stats = getCategoryStats(category);
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || Package;
            const categoryItems = filteredItems.filter(item => item.category === category);
            
            if (categoryItems.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span>{category}</span>
                      <Badge variant="outline">{stats.totalItems} Positionen</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">{stats.covered} abgedeckt</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">{stats.partial} teilweise</Badge>
                      <Badge className="bg-red-100 text-red-800">{stats.open} offen</Badge>
                      <Button size="sm" variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        RFQ erstellen
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categoryItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantity} {item.unit} • {item.reserved} reserviert • {item.needed} benötigt
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium">{item.coverage}% abgedeckt</div>
                            {item.supplier && (
                              <div className="text-xs text-muted-foreground">{item.supplier}</div>
                            )}
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <div className="space-x-1">
                            <Button size="sm" variant="outline">
                              <ShoppingCart className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          {phases.map(phase => {
            const phaseItems = filteredItems.filter(item => item.phase === phase);
            
            if (phaseItems.length === 0) return null;

            return (
              <Card key={phase}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>Phase: {phase}</span>
                      <Badge variant="outline">{phaseItems.length} Positionen</Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Phase exportieren
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {phaseItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(item.status)}
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.category} • {item.quantity} {item.unit}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-sm font-medium">{item.coverage}% abgedeckt</div>
                            <div className="text-xs text-muted-foreground">
                              {item.needed} noch benötigt
                            </div>
                          </div>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>BOM Hierarchie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4" />
                <p>Hierarchische Ansicht wird implementiert...</p>
                <p className="text-sm mt-2">Hier würde die Baumstruktur der BOM angezeigt werden</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}