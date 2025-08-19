import React, { useState, useEffect } from 'react';

interface BudgetItem {
  id: string;
  category: string;
  subcategory: string;
  budgetedAmount: number;
  actualAmount: number;
  status: 'planned' | 'approved' | 'ordered' | 'paid' | 'overdue';
  vendor?: string;
  description: string;
  dueDate?: string;
  invoiceNumber?: string;
  notes?: string;
}

interface BudgetCategory {
  name: string;
  color: string;
  icon: string;
  subcategories: string[];
}

const budgetCategories: BudgetCategory[] = [
  {
    name: 'Technik',
    color: 'bg-blue-100 text-blue-800',
    icon: '🔧',
    subcategories: ['Sound & Licht', 'Bühne', 'Strom', 'Kameras', 'IT']
  },
  {
    name: 'Catering',
    color: 'bg-orange-100 text-orange-800', 
    icon: '🍽️',
    subcategories: ['VIP Catering', 'Staff Verpflegung', 'Getränke', 'Equipment']
  },
  {
    name: 'Personal',
    color: 'bg-green-100 text-green-800',
    icon: '👥',
    subcategories: ['Security', 'Technik', 'Catering', 'Reinigung', 'Management']
  },
  {
    name: 'Marketing',
    color: 'bg-purple-100 text-purple-800',
    icon: '📢',
    subcategories: ['Werbematerial', 'Social Media', 'PR', 'Sponsoring']
  },
  {
    name: 'Logistik',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '🚛',
    subcategories: ['Transport', 'Lager', 'Aufbau', 'Abbau']
  },
  {
    name: 'Sonstiges',
    color: 'bg-gray-100 text-gray-800',
    icon: '📋',
    subcategories: ['Versicherung', 'Genehmigungen', 'Notfälle', 'Reserve']
  }
];

const mockBudgetItems: BudgetItem[] = [
  {
    id: '1',
    category: 'Technik',
    subcategory: 'Sound & Licht',
    budgetedAmount: 45000,
    actualAmount: 42000,
    status: 'paid',
    vendor: 'TechSound Pro',
    description: 'Bühnentechnik & Sound-System',
    dueDate: '2025-09-10',
    invoiceNumber: 'TS-2025-001',
    notes: 'Rechnung erhalten und bezahlt'
  },
  {
    id: '2',
    category: 'Catering',
    subcategory: 'VIP Catering',
    budgetedAmount: 15000,
    actualAmount: 16500,
    status: 'overdue',
    vendor: 'Gourmet Events GmbH',
    description: 'VIP-Bereich Catering für 3 Tage',
    dueDate: '2025-09-05',
    invoiceNumber: 'GE-2025-078',
    notes: 'Rechnung überfällig - Mahnung versendet'
  },
  {
    id: '3',
    category: 'Personal',
    subcategory: 'Security',
    budgetedAmount: 28000,
    actualAmount: 28000,
    status: 'approved',
    vendor: 'SecurEvent',
    description: 'Sicherheitsdienst 25 Personen',
    dueDate: '2025-09-15'
  },
  {
    id: '4',
    category: 'Marketing',
    subcategory: 'Werbematerial',
    budgetedAmount: 8000,
    actualAmount: 0,
    status: 'planned',
    description: 'Flyer, Banner, Online-Werbung',
    dueDate: '2025-08-30'
  },
  {
    id: '5',
    category: 'Logistik',
    subcategory: 'Transport',
    budgetedAmount: 12000,
    actualAmount: 11200,
    status: 'paid',
    vendor: 'LogiTrans GmbH',
    description: 'Material-Transport und Setup',
    invoiceNumber: 'LT-2025-156'
  }
];

export function FinancialManagement() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(mockBudgetItems);
  const [viewMode, setViewMode] = useState<'overview' | 'budget' | 'invoices' | 'reports'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddItem, setShowAddItem] = useState(false);

  // Berechnungen
  const totalBudget = budgetItems.reduce((sum, item) => sum + item.budgetedAmount, 0);
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.actualAmount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const budgetUtilization = (totalSpent / totalBudget) * 100;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'planned': 'bg-gray-100 text-gray-800',
      'approved': 'bg-yellow-100 text-yellow-800',
      'ordered': 'bg-blue-100 text-blue-800',
      'paid': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryData = () => {
    return budgetCategories.map(category => {
      const categoryItems = budgetItems.filter(item => item.category === category.name);
      const budgeted = categoryItems.reduce((sum, item) => sum + item.budgetedAmount, 0);
      const actual = categoryItems.reduce((sum, item) => sum + item.actualAmount, 0);
      const variance = actual - budgeted;
      const utilizationPercent = budgeted > 0 ? (actual / budgeted) * 100 : 0;

      return {
        ...category,
        budgeted,
        actual,
        variance,
        utilizationPercent,
        itemCount: categoryItems.length
      };
    }).filter(cat => cat.budgeted > 0);
  };

  const filteredItems = budgetItems.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const statusMatch = selectedStatus === 'all' || item.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  const getOverdueItems = () => {
    return budgetItems.filter(item => 
      item.status === 'overdue' || 
      (item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'paid')
    );
  };

  const renderOverview = () => {
    const categoryData = getCategoryData();
    const overdueItems = getOverdueItems();

    return (
      <div className="space-y-6">
        {/* Budget Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Gesamt Budget</h3>
            <p className="text-2xl font-bold text-gray-900">€{totalBudget.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{budgetItems.length} Positionen</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Ausgegeben</h3>
            <p className="text-2xl font-bold text-blue-600">€{totalSpent.toLocaleString()}</p>
            <p className="text-sm text-gray-600">{budgetUtilization.toFixed(1)}% vom Budget</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Verbleibendes Budget</h3>
            <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{Math.abs(remainingBudget).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {remainingBudget >= 0 ? 'Im Budget' : 'Überschreitung'}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Offene Rechnungen</h3>
            <p className="text-2xl font-bold text-red-600">{overdueItems.length}</p>
            <p className="text-sm text-gray-600">Zahlung überfällig</p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Budget-Auslastung</h3>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
            <div 
              className={`h-3 rounded-full ${budgetUtilization > 100 ? 'bg-red-500' : budgetUtilization > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>0%</span>
            <span className="font-medium">{budgetUtilization.toFixed(1)}%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold">Budget nach Kategorien</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {categoryData.map(category => (
                <div key={category.name} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <h4 className="font-medium">{category.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                        {category.itemCount}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">€{category.actual.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">von €{category.budgeted.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${
                        category.utilizationPercent > 100 ? 'bg-red-500' : 
                        category.utilizationPercent > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(category.utilizationPercent, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${category.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {category.variance >= 0 ? '+' : ''}€{category.variance.toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      {category.utilizationPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Overdue Items Alert */}
        {overdueItems.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-red-800 mb-2">⚠️ Offene Zahlungen</h3>
            <div className="space-y-2">
              {overdueItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-red-700">{item.description} - {item.vendor}</span>
                  <span className="font-medium text-red-800">€{item.actualAmount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBudgetManagement = () => (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border flex gap-4 items-center">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Kategorie:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Alle</option>
            {budgetCategories.map(cat => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="all">Alle</option>
            <option value="planned">Geplant</option>
            <option value="approved">Genehmigt</option>
            <option value="ordered">Bestellt</option>
            <option value="paid">Bezahlt</option>
            <option value="overdue">Überfällig</option>
          </select>
        </div>

        <div className="ml-auto">
          <button 
            onClick={() => setShowAddItem(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            + Budget Position
          </button>
        </div>
      </div>

      {/* Budget Items Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ist-Kosten</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Differenz</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fällig</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map(item => {
                const variance = item.actualAmount - item.budgetedAmount;
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{item.description}</p>
                        <p className="text-sm text-gray-500">{item.category} • {item.subcategory}</p>
                        {item.vendor && (
                          <p className="text-sm text-gray-500">{item.vendor}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">€{item.budgetedAmount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-gray-900">€{item.actualAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {variance >= 0 ? '+' : ''}€{variance.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.dueDate || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">Bearbeiten</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">Zahlung</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => {
    const invoiceItems = budgetItems.filter(item => item.invoiceNumber);
    const pendingPayments = invoiceItems.filter(item => item.status !== 'paid');
    
    return (
      <div className="space-y-6">
        {/* Invoice Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Rechnungen gesamt</h3>
            <p className="text-2xl font-bold text-gray-900">{invoiceItems.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Ausstehende Zahlungen</h3>
            <p className="text-2xl font-bold text-orange-600">{pendingPayments.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Offener Betrag</h3>
            <p className="text-2xl font-bold text-red-600">
              €{pendingPayments.reduce((sum, item) => sum + item.actualAmount, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Rechnungsübersicht</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rechnungs-Nr.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lieferant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beschreibung</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Betrag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fällig</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.invoiceNumber}</td>
                    <td className="px-6 py-4 text-gray-900">{item.vendor}</td>
                    <td className="px-6 py-4 text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 text-gray-900">€{item.actualAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{item.dueDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">PDF</button>
                        <button className="text-green-600 hover:text-green-800 text-sm">Bezahlen</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Budget-Reports</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">📊 Budget-Übersicht PDF</h4>
            <p className="text-sm text-gray-500">Vollständiger Budget-Report mit allen Kategorien</p>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">💰 Ausgaben-Analyse</h4>
            <p className="text-sm text-gray-500">Detaillierte Kostenaufstellung und Varianzen</p>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">📈 Cashflow-Prognose</h4>
            <p className="text-sm text-gray-500">Zahlungsplanung und Liquiditäts-Forecast</p>
          </button>
          
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium text-gray-900">🧾 Rechnungs-Export</h4>
            <p className="text-sm text-gray-500">Excel-Export für Buchhaltung</p>
          </button>
        </div>

        {/* Quick Stats for Reports */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Berichts-Daten</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Budget-Positionen</p>
              <p className="font-medium">{budgetItems.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Kategorien</p>
              <p className="font-medium">{budgetCategories.length}</p>
            </div>
            <div>
              <p className="text-gray-500">Offene Rechnungen</p>
              <p className="font-medium">{getOverdueItems().length}</p>
            </div>
            <div>
              <p className="text-gray-500">Budget-Auslastung</p>
              <p className="font-medium">{budgetUtilization.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finanzmanagement</h1>
          <p className="text-gray-600">Budget-Tracking, Kostenkontrolle und Rechnungsmanagement</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'overview' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Übersicht
          </button>
          <button 
            onClick={() => setViewMode('budget')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'budget' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Budget
          </button>
          <button 
            onClick={() => setViewMode('invoices')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'invoices' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Rechnungen
          </button>
          <button 
            onClick={() => setViewMode('reports')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              viewMode === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Reports
          </button>
        </div>
      </div>

      {viewMode === 'overview' && renderOverview()}
      {viewMode === 'budget' && renderBudgetManagement()}
      {viewMode === 'invoices' && renderInvoices()}
      {viewMode === 'reports' && renderReports()}
    </div>
  );
}