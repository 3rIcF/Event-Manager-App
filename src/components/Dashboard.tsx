import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Package, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';

const mockEvents = [
  { id: 1, name: 'Stadtfest München', status: 'Planung', date: '2025-09-15', location: 'München Zentrum', progress: 65 },
  { id: 2, name: 'Firmen-Event BMW', status: 'Genehmigung', date: '2025-10-20', location: 'BMW Welt', progress: 40 },
  { id: 3, name: 'Weihnachtsmarkt', status: 'Onsite', date: '2025-12-01', location: 'Marienplatz', progress: 90 },
  { id: 4, name: 'Konzert Open Air', status: 'Idee', date: '2026-06-10', location: 'Olympiapark', progress: 15 },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Idee': return 'bg-gray-100 text-gray-800';
    case 'Planung': return 'bg-blue-100 text-blue-800';
    case 'Genehmigung': return 'bg-yellow-100 text-yellow-800';
    case 'Onsite': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 seit letztem Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene RFQs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">5 Antworten ausstehend</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kritische Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">3 überfällig</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€2.4M</div>
            <p className="text-xs text-muted-foreground">78% Budget genutzt</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Aktuelle Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{event.name}</h3>
                    <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                    <span>{event.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{event.progress}%</div>
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full" 
                        style={{ width: `${event.progress}%` }}
                      />
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Details</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Anstehende Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Bauantrag Stadtfest</span>
                <Badge variant="destructive">Morgen</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">RFQ Zelte BMW Event</span>
                <Badge variant="outline">3 Tage</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sicherheitskonzept</span>
                <Badge variant="outline">1 Woche</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Konflikte & Warnungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Slot-Konflikt</div>
                  <div className="text-xs text-muted-foreground">Anlieferung BMW Event überschneidet sich</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Lager knapp</div>
                  <div className="text-xs text-muted-foreground">Bauzäune nur noch 50% verfügbar</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Heute erledigen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Angebote BMW Event vergleichen</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Briefing Sicherheitsdienst</span>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Slot-Bestätigungen versenden</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}