import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { DiffNotificationBanner } from './DiffNotificationBanner';
import { 
  ChevronRight, 
  ChevronDown, 
  Package, 
  Search, 
  Filter, 
  Download, 
  ShoppingCart, 
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  MessageSquare,
  Edit,
  MoreHorizontal,
  Package2,
  ExternalLink,
  History
} from 'lucide-react';

interface BOMItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  phase: string;
  coverage: number;
  reserved: number;
  needed: number;
  status: 'covered' | 'partial' | 'open' | 'critical';
  children?: BOMItem[];
  level: number;
  globalId?: string; // Link to master data
  hasOverride: boolean;
  lastUpdated?: string;
  specs?: string;
  leadTime?: number;
  usedInProjects?: string[];
}

const mockBOMData: BOMItem[] = [
  {
    id: '1',
    name: 'Hauptbühne Komplett',
    category: 'Bühnen',
    quantity: 1,
    unit: 'Set',
    phase: 'Aufbau',
    coverage: 100,
    reserved: 1,
    needed: 0,
    status: 'covered',
    level: 0,
    globalId: 'STAGE_001',
    hasOverride: false,
    lastUpdated: '2025-01-15',
    specs: '12x8m Bühnensystem mit Dach',
    leadTime: 7,
    usedInProjects: ['Stadtfest 2024', 'Konzert am See'],
    children: [
      {
        id: '1.1',
        name: 'Bühnenaufbau 12x8m',
        category: 'Bühnen',
        quantity: 1,
        unit: 'Stk',
        phase: 'Aufbau',
        coverage: 100,
        reserved: 1,
        needed: 0,
        status: 'covered',
        level: 1,
        globalId: 'STAGE_BASE_001',
        hasOverride: false,
        specs: 'Modulares Bühnensystem, höhenverstellbar',
        leadTime: 5
      },
      {
        id: '1.2',
        name: 'Bühnendach 12x8m',
        category: 'Bühnen',
        quantity: 1,
        unit: 'Stk',
        phase: 'Aufbau',
        coverage: 100,
        reserved: 1,
        needed: 0,
        status: 'covered',
        level: 1,
        globalId: 'STAGE_ROOF_001',
        hasOverride: true,
        specs: 'Wetterschutz, transparent'
      },
      {
        id: '1.3',
        name: 'LED-Beleuchtung',
        category: 'Technik',
        quantity: 8,
        unit: 'Stk',
        phase: 'Aufbau',
        coverage: 75,
        reserved: 6,
        needed: 2,
        status: 'partial',
        level: 1,
        globalId: 'LIGHT_LED_001',
        hasOverride: false,
        specs: 'RGB LED Spots, 50W',
        leadTime: 3
      }
    ]
  },
  {
    id: '2',
    name: 'Absperrung Perimeter',
    category: 'Absperrung',
    quantity: 150,
    unit: 'Stk',
    phase: 'Aufbau',
    coverage: 70,
    reserved: 105,
    needed: 45,
    status: 'partial',
    level: 0,
    globalId: 'FENCE_001',
    hasOverride: false,
    specs: 'Bauzaun 3,5m Standard',
    leadTime: 2,
    usedInProjects: ['Oktoberfest', 'Stadtfest 2024'],
    children: [
      {
        id: '2.1',
        name: 'Bauzaun Element 3,5m',
        category: 'Absperrung',
        quantity: 130,
        unit: 'Stk',
        phase: 'Aufbau',
        coverage: 80,
        reserved: 104,
        needed: 26,
        status: 'partial',
        level: 1,
        globalId: 'FENCE_ELEMENT_001',
        hasOverride: false
      },
      {
        id: '2.2',
        name: 'Bauzaun Füße',
        category: 'Absperrung',
        quantity: 150,
        unit: 'Stk',
        phase: 'Aufbau',
        coverage: 60,
        reserved: 90,
        needed: 60,
        status: 'partial',
        level: 1,
        globalId: 'FENCE_FOOT_001',
        hasOverride: false
      }
    ]
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'covered': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'partial': return <Clock className="w-4 h-4 text-yellow-500" />;
    case 'open': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
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

interface BOMHierarchyProps {
  projectId?: string;
}

export function BOMHierarchy({ projectId }: BOMHierarchyProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['1', '2']);
  const [selectedItem, setSelectedItem] = useState<BOMItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const flattenBOMData = (items: BOMItem[]): BOMItem[] => {
    const result: BOMItem[] = [];
    
    const addItems = (items: BOMItem[], level: number = 0) => {
      items.forEach(item => {
        result.push({ ...item, level });
        if (item.children && expandedItems.includes(item.id)) {
          addItems(item.children, level + 1);
        }
      });
    };
    
    addItems(items);
    return result;
  };

  const filteredData = flattenBOMData(mockBOMData).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPhase = phaseFilter === 'all' || item.phase === phaseFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesPhase && matchesStatus;
  });

  const handleItemClick = (item: BOMItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="space-y-6">
      {/* Diff Notifications Banner */}
      <DiffNotificationBanner />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">BOM Hierarchie</h2>
          <p className="text-muted-foreground">
            Strukturierte Ansicht aus SketchUp Import
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
                  placeholder="BOM durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Phase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Phasen</SelectItem>
                <SelectItem value="Aufbau">Aufbau</SelectItem>
                <SelectItem value="Show">Show</SelectItem>
                <SelectItem value="Abbau">Abbau</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="covered">Abgedeckt</SelectItem>
                <SelectItem value="partial">Teilweise</SelectItem>
                <SelectItem value="open">Offen</SelectItem>
                <SelectItem value="critical">Kritisch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* BOM Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Struktur-Übersicht</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filteredData.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                style={{ paddingLeft: `${item.level * 24 + 8}px` }}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center gap-2 flex-1">
                  {item.children && item.children.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="p-0 h-4 w-4"
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        toggleExpand(item.id);
                      }}
                    >
                      {expandedItems.includes(item.id) ? 
                        <ChevronDown className="w-3 h-3" /> : 
                        <ChevronRight className="w-3 h-3" />
                      }
                    </Button>
                  )}
                  
                  {(!item.children || item.children.length === 0) && (
                    <div className="w-4" />
                  )}

                  {getStatusIcon(item.status)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.hasOverride && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          Override
                        </Badge>
                      )}
                      {item.globalId && (
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.category} • {item.quantity} {item.unit} • {item.phase}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm">
                      {item.reserved}/{item.quantity} reserviert
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.needed} benötigt
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(item.status)}>
                    {item.coverage}%
                  </Badge>

                  <div className="flex gap-1">
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

      {/* Detail Drawer */}
      {selectedItem && (
        <Drawer open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Package2 className="w-5 h-5" />
                {selectedItem.name}
                {selectedItem.hasOverride && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Override aktiv
                  </Badge>
                )}
              </DrawerTitle>
            </DrawerHeader>
            
            <div className="p-6">
              <Tabs defaultValue="project" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="project">Projekt</TabsTrigger>
                  <TabsTrigger value="global">Global</TabsTrigger>
                </TabsList>

                <TabsContent value="project" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Menge geplant:</label>
                      <div className="text-lg font-bold">{selectedItem.quantity} {selectedItem.unit}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Reserviert:</label>
                      <div className="text-lg font-bold text-green-600">{selectedItem.reserved}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Noch benötigt:</label>
                      <div className="text-lg font-bold text-red-600">{selectedItem.needed}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phase:</label>
                      <Badge variant="outline">{selectedItem.phase}</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium">Projekt-Notizen:</label>
                    <div className="mt-2 p-3 border rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Spezielle Anforderungen für dieses Projekt...
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Slots & Termine:</label>
                    <div className="mt-2 space-y-2">
                      <div className="p-2 border rounded text-sm">
                        <div className="font-medium">Anlieferung: 15.09. 08:00 - Gate A</div>
                        <div className="text-muted-foreground">Bühnentechnik Bayern</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Projekt-Kommentare:</label>
                    <div className="mt-2 space-y-2">
                      <div className="p-2 border rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-3 h-3" />
                          <span className="font-medium">Max Müller</span>
                          <span className="text-muted-foreground">vor 2 Std.</span>
                        </div>
                        <p>Bühnendach muss transparent sein wegen Lichtshow</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="global" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Global ID:</label>
                      <div className="font-mono text-sm">{selectedItem.globalId}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Standard-Leadtime:</label>
                      <div>{selectedItem.leadTime} Tage</div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Spezifikationen:</label>
                    <div className="mt-2 p-3 border rounded-lg">
                      <p className="text-sm">{selectedItem.specs}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Verwendet in Projekten:</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedItem.usedInProjects?.map((project, index) => (
                        <Badge key={index} variant="outline">{project}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Globale Kommentare:</label>
                    <div className="mt-2 space-y-2">
                      <div className="p-2 border rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-3 h-3" />
                          <span className="font-medium">Anna Schmidt</span>
                          <span className="text-muted-foreground">vor 1 Woche</span>
                        </div>
                        <p>Standardlieferant hat Qualitätsprobleme - Alternative prüfen</p>
                      </div>
                    </div>
                  </div>

                  {selectedItem.hasOverride && (
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-800">Override aktiv</span>
                      </div>
                      <p className="text-sm text-orange-700">
                        Dieses Item wurde projekt-spezifisch angepasst und weicht von den Stammdaten ab.
                      </p>
                      <div className="mt-2 space-x-2">
                        <Button size="sm" variant="outline">
                          Override entfernen
                        </Button>
                        <Button size="sm" variant="outline">
                          <History className="w-4 h-4 mr-2" />
                          Änderungen anzeigen
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Reservieren
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}