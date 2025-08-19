import React, { useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Wifi, WifiOff, Bell, BellOff, Users, Activity } from 'lucide-react';

interface RealTimeUpdate {
  id: string;
  type: 'EVENT_CREATED' | 'EVENT_UPDATED' | 'TASK_UPDATED' | 'TASK_MOVED' | 'USER_STATUS_CHANGED' | 'SYSTEM_NOTIFICATION';
  message: string;
  timestamp: Date;
  details?: any;
  severity?: 'info' | 'warning' | 'error' | 'success';
}

interface ConnectionStatus {
  connected: boolean;
  lastConnected?: Date;
  lastDisconnected?: Date;
  connectionAttempts: number;
  errorMessage?: string;
}

interface WebSocketStats {
  totalMessages: number;
  messagesPerMinute: number;
  activeConnections: number;
  lastActivity: Date;
}

export function RealTimeUpdates() {
  const [updates, setUpdates] = useState<RealTimeUpdate[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    connectionAttempts: 0,
  });
  const [webSocketStats, setWebSocketStats] = useState<WebSocketStats>({
    totalMessages: 0,
    messagesPerMinute: 0,
    activeConnections: 0,
    lastActivity: new Date(),
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoReconnect, setAutoReconnect] = useState(true);
  const [maxUpdates, setMaxUpdates] = useState(100);

  // WebSocket-Verbindung
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [reconnectTimeout, setReconnectTimeout] = useState<NodeJS.Timeout | null>(null);

  // WebSocket-URL aus Umgebungsvariablen oder Standard
  const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3001/events';

  // WebSocket-Verbindung herstellen
  const connectWebSocket = useCallback(() => {
    if (socket?.readyState === WebSocket.OPEN) {
      return; // Bereits verbunden
    }

    try {
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        console.log('WebSocket verbunden');
        setConnectionStatus(prev => ({
          ...prev,
          connected: true,
          lastConnected: new Date(),
          errorMessage: undefined,
        }));
        
        // Authentifizierung senden
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
          newSocket.send(JSON.stringify({
            type: 'authenticate',
            token: authToken,
          }));
        }
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Fehler beim Parsen der WebSocket-Nachricht:', error);
        }
      };

      newSocket.onclose = (event) => {
        console.log('WebSocket-Verbindung geschlossen:', event.code, event.reason);
        setConnectionStatus(prev => ({
          ...prev,
          connected: false,
          lastDisconnected: new Date(),
        }));

        // Automatische Wiederverbindung
        if (autoReconnect && event.code !== 1000) {
          const timeout = setTimeout(() => {
            setConnectionStatus(prev => ({
              ...prev,
              connectionAttempts: prev.connectionAttempts + 1,
            }));
            connectWebSocket();
          }, Math.min(1000 * Math.pow(2, connectionStatus.connectionAttempts), 30000));
          
          setReconnectTimeout(timeout);
        }
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket-Fehler:', error);
        setConnectionStatus(prev => ({
          ...prev,
          errorMessage: 'Verbindungsfehler aufgetreten',
        }));
      };

      setSocket(newSocket);
    } catch (error) {
      console.error('Fehler beim Erstellen der WebSocket-Verbindung:', error);
      setConnectionStatus(prev => ({
        ...prev,
        errorMessage: 'Verbindung konnte nicht hergestellt werden',
      }));
    }
  }, [wsUrl, autoReconnect, connectionStatus.connectionAttempts]);

  // WebSocket-Nachrichten verarbeiten
  const handleWebSocketMessage = useCallback((data: any) => {
    const update: RealTimeUpdate = {
      id: `update-${Date.now()}-${Math.random()}`,
      type: data.type,
      message: getUpdateMessage(data),
      timestamp: new Date(),
      details: data,
      severity: getUpdateSeverity(data.type),
    };

    setUpdates(prev => {
      const newUpdates = [update, ...prev];
      // Maximale Anzahl von Updates beibehalten
      return newUpdates.slice(0, maxUpdates);
    });

    // Statistiken aktualisieren
    setWebSocketStats(prev => ({
      ...prev,
      totalMessages: prev.totalMessages + 1,
      lastActivity: new Date(),
    }));

    // Browser-Benachrichtigung anzeigen (falls aktiviert)
    if (notificationsEnabled && data.type !== 'SYSTEM_NOTIFICATION') {
      showBrowserNotification(update);
    }
  }, [notificationsEnabled, maxUpdates]);

  // Update-Nachricht generieren
  const getUpdateMessage = (data: any): string => {
    switch (data.type) {
      case 'EVENT_CREATED':
        return `Neues Event erstellt: ${data.event?.name || 'Unbekanntes Event'}`;
      case 'EVENT_UPDATED':
        return `Event aktualisiert: ${data.event?.name || 'Unbekanntes Event'}`;
      case 'TASK_UPDATED':
        return `Task aktualisiert: ${data.task?.title || 'Unbekannte Task'}`;
      case 'TASK_MOVED':
        return `Task verschoben: ${data.taskId}`;
      case 'USER_STATUS_CHANGED':
        return `Benutzer-Status geändert: ${data.userId}`;
      case 'SYSTEM_NOTIFICATION':
        return data.message || 'System-Benachrichtigung';
      default:
        return `Unbekannter Update-Typ: ${data.type}`;
    }
  };

  // Update-Schweregrad bestimmen
  const getUpdateSeverity = (type: string): 'info' | 'warning' | 'error' | 'success' => {
    switch (type) {
      case 'EVENT_CREATED':
      case 'TASK_UPDATED':
        return 'success';
      case 'USER_STATUS_CHANGED':
        return 'info';
      case 'SYSTEM_NOTIFICATION':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Browser-Benachrichtigung anzeigen
  const showBrowserNotification = (update: RealTimeUpdate) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    new Notification('Event Manager Update', {
      body: update.message,
      icon: '/favicon.ico',
      tag: update.id,
    });
  };

  // Benachrichtigungen aktivieren
  const enableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('Browser-Benachrichtigungen werden nicht unterstützt');
      return;
    }

    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    } else if (Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  };

  // Benachrichtigungen deaktivieren
  const disableNotifications = () => {
    setNotificationsEnabled(false);
  };

  // Updates löschen
  const clearUpdates = () => {
    setUpdates([]);
  };

  // Spezifischen Update löschen
  const removeUpdate = (id: string) => {
    setUpdates(prev => prev.filter(update => update.id !== id));
  };

  // WebSocket-Statistiken zurücksetzen
  const resetStats = () => {
    setWebSocketStats({
      totalMessages: 0,
      messagesPerMinute: 0,
      activeConnections: 0,
      lastActivity: new Date(),
    });
  };

  // Verbindung manuell trennen
  const disconnect = () => {
    if (socket) {
      socket.close(1000, 'Manuell getrennt');
    }
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      setReconnectTimeout(null);
    }
  };

  // Verbindung manuell herstellen
  const connect = () => {
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      setReconnectTimeout(null);
    }
    connectWebSocket();
  };

  // Nachrichten pro Minute berechnen
  useEffect(() => {
    const interval = setInterval(() => {
      const oneMinuteAgo = new Date(Date.now() - 60000);
      const recentMessages = updates.filter(update => update.timestamp > oneMinuteAgo).length;
      
      setWebSocketStats(prev => ({
        ...prev,
        messagesPerMinute: recentMessages,
      }));
    }, 60000);

    return () => clearInterval(interval);
  }, [updates]);

  // WebSocket-Verbindung beim Mount herstellen
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [connectWebSocket]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [socket, reconnectTimeout]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-Time Updates</h1>
          <p className="text-muted-foreground">
            Live-Updates und WebSocket-Verbindungsstatus
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            onClick={notificationsEnabled ? disableNotifications : enableNotifications}
          >
            {notificationsEnabled ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
            {notificationsEnabled ? 'Benachrichtigungen aktiv' : 'Benachrichtigungen deaktivieren'}
          </Button>
          <Button variant="outline" onClick={clearUpdates}>
            Updates löschen
          </Button>
        </div>
      </div>

      {/* Verbindungsstatus */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Verbindungsstatus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {connectionStatus.connected ? (
                <Wifi className="h-5 w-5 text-green-600" />
              ) : (
                <WifiOff className="h-5 w-5 text-red-600" />
              )}
              <span className={connectionStatus.connected ? 'text-green-600' : 'text-red-600'}>
                {connectionStatus.connected ? 'Verbunden' : 'Nicht verbunden'}
              </span>
            </div>
            
            {connectionStatus.connected ? (
              <Button variant="outline" size="sm" onClick={disconnect}>
                Trennen
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={connect}>
                Verbinden
              </Button>
            )}
          </div>

          {connectionStatus.lastConnected && (
            <div className="text-sm text-muted-foreground">
              Letzte Verbindung: {connectionStatus.lastConnected.toLocaleString('de-DE')}
            </div>
          )}

          {connectionStatus.lastDisconnected && (
            <div className="text-sm text-muted-foreground">
              Letzte Trennung: {connectionStatus.lastDisconnected.toLocaleString('de-DE')}
            </div>
          )}

          {connectionStatus.errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{connectionStatus.errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoReconnect}
                onChange={(e) => setAutoReconnect(e.target.checked)}
                className="rounded"
              />
              Automatische Wiederverbindung
            </label>
          </div>
        </CardContent>
      </Card>

      {/* WebSocket-Statistiken */}
      <Card>
        <CardHeader>
          <CardTitle>WebSocket-Statistiken</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{webSocketStats.totalMessages}</div>
              <div className="text-sm text-muted-foreground">Gesamt-Nachrichten</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{webSocketStats.messagesPerMinute}</div>
              <div className="text-sm text-muted-foreground">Nachrichten/Minute</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{webSocketStats.activeConnections}</div>
              <div className="text-sm text-muted-foreground">Aktive Verbindungen</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {webSocketStats.lastActivity.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="text-sm text-muted-foreground">Letzte Aktivität</div>
            </div>
          </div>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={resetStats}>
              Statistiken zurücksetzen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live-Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Live-Updates</CardTitle>
          <CardDescription>
            Echtzeit-Updates von allen Services
          </CardDescription>
        </CardHeader>
        <CardContent>
          {updates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Updates empfangen
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className={`p-3 rounded-lg border ${
                    update.severity === 'error' ? 'border-red-200 bg-red-50' :
                    update.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    update.severity === 'success' ? 'border-green-200 bg-green-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {update.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {update.timestamp.toLocaleTimeString('de-DE')}
                        </span>
                      </div>
                      <p className="text-sm">{update.message}</p>
                      {update.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            Details anzeigen
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-white rounded overflow-auto">
                            {JSON.stringify(update.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUpdate(update.id)}
                      className="text-muted-foreground hover:text-red-600"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Einstellungen */}
      <Card>
        <CardHeader>
          <CardTitle>Einstellungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Maximale Anzahl Updates</Label>
              <p className="text-sm text-muted-foreground">
                Begrenzt die Anzahl der gespeicherten Updates
              </p>
            </div>
            <Input
              type="number"
              value={maxUpdates}
              onChange={(e) => setMaxUpdates(parseInt(e.target.value) || 100)}
              className="w-24"
              min="10"
              max="1000"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}