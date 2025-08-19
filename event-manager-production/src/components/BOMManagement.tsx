import React, { useState } from 'react';

interface BOMItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  supplier?: string;
  status: 'planned' | 'quoted' | 'ordered' | 'delivered' | 'installed';
  phase: 'setup' | 'show' | 'teardown';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  notes?: string;
  deliveryDate?: string;
  specifications?: string;
  alternatives?: string[];
}

const mockBOMItems: BOMItem[] = [
  {
    id: '1',
    name: 'Bauzaun Element 3,5m',
    category: 'Absperrung',
    quantity: 150,
    unit: 'Stk',
    unitPrice: 8.50,
    totalPrice: 1275,
    supplier: 'EventZaun GmbH',
    status: 'ordered',
    phase: 'setup',
    priority: 'high',
    location: 'Perimeter Gesamt',
    deliveryDate: '2025-09-14',
    specifications: 'Feuerverzinkt, 3,5m x 2m, mit Betonfüßen',
    alternatives: ['Mobilzaun 3m', 'Gitterzaun temporär']
  },
  {
    id: '2',
    name: 'LED Scheinwerfer RGB 50W',
    category: 'Beleuchtung',
    quantity: 24,
    unit: 'Stk',
    unitPrice: 45.00,
    totalPrice: 1080,
    supplier: 'LightTech Pro',
    status: 'delivered',
    phase: 'show',
    priority: 'medium',
    location: 'Hauptbühne',
    deliveryDate: '2025-09-13',
    specifications: 'DMX-steuerbar, IP65, RGB+W'
  },
  {
    id: '3',
    name: 'Bierzeltgarnitur komplett',
    category: 'Mobiliar',
    quantity: 50,
    unit: 'Set',
    unitPrice: 15.00,
    totalPrice: 750,
    supplier: 'Gastro Events',
    status: 'quoted',
    phase: 'show',
    priority: 'medium',
    location: 'VIP-Bereich',
    specifications: 'Tisch 220cm + 2 Bänke, Holz, wetterfest'
  },
  {
    id: '4',
    name: 'Stromverteiler 63A',
    category: 'Elektro',
    quantity: 8,
    unit: 'Stk',
    unitPrice: 125.00,
    totalPrice: 1000,
    supplier: 'ElektroService München',
    status: 'planned',
    phase: 'setup',
    priority: 'critical',
    location: 'Diverse Standorte',
    specifications: 'CEE 63A, 5-polig, IP67, mit FI-Schutz'
  },
  {
    id: '5',
    name: 'Bühne Modulsystem 8x6m',
    category: 'Bühne',
    quantity: 1,
    unit: 'Stk',
    unitPrice: 2500.00,
    totalPrice: 2500,
    supplier: 'StageTech Solutions',
    status: 'installed',
    phase: 'show',
    priority: 'critical',
    location: 'Hauptbühne',
    deliveryDate: '2025-09-12',
    specifications: 'Höhe 1,2m, TÜV-geprüft, mit Treppenaufgang'
  }
];

export function BOMManagement() {
  const [bomItems, setBomItems] = useState<BOMItem[]>(mockBOMItems);
  const [viewMode, setViewMode] = useState<'categories' | 'phases' | 'suppliers' | 'timeline'>('categories');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPhase, setFilterPhase] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<BOMItem | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planned': 'bg-gray-100 text-gray-800',
      'quoted': 'bg-yellow-100 text-yellow-800',
      'ordered': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'installed': 'bg-green-200 text-green-900'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'low': 'bg-gray-100 text-gray-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'setup': 'bg-blue-100 text-blue-800',
      'show': 'bg-green-100 text-green-800',
      'teardown': 'bg-orange-100 text-orange-800'
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  const updateItemStatus = (itemId: string, newStatus: BOMItem['status']) => {
    setBomItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status: newStatus } : item
    ));
  };

  const filteredItems = bomItems.filter(item => {
    const categoryMatch = filterCategory === 'all' || item.category === filterCategory;
    const phaseMatch = filterPhase === 'all' || item.phase === filterPhase;
    const statusMatch = filterStatus === 'all' || item.status === filterStatus;
    return categoryMatch && phaseMatch && statusMatch;
  });

  const categories = Array.from(new Set(bomItems.map(item => item.category)));
  const suppliers = Array.from(new Set(bomItems.map(item => item.supplier).filter(Boolean)));

  const getTotalByStatus = () => {
    const totals = bomItems.reduce((acc, item) => {
      const price = item.totalPrice || 0;
      if (!acc[item.status]) acc[item.status] = 0;
      acc[item.status] += price;
      return acc;
    }, {} as Record<string, number>);
    return totals;
  };

  const renderCategoriesView = () => {
    const categoryGroups = categories.map(category => ({
      category,
      items: filteredItems.filter(item => item.category === category),
      total: filteredItems
        .filter(item => item.category === category)
        .reduce((sum, item) => sum + (item.totalPrice || 0), 0)
    }));

    return (
      <div className="space-y-6">
        {categoryGroups.map(group => (
          <div key={group.category} className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{group.category}</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{group.items.length} Positionen</span>
                  <span className="text-sm font-medium text-gray-900">
                    €{group.total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-xs text-gray-500">
                    <tr>
                      <th className="text-left py-2">Position</th>
                      <th className="text-left py-2">Menge</th>
                      <th className="text-left py-2">Preis</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Phase</th>
                      <th className="text-left py-2">Lieferant</th>
                      <th className="text-left py-2">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {group.items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            {item.specifications && (
                              <p className="text-xs text-gray-500">{item.specifications}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-sm">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-3">
                          <div className="text-sm">
                            {item.unitPrice && (
                              <p>€{item.unitPrice.toFixed(2)}/{item.unit}</p>
                            )}
                            {item.totalPrice && (
                              <p className="font-medium">€{item.totalPrice.toLocaleString()}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPhaseColor(item.phase)}`}>
                            {item.phase}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {item.supplier || '—'}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => setSelectedItem(item)}
                              className="text-blue-600 hover:text-blue-800 text-xs"
                            >
                              Details
                            </button>
                            <button className="text-green-600 hover:text-green-800 text-xs">
                              Bestellen
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSuppliersView = () => {
    const supplierGroups = suppliers.map(supplier => ({
      supplier,
      items: filteredItems.filter(item => item.supplier === supplier),
      total: filteredItems
        .filter(item => item.supplier === supplier)
        .reduce((sum, item) => sum + (item.totalPrice || 0), 0),
      categories: Array.from(new Set(filteredItems
        .filter(item => item.supplier === supplier)
        .map(item => item.category)))
    }));

    return (
      <div className="space-y-6">
        {supplierGroups.map(group => (
          <div key={group.supplier} className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.supplier}</h3>
                  <p className="text-sm text-gray-600">
                    {group.categories.join(', ')} • {group.items.length} Positionen
                  </p>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  €{group.total.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map(item => (
                  <div key={item.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm text-gray-900">{item.name}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>{item.quantity} {item.unit}</p>
                      {item.totalPrice && <p className="font-medium">€{item.totalPrice.toLocaleString()}</p>}
                      <p>{item.phase} • {item.priority}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimelineView = () => {
    const timelineItems = filteredItems
      .filter(item => item.deliveryDate)
      .sort((a, b) => new Date(a.deliveryDate!).getTime() - new Date(b.deliveryDate!).getTime());

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-6">Lieferzeitleiste</h3>
        <div className="space-y-4">
          {timelineItems.map(item => (
            <div key={item.id} className="flex items-center space-x-4 p-3 border-l-4 border-blue-200">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'delivered' ? 'bg-green-500' :
                  item.status === 'ordered' ? 'bg-blue-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.supplier} • {item.quantity} {item.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{item.deliveryDate}</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderItemDetail = () => {
    if (!selectedItem) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedItem(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Zurück
            </button>
            <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
          </div>
          
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedItem.status)}`}>
              {selectedItem.status}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedItem.priority)}`}>
              {selectedItem.priority}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Artikel-Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Kategorie:</span>
                    <p className="font-medium">{selectedItem.category}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Phase:</span>
                    <p className="font-medium">{selectedItem.phase}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Menge:</span>
                    <p className="font-medium">{selectedItem.quantity} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Standort:</span>
                    <p className="font-medium">{selectedItem.location || '—'}</p>
                  </div>
                </div>
                
                {selectedItem.specifications && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-gray-500">Spezifikationen:</span>
                    <p className="text-sm">{selectedItem.specifications}</p>
                  </div>
                )}
              </div>
            </div>

            {selectedItem.alternatives && selectedItem.alternatives.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Alternativen</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ul className="space-y-1">
                    {selectedItem.alternatives.map((alt, index) => (
                      <li key={index} className="text-sm">• {alt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Lieferant & Preise</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Lieferant:</span>
                  <p className="font-medium">{selectedItem.supplier || 'Noch nicht vergeben'}</p>
                </div>
                
                {selectedItem.unitPrice && (
                  <div>
                    <span className="text-sm text-gray-500">Einzelpreis:</span>
                    <p className="font-medium">€{selectedItem.unitPrice.toFixed(2)} / {selectedItem.unit}</p>
                  </div>
                )}
                
                {selectedItem.totalPrice && (
                  <div>
                    <span className="text-sm text-gray-500">Gesamtpreis:</span>
                    <p className="text-lg font-bold text-green-600">€{selectedItem.totalPrice.toLocaleString()}</p>
                  </div>
                )}

                {selectedItem.deliveryDate && (
                  <div>
                    <span className="text-sm text-gray-500">Liefertermin:</span>
                    <p className="font-medium">{selectedItem.deliveryDate}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Status-Management</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-700">Status aktualisieren:</label>
                  <select 
                    value={selectedItem.status}
                    onChange={(e) => updateItemStatus(selectedItem.id, e.target.value as BOMItem['status'])}
                    className="w-full border rounded px-3 py-2 mt-1"
                  >
                    <option value="planned">Geplant</option>
                    <option value="quoted">Angebot eingeholt</option>
                    <option value="ordered">Bestellt</option>
                    <option value="delivered">Geliefert</option>
                    <option value="installed">Installiert</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                    Angebot anfordern
                  </button>
                  <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                    Bestellen
                  </button>
                </div>
              </div>
            </div>

            {selectedItem.notes && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Notizen</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <p className="text-sm">{selectedItem.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (selectedItem) {
    return (
      <div className="p-6">
        {renderItemDetail()}
      </div>
    );
  }

  const statusTotals = getTotalByStatus();
  const grandTotal = Object.values(statusTotals).reduce((sum, value) => sum + value, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">BOM Management</h1>
          <p className="text-gray-600">Bill of Materials - Materialplanung und Beschaffung</p>
        </div>
        
        <button 
          onClick={() => setShowAddDialog(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Position hinzufügen
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Positionen gesamt</h3>
          <p className="text-2xl font-bold text-gray-900">{bomItems.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Gesamtwert</h3>
          <p className="text-2xl font-bold text-blue-600">€{grandTotal.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Bestellt</h3>
          <p className="text-2xl font-bold text-orange-600">
            {bomItems.filter(item => item.status === 'ordered').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Geliefert</h3>
          <p className="text-2xl font-bold text-green-600">
            {bomItems.filter(item => item.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Kritische Items</h3>
          <p className="text-2xl font-bold text-red-600">
            {bomItems.filter(item => item.priority === 'critical').length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            {(['categories', 'phases', 'suppliers', 'timeline'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  viewMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode === 'categories' ? 'Kategorien' :
                 mode === 'phases' ? 'Phasen' :
                 mode === 'suppliers' ? 'Lieferanten' : 'Timeline'}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Kategorie:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Alle</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Phase:</label>
            <select 
              value={filterPhase} 
              onChange={(e) => setFilterPhase(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Alle</option>
              <option value="setup">Setup</option>
              <option value="show">Show</option>
              <option value="teardown">Teardown</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Alle</option>
              <option value="planned">Geplant</option>
              <option value="quoted">Angebot</option>
              <option value="ordered">Bestellt</option>
              <option value="delivered">Geliefert</option>
              <option value="installed">Installiert</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'categories' && renderCategoriesView()}
      {viewMode === 'suppliers' && renderSuppliersView()}
      {viewMode === 'timeline' && renderTimelineView()}
      {viewMode === 'phases' && (
        <div className="text-center py-12 text-gray-500">
          Phasen-Ansicht wird implementiert...
        </div>
      )}
    </div>
  );
}