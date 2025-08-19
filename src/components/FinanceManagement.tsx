import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Euro,
  Plus,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  Upload,
  PieChart,
  BarChart3,
  Receipt
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useApp } from './AppContext';

interface FinancialTransaction {
  id: string;
  type: 'budget' | 'expense' | 'invoice' | 'payment';
  category: string;
  description: string;
  amount: number;
  currency: string;
  transaction_date: string;
  supplier_name?: string;
  status: 'pending' | 'approved' | 'paid' | 'rejected';
  invoice_number?: string;
  payment_due_date?: string;
  notes?: string;
  created_at: string;
}

interface BudgetCategory {
  category: string;
  budgeted: number;
  spent: number;
  committed: number; // Approved but not yet paid
  remaining: number;
}

const mockTransactions: FinancialTransaction[] = [
  {
    id: '1',
    type: 'budget',
    category: 'Audio/Video',
    description: 'Budget-Allokation Audio/Video Equipment',
    amount: 15000,
    currency: 'EUR',
    transaction_date: '2025-01-15',
    status: 'approved',
    created_at: '2025-01-15T10:00:00'
  },
  {
    id: '2',
    type: 'expense',
    category: 'Audio/Video',
    description: 'PA-System Miete - ProAudio München',
    amount: 4500,
    currency: 'EUR',
    transaction_date: '2025-02-01',
    supplier_name: 'ProAudio München',
    status: 'paid',
    invoice_number: 'PAM-2025-001',
    created_at: '2025-02-01T14:30:00'
  },
  {
    id: '3',
    type: 'invoice',
    category: 'Permits',
    description: 'Genehmigungsgebühren Stadt München',
    amount: 2800,
    currency: 'EUR',
    transaction_date: '2025-02-15',
    supplier_name: 'Stadt München',
    status: 'pending',
    invoice_number: 'MUC-2025-456',
    payment_due_date: '2025-03-15',
    created_at: '2025-02-15T09:15:00'
  },
  {
    id: '4',
    type: 'expense',
    category: 'Logistics',
    description: 'Transport und Aufbau Equipment',
    amount: 1200,
    currency: 'EUR',
    transaction_date: '2025-02-20',
    supplier_name: 'LogiMove GmbH',
    status: 'approved',
    invoice_number: 'LOG-2025-789',
    payment_due_date: '2025-03-05',
    created_at: '2025-02-20T16:45:00'
  },
  {
    id: '5',
    type: 'budget',
    category: 'Security',
    description: 'Budget-Allokation Sicherheitsdienst',
    amount: 8000,
    currency: 'EUR',
    transaction_date: '2025-01-15',
    status: 'approved',
    created_at: '2025-01-15T10:05:00'
  }
];

const categories = [
  'Audio/Video',
  'Security', 
  'Permits',
  'Logistics',
  'Catering',
  'Marketing',
  'Insurance',
  'Staff',
  'Miscellaneous'
];

export function FinanceManagement() {
  const { currentProject } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'budgets' | 'reports'>('overview');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<FinancialTransaction[]>(mockTransactions);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Calculate budget overview
  const calculateBudgetOverview = (): BudgetCategory[] => {
    const budgetMap = new Map<string, BudgetCategory>();
    
    // Initialize categories
    categories.forEach(cat => {
      budgetMap.set(cat, {
        category: cat,
        budgeted: 0,
        spent: 0,
        committed: 0,
        remaining: 0
      });
    });

    // Process transactions
    transactions.forEach(transaction => {
      const category = budgetMap.get(transaction.category);
      if (!category) return;

      switch (transaction.type) {
        case 'budget':
          if (transaction.status === 'approved') {
            category.budgeted += transaction.amount;
          }
          break;
        case 'expense':
        case 'payment':
          if (transaction.status === 'paid') {
            category.spent += transaction.amount;
          } else if (transaction.status === 'approved') {
            category.committed += transaction.amount;
          }
          break;
        case 'invoice':
          if (transaction.status === 'approved' || transaction.status === 'pending') {
            category.committed += transaction.amount;
          }
          break;
      }
    });

    // Calculate remaining
    budgetMap.forEach(category => {
      category.remaining = category.budgeted - category.spent - category.committed;
    });

    return Array.from(budgetMap.values()).filter(cat => cat.budgeted > 0);
  };

  const budgetOverview = calculateBudgetOverview();
  const totalBudget = budgetOverview.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetOverview.reduce((sum, cat) => sum + cat.spent, 0);
  const totalCommitted = budgetOverview.reduce((sum, cat) => sum + cat.committed, 0);
  const totalRemaining = totalBudget - totalSpent - totalCommitted;

  // Filter transactions
  useEffect(() => {
    let filtered = transactions;

    if (filterCategory) {
      filtered = filtered.filter(t => t.category === filterCategory);
    }
    if (filterType) {
      filtered = filtered.filter(t => t.type === filterType);
    }
    if (filterStatus) {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filterCategory, filterType, filterStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'approved': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'budget': return <TrendingUp className="h-4 w-4" />;
      case 'expense': return <TrendingDown className="h-4 w-4" />;
      case 'invoice': return <FileText className="h-4 w-4" />;
      case 'payment': return <Receipt className="h-4 w-4" />;
      default: return <Euro className="h-4 w-4" />;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbudget</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalBudget.toLocaleString('de-DE')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausgegeben</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{totalSpent.toLocaleString('de-DE')}</div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% des Budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eingeplant</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">€{totalCommitted.toLocaleString('de-DE')}</div>
            <p className="text-xs text-muted-foreground">
              Genehmigt aber nicht bezahlt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verfügbar</CardTitle>
            <CheckCircle2 className={`h-4 w-4 ${totalRemaining >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              €{totalRemaining.toLocaleString('de-DE')}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRemaining >= 0 ? 'Budget verfügbar' : 'Budget überschritten!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Breakdown by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Budget-Übersicht nach Kategorien</CardTitle>
          <CardDescription>Aufschlüsselung der Budget-Allokation und Verwendung</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {budgetOverview.map(category => {
              const utilizationPercent = (category.spent + category.committed) / category.budgeted * 100;
              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.category}</span>
                    <span className="text-sm text-gray-500">
                      €{(category.spent + category.committed).toLocaleString('de-DE')} / €{category.budgeted.toLocaleString('de-DE')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full relative"
                      style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                    >
                      {category.spent > 0 && (
                        <div 
                          className="bg-red-500 h-2 rounded-full absolute top-0 left-0"
                          style={{ width: `${(category.spent / category.budgeted) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Ausgegeben: €{category.spent.toLocaleString('de-DE')}</span>
                    <span>Eingeplant: €{category.committed.toLocaleString('de-DE')}</span>
                    <span className={category.remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                      Verbleibend: €{category.remaining.toLocaleString('de-DE')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Neueste Transaktionen</CardTitle>
          <CardDescription>Die letzten 5 Finanz-Aktivitäten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category} • {new Date(transaction.transaction_date).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${transaction.type === 'budget' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'budget' ? '+' : '-'}€{transaction.amount.toLocaleString('de-DE')}
                  </div>
                  <Badge className={getStatusColor(transaction.status)} variant="outline">
                    {transaction.status === 'pending' && 'Ausstehend'}
                    {transaction.status === 'approved' && 'Genehmigt'}  
                    {transaction.status === 'paid' && 'Bezahlt'}
                    {transaction.status === 'rejected' && 'Abgelehnt'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 flex-1">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Kategorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Kategorien</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Typen</SelectItem>
              <SelectItem value="budget">Budget</SelectItem>
              <SelectItem value="expense">Ausgabe</SelectItem>
              <SelectItem value="invoice">Rechnung</SelectItem>
              <SelectItem value="payment">Zahlung</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Alle Status</SelectItem>
              <SelectItem value="pending">Ausstehend</SelectItem>
              <SelectItem value="approved">Genehmigt</SelectItem>
              <SelectItem value="paid">Bezahlt</SelectItem>
              <SelectItem value="rejected">Abgelehnt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowAddTransaction(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Transaktion
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.map(transaction => (
          <Card key={transaction.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getTypeIcon(transaction.type)}
                  <div>
                    <h4 className="font-medium">{transaction.description}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{new Date(transaction.transaction_date).toLocaleDateString('de-DE')}</span>
                      {transaction.supplier_name && (
                        <>
                          <span>•</span>
                          <span>{transaction.supplier_name}</span>
                        </>
                      )}
                      {transaction.invoice_number && (
                        <>
                          <span>•</span>
                          <span>#{transaction.invoice_number}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    transaction.type === 'budget' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'budget' ? '+' : '-'}€{transaction.amount.toLocaleString('de-DE')}
                  </div>
                  <Badge className={getStatusColor(transaction.status)} variant="outline">
                    {transaction.status === 'pending' && 'Ausstehend'}
                    {transaction.status === 'approved' && 'Genehmigt'}  
                    {transaction.status === 'paid' && 'Bezahlt'}
                    {transaction.status === 'rejected' && 'Abgelehnt'}
                  </Badge>
                  {transaction.payment_due_date && transaction.status !== 'paid' && (
                    <p className="text-xs text-red-500 mt-1">
                      Fällig: {new Date(transaction.payment_due_date).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              </div>
              
              {transaction.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                  {transaction.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <Euro className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Kein Projekt ausgewählt</h2>
        <p className="text-gray-600">Wählen Sie ein Projekt aus, um Finanzen zu verwalten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finanz-Management</h1>
          <p className="text-gray-600">Budget-Tracking, Ausgaben und Leistungsabnahme</p>
        </div>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Übersicht', icon: BarChart3 },
            { id: 'transactions', label: 'Transaktionen', icon: Receipt },
            { id: 'budgets', label: 'Budgets', icon: PieChart },
            { id: 'reports', label: 'Reports', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'budgets' && renderOverview()} {/* Reuse overview for now */}
        {activeTab === 'reports' && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Reports werden entwickelt</h2>
            <p className="text-gray-600">Erweiterte Reporting-Features kommen bald</p>
          </div>
        )}
      </div>
    </div>
  );
}