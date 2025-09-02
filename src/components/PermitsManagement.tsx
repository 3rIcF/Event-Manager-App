import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Upload,
  User,
  Building,
  Shield,
  Zap,
  Car,
  Volume2,
  Utensils
} from 'lucide-react';

interface Permit {
  id: string;
  name: string;
  category: string;
  authority: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'requires_action';
  deadline: string;
  submitDate?: string;
  approvalDate?: string;
  responsible: string;
  documents: string[];
  requirements: string[];
  conditions?: string[];
  priority: 'high' | 'medium' | 'low';
  estimatedDuration: number; // in days
}

const mockPermits: Permit[] = [
  {
    id: '1',
    name: 'Veranstaltungsanzeige',
    category: 'Grundgenehmigung',
    authority: 'Ordnungsamt München',
    status: 'approved',
    deadline: '2025-08-01',
    submitDate: '2025-07-15',
    approvalDate: '2025-07-28',
    responsible: 'Max Müller',
    documents: ['Konzept', 'Lageplan', 'Versicherungsnachweis'],
    requirements: ['Veranstaltungskonzept', 'Lageplan 1:500', 'Haftpflichtversicherung'],
    priority: 'high',
    estimatedDuration: 14
  },
  {
    id: '2',
    name: 'Baustelleneinrichtung',
    category: 'Baugenehmigung',
    authority: 'Bauamt München',
    status: 'submitted',
    deadline: '2025-08-15',
    submitDate: '2025-08-05',
    responsible: 'Anna Schmidt',
    documents: ['Bauplan', 'Statik'],
    requirements: ['Aufbauplan', 'Statische Berechnung', 'Baustellenverordnung'],
    priority: 'high',
    estimatedDuration: 21
  },
  {
    id: '3',
    name: 'Sondergenehmigung Lärm',
    category: 'Umwelt',
    authority: 'Umweltamt München',
    status: 'requires_action',
    deadline: '2025-08-20',
    responsible: 'Peter Wagner',
    documents: ['Lärmgutachten'],
    requirements: ['Schallschutzkonzept', 'Lärmprognose', 'Anwohnerinformation'],
    conditions: ['Max. 65 dB(A) bis 22:00 Uhr', 'Aufbau nur werktags 7-19 Uhr'],
    priority: 'medium',
    estimatedDuration: 10
  },
  {
    id: '4',
    name: 'Verkehrssicherung',
    category: 'Verkehr',
    authority: 'Verkehrsamt München',
    status: 'pending',
    deadline: '2025-09-01',
    responsible: 'Lisa Weber',
    documents: [],
    requirements: ['Verkehrszeichenplan', 'Absperrkonzept', 'Umleitungsplan'],
    priority: 'medium',
    estimatedDuration: 7
  },
  {
    id: '5',
    name: 'Gastronomie-Konzession',
    category: 'Gewerbe',
    authority: 'Gewerbeamt München',
    status: 'pending',
    deadline: '2025-08-30',
    responsible: 'Thomas Klein',
    documents: [],
    requirements: ['Gewerbeanmeldung', 'Hygienekonzept', 'Personalschulung'],
    priority: 'low',
    estimatedDuration: 14
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800';
    case 'submitted': return 'bg-blue-100 text-blue-800';
    case 'requires_action': return 'bg-yellow-100 text-yellow-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'submitted': return <Clock className="w-4 h-4 text-blue-500" />;
    case 'requires_action': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'rejected': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'pending': return <FileText className="w-4 h-4 text-gray-500" />;
    default: return <FileText className="w-4 h-4 text-gray-500" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Grundgenehmigung': return <Building className="w-4 h-4" />;
    case 'Baugenehmigung': return <Building className="w-4 h-4" />;
    case 'Umwelt': return <Volume2 className="w-4 h-4" />;
    case 'Verkehr': return <Car className="w-4 h-4" />;
    case 'Sicherheit': return <Shield className="w-4 h-4" />;
    case 'Technik': return <Zap className="w-4 h-4" />;
    case 'Gewerbe': return <Utensils className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function PermitsManagement() {
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  const getTimeUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const overallProgress = (mockPermits.filter(p => p.status === 'approved').length / mockPermits.length) * 100;
  const criticalCount = mockPermits.filter(p => getTimeUntilDeadline(p.deadline) <= 7 && p.status !== 'approved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Genehmigungen & Auflagen</h2>
          <p className="text-muted-foreground">
            Überblick über alle erforderlichen Genehmigungen für das Event
          </p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Zeitplan
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Neuer Antrag
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{mockPermits.length}</div>
                <div className="text-sm text-muted-foreground">Gesamt</div>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {mockPermits.filter(p => p.status === 'approved').length}
                </div>
                <div className="text-sm text-muted-foreground">Genehmigt</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{criticalCount}</div>
                <div className="text-sm text-muted-foreground">Kritisch</div>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{Math.round(overallProgress)}%</div>
                <div className="text-sm text-muted-foreground">Fortschritt</div>
              </div>
              <div className="w-8 h-8 flex items-center justify-center">
                <Progress value={overallProgress} className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permits Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {['pending', 'submitted', 'requires_action', 'approved', 'rejected'].map(status => {
          const statusPermits = mockPermits.filter(permit => permit.status === status);
          const statusLabels = {
            pending: 'Vorbereitung',
            submitted: 'Eingereicht',
            requires_action: 'Nachbesserung',
            approved: 'Genehmigt',
            rejected: 'Abgelehnt'
          };

          return (
            <Card key={status} className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{statusLabels[status as keyof typeof statusLabels]}</span>
                  <Badge variant="outline">{statusPermits.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statusPermits.map(permit => {
                  const daysLeft = getTimeUntilDeadline(permit.deadline);
                  
                  return (
                    <div 
                      key={permit.id}
                      className="border rounded-lg p-3 cursor-pointer hover:shadow-sm transition-shadow"
                      onClick={() => {
                        setSelectedPermit(permit);
                        setShowDetailDialog(true);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(permit.category)}
                          <span className="text-sm font-medium">{permit.name}</span>
                        </div>
                        <Badge className={getPriorityColor(permit.priority)}>
                          {permit.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-2">
                        {permit.authority}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className={daysLeft <= 7 ? 'text-red-600' : 'text-muted-foreground'}>
                            {daysLeft > 0 ? `${daysLeft} Tage` : 'Überfällig'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(permit.status)}
                        </div>
                      </div>

                      {permit.conditions && permit.conditions.length > 0 && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-xs">
                          <div className="font-medium text-yellow-800">Auflagen:</div>
                          <div className="text-yellow-700">{permit.conditions[0]}</div>
                          {permit.conditions.length > 1 && (
                            <div className="text-yellow-600">+{permit.conditions.length - 1} weitere</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          {selectedPermit && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedPermit.category)}
                  {selectedPermit.name}
                  <Badge className={getStatusColor(selectedPermit.status)}>
                    {selectedPermit.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Behörde:</label>
                    <div className="text-sm text-muted-foreground">{selectedPermit.authority}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Verantwortlich:</label>
                    <div className="text-sm text-muted-foreground">{selectedPermit.responsible}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Frist:</label>
                    <div className="text-sm text-muted-foreground">{selectedPermit.deadline}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priorität:</label>
                    <Badge className={getPriorityColor(selectedPermit.priority)}>
                      {selectedPermit.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Erforderliche Dokumente:</label>
                  <div className="mt-2 space-y-2">
                    {selectedPermit.requirements.map((req, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{req}</span>
                        <div className="flex items-center gap-2">
                          {selectedPermit.documents.includes(req.split(' ')[0]) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Button size="sm" variant="outline">
                              <Upload className="w-4 h-4 mr-1" />
                              Upload
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedPermit.conditions && selectedPermit.conditions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Auflagen & Bedingungen:</label>
                    <div className="mt-2 p-3 bg-yellow-50 rounded">
                      {selectedPermit.conditions.map((condition, index) => (
                        <div key={index} className="text-sm text-yellow-800">
                          • {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">Notizen & Kommentare:</label>
                  <Textarea
                    placeholder="Notizen zu diesem Genehmigungsverfahren..."
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                    Schließen
                  </Button>
                  <Button>
                    Status aktualisieren
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}