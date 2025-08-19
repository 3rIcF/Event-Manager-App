import React, { useState } from 'react';
import { useData, GlobalMaterial, GlobalSupplier } from './DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer';
import { Separator } from './ui/separator';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Package, 
  Users, 
  FolderTree,
  ExternalLink,
  MessageSquare,
  Edit,
  Archive,
  Merge,
  FileText,
  AlertTriangle,
  CheckCircle,
  Upload,
  Download
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

type MasterDataView = 'materials' | 'suppliers' | 'categories';

export function MasterDataManager() {
  const { 
    globalMaterials, 
    globalSuppliers, 
    comments,
    getMaterialUsage,
    getCommentsForEntity,
    addComment,
    diffNotifications
  } = useData();
  
  const [currentView, setCurrentView] = useState<MasterDataView>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<GlobalMaterial | GlobalSupplier | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter materials based on search and category
  const filteredMaterials = globalMaterials.filter(material => {
    const matchesSearch = material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          material.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || material.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(globalMaterials.map(m => m.category))];

  const handleEntitySelect = (entity: GlobalMaterial | GlobalSupplier) => {
    setSelectedEntity(entity);
  };

  const renderMaterialsList = () => (
    <div className="space-y-4">
      {filteredMaterials.map(material => {
        const usage = getMaterialUsage(material.id);
        const hasUpdates = diffNotifications.some(
          n => n.globalEntityId === material.id && n.status === 'pending'
        );

        return (
          <Card 
            key={material.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleEntitySelect(material)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{material.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{material.category}</Badge>
                        <span>•</span>
                        <span>{material.unit}</span>
                        <span>•</span>
                        <span>v{material.version}</span>
                        {hasUpdates && (
                          <>
                            <span>•</span>
                            <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>In {usage.projectCount} Projekten</span>
                    <span>•</span>
                    <span>{usage.openNeeds} Stk offen</span>
                    {material.standardLeadTime && (
                      <>
                        <span>•</span>
                        <span>{material.standardLeadTime} Tage Vorlauf</span>
                      </>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Merge className="w-4 h-4 mr-2" />
                      Zusammenführen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="w-4 h-4 mr-2" />
                      Als Vorlage
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-muted-foreground">
                      <Archive className="w-4 h-4 mr-2" />
                      Archivieren
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {material.specs && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {material.specs}
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderSuppliersList = () => (
    <div className="text-center py-12">
      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">Dienstleister-Management</h3>
      <p className="text-muted-foreground mb-4">
        Portfolio-Kacheln, Regionen, Scores und globale Verwaltung
      </p>
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Dienstleister hinzufügen
      </Button>
    </div>
  );

  const renderCategoriesList = () => (
    <div className="text-center py-12">
      <FolderTree className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">Kategorien-Hierarchie</h3>
      <p className="text-muted-foreground mb-4">
        Verwaltung der Kategorie-Struktur und Zuordnungen
      </p>
      <Button>
        <Plus className="w-4 h-4 mr-2" />
        Kategorie hinzufügen
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Stammdaten</h2>
          <p className="text-muted-foreground">
            Globale Verwaltung von Material, Kategorien und Dienstleistern
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Neu anlegen
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as MasterDataView)}>
        <TabsList>
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Material
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Dienstleister
          </TabsTrigger>
          <TabsTrigger value="categories" className="flex items-center gap-2">
            <FolderTree className="w-4 h-4" />
            Kategorien
          </TabsTrigger>
        </TabsList>

        {/* Filters */}
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Stammdaten durchsuchen..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {currentView === 'materials' && (
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Erweiterte Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <TabsContent value="materials">
          {renderMaterialsList()}
        </TabsContent>

        <TabsContent value="suppliers">
          {renderSuppliersList()}
        </TabsContent>

        <TabsContent value="categories">
          {renderCategoriesList()}
        </TabsContent>
      </Tabs>

      {/* Detail Drawer */}
      {selectedEntity && (
        <Drawer open={!!selectedEntity} onOpenChange={() => setSelectedEntity(null)}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                {(selectedEntity as GlobalMaterial).name}
                <Badge variant="outline">v{(selectedEntity as GlobalMaterial).version}</Badge>
              </DrawerTitle>
            </DrawerHeader>
            
            <div className="p-6">
              <Tabs defaultValue="global" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="global">Global</TabsTrigger>
                  <TabsTrigger value="projects">In Projekten</TabsTrigger>
                </TabsList>

                <TabsContent value="global" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Global ID:</label>
                      <div className="font-mono text-sm">{(selectedEntity as GlobalMaterial).id}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Kategorie:</label>
                      <div>{(selectedEntity as GlobalMaterial).category}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Einheit:</label>
                      <div>{(selectedEntity as GlobalMaterial).unit}</div>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Standard-Leadtime:</label>
                      <div>{(selectedEntity as GlobalMaterial).standardLeadTime} Tage</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium">Spezifikationen:</label>
                    <div className="mt-2 p-3 border rounded-lg">
                      <p className="text-sm">{(selectedEntity as GlobalMaterial).specs}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Portfolio:</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(selectedEntity as GlobalMaterial).portfolio?.map((item, index) => (
                        <Badge key={index} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Globale Kommentare:</label>
                    <div className="mt-2 space-y-2">
                      {getCommentsForEntity('material', (selectedEntity as GlobalMaterial).id, 'global').map(comment => (
                        <div key={comment.id} className="p-2 border rounded text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="w-3 h-3" />
                            <span className="font-medium">{comment.author}</span>
                            <span className="text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleDateString('de-DE')}
                            </span>
                          </div>
                          <p>{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Verwendet in Projekten:</label>
                    <div className="mt-2 space-y-2">
                      {(selectedEntity as GlobalMaterial).usedInProjects.map(projectId => (
                        <div key={projectId} className="p-2 border rounded text-sm flex items-center justify-between">
                          <span>Projekt {projectId}</span>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Öffnen
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <label className="text-sm font-medium">Abweichende Overrides:</label>
                    <div className="mt-2 space-y-2">
                      <div className="p-2 border rounded text-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span className="font-medium">Stadtfest München</span>
                        </div>
                        <p className="text-muted-foreground">Menge übersteuert: 150 → 200 Stk</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Offene Bedarfe:</label>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 border rounded">
                        <div className="text-lg font-bold">385</div>
                        <div className="text-sm text-muted-foreground">Gesamt</div>
                      </div>
                      <div className="p-3 border rounded">
                        <div className="text-lg font-bold text-green-600">290</div>
                        <div className="text-sm text-muted-foreground">Gedeckt</div>
                      </div>
                      <div className="p-3 border rounded">
                        <div className="text-lg font-bold text-red-600">95</div>
                        <div className="text-sm text-muted-foreground">Offen</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Als Vorlage veröffentlichen
                </Button>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}