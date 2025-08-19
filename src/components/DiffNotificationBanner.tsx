import React from 'react';
import { useData } from './DataContext';
import { useApp } from './AppContext';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  X, 
  Eye, 
  ArrowRight,
  Package,
  Users,
  History
} from 'lucide-react';

export function DiffNotificationBanner() {
  const { currentProject } = useApp();
  const { diffNotifications, handleDiffAction, globalMaterials } = useData();
  const [selectedNotification, setSelectedNotification] = React.useState<string | null>(null);

  if (!currentProject) return null;

  const pendingNotifications = diffNotifications.filter(
    n => n.projectId === currentProject.id && n.status === 'pending'
  );

  if (pendingNotifications.length === 0) return null;

  const handleAccept = (notificationId: string) => {
    handleDiffAction(notificationId, 'accept');
  };

  const handleIgnore = (notificationId: string) => {
    handleDiffAction(notificationId, 'ignore');
  };

  const getEntityName = (notification: any) => {
    if (notification.entityType === 'material') {
      const material = globalMaterials.find(m => m.id === notification.globalEntityId);
      return material?.name || 'Unbekanntes Material';
    }
    return 'Unbekannte Entität';
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'material': return <Package className="w-4 h-4" />;
      case 'supplier': return <Users className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const selectedNotificationData = selectedNotification 
    ? pendingNotifications.find(n => n.id === selectedNotification)
    : null;

  return (
    <>
      <Card className="border-orange-200 bg-orange-50 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <div className="flex-1">
              <h4 className="font-medium text-orange-800">
                Stammdaten-Updates verfügbar
              </h4>
              <p className="text-sm text-orange-700">
                {pendingNotifications.length} Entitäten wurden global aktualisiert und weichen von Ihren Projekt-Overrides ab
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => pendingNotifications.forEach(n => handleAccept(n.id))}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Alle übernehmen
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => pendingNotifications.forEach(n => handleIgnore(n.id))}
              >
                <X className="w-4 h-4 mr-2" />
                Alle ignorieren
              </Button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {pendingNotifications.slice(0, 3).map(notification => (
              <div 
                key={notification.id}
                className="flex items-center justify-between p-3 bg-white rounded border border-orange-200"
              >
                <div className="flex items-center gap-3">
                  {getEntityIcon(notification.entityType)}
                  <div>
                    <h5 className="font-medium text-sm">{getEntityName(notification)}</h5>
                    <p className="text-xs text-muted-foreground">
                      {notification.changes.length} Feld(er) geändert
                    </p>
                  </div>
                  <Badge variant="outline" size="sm">
                    {notification.entityType}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedNotification(notification.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Vergleichen
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAccept(notification.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Übernehmen
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleIgnore(notification.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {pendingNotifications.length > 3 && (
              <div className="text-center p-2">
                <Button variant="ghost" size="sm">
                  {pendingNotifications.length - 3} weitere anzeigen
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Diff Comparison Dialog */}
      {selectedNotificationData && (
        <Dialog 
          open={!!selectedNotification} 
          onOpenChange={() => setSelectedNotification(null)}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Änderungen vergleichen: {getEntityName(selectedNotificationData)}
                <Badge variant="outline">{selectedNotificationData.entityType}</Badge>
              </DialogTitle>
              <DialogDescription>
                Vergleichen Sie die globalen Änderungen mit Ihren Projekt-Overrides.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 overflow-y-auto max-h-[60vh]">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Globale Änderung erkannt</h4>
                  <Badge variant="outline">
                    {new Date(selectedNotificationData.createdAt).toLocaleDateString('de-DE')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Die globalen Stammdaten wurden aktualisiert. Ihr Projekt hat Overrides für diese Entität, 
                  die möglicherweise mit den neuen globalen Werten in Konflikt stehen.
                </p>
              </div>

              <Tabs defaultValue="changes" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="changes">Änderungen</TabsTrigger>
                  <TabsTrigger value="impact">Auswirkungen</TabsTrigger>
                </TabsList>

                <TabsContent value="changes" className="space-y-4">
                  <div className="space-y-4">
                    {selectedNotificationData.changes.map((change, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-medium">{change.field}</h5>
                          <Badge variant="outline">Feld geändert</Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Alter Wert (Global)
                            </label>
                            <div className="p-3 bg-red-50 border border-red-200 rounded">
                              <code className="text-sm">
                                {typeof change.oldValue === 'object' 
                                  ? JSON.stringify(change.oldValue, null, 2)
                                  : String(change.oldValue)
                                }
                              </code>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">
                              Neuer Wert (Global)
                            </label>
                            <div className="p-3 bg-green-50 border border-green-200 rounded">
                              <code className="text-sm">
                                {typeof change.newValue === 'object' 
                                  ? JSON.stringify(change.newValue, null, 2)
                                  : String(change.newValue)
                                }
                              </code>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center my-3">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">
                              Ihr Projekt-Override
                            </span>
                          </div>
                          <code className="text-sm">
                            {/* Mock project override value */}
                            {change.field === 'quantity' ? '150 (Override)' : 'Projekt-spezifischer Wert'}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="impact" className="space-y-4">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">
                        Bei "Übernehmen"
                      </h5>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Projekt-Override wird entfernt</li>
                        <li>• Globale Werte werden übernommen</li>
                        <li>• Laufende RFQs/POs bleiben unverändert</li>
                        <li>• Änderung wird im Audit-Log festgehalten</li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">
                        Bei "Ignorieren"
                      </h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Projekt-Override bleibt bestehen</li>
                        <li>• Globale Änderung wird nicht übernommen</li>
                        <li>• Differenz bleibt sichtbar in Reports</li>
                        <li>• Kann später noch übernommen werden</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-medium text-yellow-800 mb-2">
                        Betroffene Bereiche
                      </h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• BOM-Kalkulation und Mengenplanung</li>
                        <li>• Lieferanten-Matching und Angebote</li>
                        <li>• Logistik-Slots und Zeitplanung</li>
                        <li>• Budget-Tracking und Nachkalkulation</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator />

              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setSelectedNotification(null)}
                >
                  Schließen
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      handleIgnore(selectedNotificationData.id);
                      setSelectedNotification(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Ignorieren
                  </Button>
                  <Button 
                    onClick={() => {
                      handleAccept(selectedNotificationData.id);
                      setSelectedNotification(null);
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Übernehmen
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}