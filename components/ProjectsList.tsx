import React, { useState } from 'react';
import { useApp } from './AppContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Plus, 
  Star,
  Copy,
  Archive,
  Trash2,
  MapPin,
  Calendar,
  User,
  Euro,
  FolderOpen
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'idea': return 'bg-gray-100 text-gray-800';
    case 'planning': return 'bg-blue-100 text-blue-800';
    case 'approval': return 'bg-yellow-100 text-yellow-800';
    case 'setup': return 'bg-orange-100 text-orange-800';
    case 'live': return 'bg-green-100 text-green-800';
    case 'teardown': return 'bg-purple-100 text-purple-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'idea': return 'Idee';
    case 'planning': return 'Planung';
    case 'approval': return 'Genehmigung';
    case 'setup': return 'Aufbau';
    case 'live': return 'Live';
    case 'teardown': return 'Abbau';
    case 'closed': return 'Abgeschlossen';
    default: return status;
  }
};

interface ProjectsListProps {
  onNewProject: () => void;
}

export function ProjectsList({ onNewProject }: ProjectsListProps) {
  const { projects, setCurrentProject } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [favorites, setFavorites] = useState<string[]>(['1']); // Mock favorites

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const toggleFavorite = (projectId: string) => {
    setFavorites(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getDaysUntilStart = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    return Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getProjectProgress = (project: any) => {
    // Mock progress calculation based on status
    switch (project.status) {
      case 'idea': return 5;
      case 'planning': return 25;
      case 'approval': return 50;
      case 'setup': return 75;
      case 'live': return 90;
      case 'teardown': return 95;
      case 'closed': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projekte</h2>
          <p className="text-muted-foreground">
            Verwalten Sie alle Event-Projekte an einem Ort
          </p>
        </div>
        <Button onClick={onNewProject}>
          <Plus className="w-4 h-4 mr-2" />
          Neues Projekt
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Projekte durchsuchen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="idea">Idee</SelectItem>
                <SelectItem value="planning">Planung</SelectItem>
                <SelectItem value="approval">Genehmigung</SelectItem>
                <SelectItem value="setup">Aufbau</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="teardown">Abbau</SelectItem>
                <SelectItem value="closed">Abgeschlossen</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sortieren nach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="startDate">Startdatum</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Erweiterte Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const daysUntilStart = getDaysUntilStart(project.startDate);
          const progress = getProjectProgress(project);
          const isFavorite = favorites.includes(project.id);

          return (
            <Card 
              key={project.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setCurrentProject(project)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg leading-tight">{project.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(project.status)} size="sm">
                        {getStatusLabel(project.status)}
                      </Badge>
                      {isFavorite && (
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
                      <DropdownMenuItem onClick={() => toggleFavorite(project.id)}>
                        <Star className="w-4 h-4 mr-2" />
                        {isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplizieren
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Archive className="w-4 h-4 mr-2" />
                        Archivieren
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Löschen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{project.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(project.startDate).toLocaleDateString('de-DE')} - {new Date(project.endDate).toLocaleDateString('de-DE')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{project.responsible}</span>
                  </div>

                  {project.budget && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Euro className="w-4 h-4" />
                      <span>€{project.budget.toLocaleString('de-DE')}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Fortschritt</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {daysUntilStart >= 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {daysUntilStart === 0 ? 'Heute' : 
                       daysUntilStart === 1 ? 'Morgen' : 
                       `in ${daysUntilStart} Tagen`}
                    </span>
                    {daysUntilStart <= 7 && daysUntilStart > 0 && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Bald
                      </Badge>
                    )}
                  </div>
                )}

                {project.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {project.description}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <FolderOpen className="w-12 h-12 mx-auto mb-4" />
              <p>Keine Projekte gefunden</p>
              <p className="text-sm">Versuchen Sie andere Suchbegriffe oder erstellen Sie ein neues Projekt</p>
            </div>
            <Button onClick={onNewProject}>
              <Plus className="w-4 h-4 mr-2" />
              Neues Projekt erstellen
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}