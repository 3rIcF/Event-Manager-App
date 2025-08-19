import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from './ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { 
  FileText, 
  Image, 
  Film, 
  Archive, 
  Upload, 
  Download, 
  Eye, 
  MessageSquare,
  Tag,
  Calendar,
  User,
  FolderOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Share,
  Star,
  Copy,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

interface FileItem {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'video' | 'document' | 'template';
  size: number;
  scope: 'global' | 'project';
  projectId?: string;
  category: string;
  tags: string[];
  uploadedBy: string;
  uploadedAt: string;
  version: number;
  isTemplate?: boolean;
  templateUpdatesAvailable?: boolean;
  linkedTo?: string; // For project files linked to global templates
  comments: number;
  downloads: number;
}

const mockFiles: FileItem[] = [
  // Global files
  {
    id: 'file_001',
    name: 'RFQ Vorlage Standard',
    type: 'template',
    size: 245760,
    scope: 'global',
    category: 'Vorlagen',
    tags: ['rfq', 'standard', 'beschaffung'],
    uploadedBy: 'Anna Schmidt',
    uploadedAt: '2024-11-15T10:30:00Z',
    version: 3,
    isTemplate: true,
    comments: 5,
    downloads: 23
  },
  {
    id: 'file_002',
    name: 'Briefing Template Event',
    type: 'template',
    size: 512000,
    scope: 'global',
    category: 'Vorlagen',
    tags: ['briefing', 'event', 'dienstleister'],
    uploadedBy: 'Max Müller',
    uploadedAt: '2024-12-01T14:20:00Z',
    version: 2,
    isTemplate: true,
    comments: 3,
    downloads: 18
  },
  {
    id: 'file_003',
    name: 'Standard AGB Event-Services',
    type: 'pdf',
    size: 1024000,
    scope: 'global',
    category: 'Rechtliches',
    tags: ['agb', 'verträge', 'legal'],
    uploadedBy: 'Legal Team',
    uploadedAt: '2024-10-20T09:15:00Z',
    version: 1,
    comments: 2,
    downloads: 45
  },
  // Project files
  {
    id: 'file_101',
    name: 'Lageplan Stadtfest München',
    type: 'pdf',
    size: 2048000,
    scope: 'project',
    projectId: '1',
    category: 'Pläne',
    tags: ['lageplan', 'stadtfest', 'münchen'],
    uploadedBy: 'Max Müller',
    uploadedAt: '2024-12-20T11:00:00Z',
    version: 1,
    comments: 8,
    downloads: 12
  },
  {
    id: 'file_102',
    name: 'RFQ Bühnentechnik',
    type: 'document',
    size: 128000,
    scope: 'project',
    projectId: '1',
    category: 'Beschaffung',
    tags: ['rfq', 'bühne', 'technik'],
    uploadedBy: 'Anna Schmidt',
    uploadedAt: '2024-12-21T16:45:00Z',
    version: 1,
    linkedTo: 'file_001',
    templateUpdatesAvailable: true,
    comments: 2,
    downloads: 5
  },
  {
    id: 'file_103',
    name: 'Aufbau Fotos Tag 1',
    type: 'image',
    size: 15360000,
    scope: 'project',
    projectId: '1',
    category: 'Dokumentation',
    tags: ['aufbau', 'fotos', 'dokumentation'],
    uploadedBy: 'Onsite Team',
    uploadedAt: '2024-12-22T08:30:00Z',
    version: 1,
    comments: 1,
    downloads: 3
  }
];

const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
    case 'image': return <Image className="w-5 h-5 text-blue-500" />;
    case 'video': return <Film className="w-5 h-5 text-purple-500" />;
    case 'template': return <FileText className="w-5 h-5 text-green-500" />;
    default: return <FileText className="w-5 h-5 text-gray-500" />;
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileManager() {
  const { currentProject } = useApp();
  const [files] = useState<FileItem[]>(mockFiles);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const isGlobalView = !currentProject;
  const scope = isGlobalView ? 'global' : 'project';

  // Filter files based on scope, search, and category
  const filteredFiles = files.filter(file => {
    const matchesScope = file.scope === scope && (file.projectId === currentProject?.id || !file.projectId);
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || file.category === categoryFilter;
    return matchesScope && matchesSearch && matchesCategory;
  });

  // Get unique categories for current scope
  const categories = [...new Set(filteredFiles.map(f => f.category))];

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
  };

  const handleTemplateUpdate = (file: FileItem) => {
    // Mock implementation - would update project file with new template version
    // Template-Update für Datei (Debug): file.id
  };

  const renderFileList = () => (
    <div className="space-y-3">
      {filteredFiles.map(file => (
        <Card 
          key={file.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleFileSelect(file)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(file.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{file.name}</h4>
                    {file.isTemplate && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Vorlage
                      </Badge>
                    )}
                    {file.templateUpdatesAvailable && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Update
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">v{file.version}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{file.category}</Badge>
                    <span>•</span>
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.uploadedBy}</span>
                    <span>•</span>
                    <span>{new Date(file.uploadedAt).toLocaleDateString('de-DE')}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{file.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      <span>{file.downloads}</span>
                    </div>
                    <div className="flex gap-1">
                      {file.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.templateUpdatesAvailable && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTemplateUpdate(file);
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Vorschau
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Herunterladen
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Share className="w-4 h-4 mr-2" />
                      Teilen
                    </DropdownMenuItem>
                    {scope === 'project' && (
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Als globale Vorlage
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Copy className="w-4 h-4 mr-2" />
                      Kopieren
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderFileGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredFiles.map(file => (
        <Card 
          key={file.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => handleFileSelect(file)}
        >
          <CardContent className="p-4">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                {getFileIcon(file.type)}
              </div>
              <h4 className="font-medium text-sm truncate">{file.name}</h4>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(file.size)}
              </div>
              <div className="flex justify-center gap-1">
                {file.isTemplate && (
                  <Badge variant="outline" className="text-xs">Vorlage</Badge>
                )}
                {file.templateUpdatesAvailable && (
                  <Badge variant="outline" className="text-orange-600 border-orange-200 text-xs">
                    Update
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isGlobalView ? 'Globale Dateien' : `Projekt-Dateien: ${currentProject?.name}`}
          </h2>
          <p className="text-muted-foreground">
            {isGlobalView 
              ? 'Vorlagen, Verträge und dokumentierte Workflows' 
              : 'Pläne, Verträge, Bescheide und Briefings'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FolderOpen className="w-4 h-4 mr-2" />
            Ordner
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Hochladen
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Dateien durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
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

            <div className="flex border rounded-md">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('list')}
              >
                Liste
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Kacheln
              </Button>
            </div>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Updates Banner */}
      {!isGlobalView && filteredFiles.some(f => f.templateUpdatesAvailable) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-800">Vorlagen-Updates verfügbar</h4>
                <p className="text-sm text-orange-700">
                  {filteredFiles.filter(f => f.templateUpdatesAvailable).length} Dateien basieren auf aktualisierten Vorlagen
                </p>
              </div>
              <Button variant="outline" size="sm">
                Alle aktualisieren
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List/Grid */}
      {viewMode === 'list' ? renderFileList() : renderFileGrid()}

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <FileText className="w-12 h-12 mx-auto mb-4" />
              <p>Keine Dateien gefunden</p>
              <p className="text-sm">Laden Sie Ihre erste Datei hoch oder passen Sie die Filter an</p>
            </div>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Datei hochladen
            </Button>
          </CardContent>
        </Card>
      )}

      {/* File Detail Drawer */}
      {selectedFile && (
        <Drawer open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DrawerContent className="max-h-[80vh]">
            <DrawerHeader>
              <DrawerTitle className="flex items-center gap-2">
                {getFileIcon(selectedFile.type)}
                {selectedFile.name}
                <Badge variant="outline">v{selectedFile.version}</Badge>
              </DrawerTitle>
            </DrawerHeader>
            
            <div className="p-6 space-y-6">
              {/* File Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Kategorie:</label>
                  <div>{selectedFile.category}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Größe:</label>
                  <div>{formatFileSize(selectedFile.size)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Hochgeladen von:</label>
                  <div>{selectedFile.uploadedBy}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Datum:</label>
                  <div>{new Date(selectedFile.uploadedAt).toLocaleDateString('de-DE')}</div>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div>
                <label className="text-sm font-medium">Tags:</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedFile.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>

              {/* Preview Area */}
              <div className="border rounded-lg p-4 bg-muted/30 min-h-[200px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <p>Vorschau wird geladen...</p>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="text-sm font-medium">Kommentare ({selectedFile.comments}):</label>
                <div className="mt-2 space-y-2">
                  <div className="p-2 border rounded text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="font-medium">Max Müller</span>
                      <span className="text-muted-foreground">vor 2 Std.</span>
                    </div>
                    <p>Lageplan ist aktuell und kann für RFQ verwendet werden</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Herunterladen
                  </Button>
                  <Button variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Teilen
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  {selectedFile.templateUpdatesAvailable && (
                    <Button variant="outline" className="text-orange-600 border-orange-200">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Template Update
                    </Button>
                  )}
                  {scope === 'project' && selectedFile.isTemplate !== true && (
                    <Button>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Als Vorlage veröffentlichen
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}