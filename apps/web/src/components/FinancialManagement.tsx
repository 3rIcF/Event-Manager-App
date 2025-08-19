import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Calendar, Filter } from 'lucide-react';

interface FinancialRecord {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  projectId?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface Budget {
  id: string;
  name: string;
  totalAmount: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'overdue';
}

const FinancialManagement: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets'>('overview');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);

  // Mock-Daten
  useEffect(() => {
    const mockRecords: FinancialRecord[] = [
      {
        id: '1',
        type: 'expense',
        category: 'Catering',
        description: 'Premium Catering Service',
        amount: 2500,
        currency: 'EUR',
        date: '2025-01-15',
        status: 'approved'
      },
      {
        id: '2',
        type: 'expense',
        category: 'Logistics',
        description: 'Equipment Transport',
        amount: 800,
        currency: 'EUR',
        date: '2025-01-16',
        status: 'pending'
      },
      {
        id: '3',
        type: 'income',
        category: 'Ticket Sales',
        description: 'Event Tickets',
        amount: 5000,
        currency: 'EUR',
        date: '2025-01-10',
        status: 'approved'
      }
    ];

    const mockBudgets: Budget[] = [
      {
        id: '1',
        name: 'Q1 2025 Event Budget',
        totalAmount: 15000,
        spentAmount: 3300,
        remainingAmount: 11700,
        currency: 'EUR',
        startDate: '2025-01-01',
        endDate: '2025-03-31',
        status: 'active'
      }
    ];

    setRecords(mockRecords);
    setBudgets(mockBudgets);
  }, []);

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const handleAddRecord = () => {
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleSaveRecord = (recordData: Omit<FinancialRecord, 'id'>) => {
    if (editingRecord) {
      const updatedRecord = { ...editingRecord, ...recordData };
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? updatedRecord : r));
    } else {
      const newRecord = { ...recordData, id: Date.now().toString() };
      setRecords(prev => [...prev, newRecord]);
    }
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    return type === 'income' ? 
      <TrendingUp className="w-5 h-5 text-green-600" /> : 
      <TrendingDown className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finanz-Management</h1>
          <p className="text-gray-600 mt-2">Überwachen Sie Einnahmen, Ausgaben und Budgets</p>
        </div>
        <button
          onClick={handleAddRecord}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Neue Transaktion
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Übersicht', icon: PieChart },
            { id: 'transactions', label: 'Transaktionen', icon: BarChart3 },
            { id: 'budgets', label: 'Budgets', icon: DollarSign }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gesamteinnahmen</p>
                  <p className="text-2xl font-bold text-green-600">{totalIncome.toLocaleString()} EUR</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Gesamtausgaben</p>
                  <p className="text-2xl font-bold text-red-600">{totalExpenses.toLocaleString()} EUR</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nettogewinn</p>
                  <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {netProfit.toLocaleString()} EUR
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">Letzte Transaktionen</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {records.slice(0, 5).map((record) => (
                <div key={record.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getTypeIcon(record.type)}
                    <div>
                      <p className="font-medium text-gray-900">{record.description}</p>
                      <p className="text-sm text-gray-500">{record.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString()} {record.currency}
                    </p>
                    <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString('de-DE')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Alle Transaktionen</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategorie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beschreibung</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betrag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(record.type)}
                        <span className="text-sm font-medium text-gray-900">
                          {record.type === 'income' ? 'Einnahme' : 'Ausgabe'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{record.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${record.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.type === 'income' ? '+' : '-'}{record.amount.toLocaleString()} {record.currency}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status === 'approved' ? 'Genehmigt' : record.status === 'pending' ? 'Ausstehend' : 'Abgelehnt'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'budgets' && (
        <div className="space-y-6">
          {budgets.map((budget) => (
            <div key={budget.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{budget.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(budget.startDate).toLocaleDateString('de-DE')} - {new Date(budget.endDate).toLocaleDateString('de-DE')}
                  </p>
                </div>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  budget.status === 'active' ? 'bg-green-100 text-green-800' :
                  budget.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {budget.status === 'active' ? 'Aktiv' : budget.status === 'completed' ? 'Abgeschlossen' : 'Überfällig'}
                </span>
              </div>

              {/* Budget Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Verbraucht: {budget.spentAmount.toLocaleString()} {budget.currency}</span>
                  <span>Verbleibend: {budget.remainingAmount.toLocaleString()} {budget.currency}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(budget.spentAmount / budget.totalAmount) * 100}%` }}
                  ></div>
                </div>
                <div className="text-right text-sm text-gray-600 mt-1">
                  Gesamt: {budget.totalAmount.toLocaleString()} {budget.currency}
                </div>
              </div>

              {/* Budget Actions */}
              <div className="flex gap-3">
                <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium">
                  Bearbeiten
                </button>
                <button className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium">
                  Details anzeigen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transaction Modal */}
      {isModalOpen && (
        <TransactionModal
          record={editingRecord}
          onSave={handleSaveRecord}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
};

// Transaction Modal Component
interface TransactionModalProps {
  record: FinancialRecord | null;
  onSave: (data: Omit<FinancialRecord, 'id'>) => void;
  onClose: () => void;
}

const TransactionModal: React.FC<TransactionModalProps> = ({ record, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    type: record?.type || 'expense',
    category: record?.category || '',
    description: record?.description || '',
    amount: record?.amount || 0,
    currency: record?.currency || 'EUR',
    date: record?.date || new Date().toISOString().split('T')[0],
    status: record?.status || 'pending',
    notes: record?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {record ? 'Transaktion bearbeiten' : 'Neue Transaktion'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Typ *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="expense">Ausgabe</option>
              <option value="income">Einnahme</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
            <input
              type="text"
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="z.B. Catering, Logistics, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Betrag *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Währung</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Datum *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Ausstehend</option>
              <option value="approved">Genehmigt</option>
              <option value="rejected">Abgelehnt</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Zusätzliche Informationen..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {record ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialManagement;
