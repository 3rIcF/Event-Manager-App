import React, { useState } from 'react';
import { useApp } from './AppContext';
import { useData } from './DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Package, 
  Users, 
  Euro,
  Download,
  Filter,
  ExternalLink,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface KPICard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'orange' | 'red' | 'gray';
  drilldownPath?: string;
}

interface DrilldownItem {
  id: string;
  name: string;
  value: string | number;
  status?: 'good' | 'warning' | 'critical';
  link?: string;
}

export function ReportsManager() {
  const { projects, currentProject } = useApp();
  const { globalMaterials, projectMaterials, getMaterialUsage } = useData();
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [selectedDrilldown, setSelectedDrilldown] = useState<string | null>(null);

  // Calculate global KPIs
  const calculateGlobalKPIs = (): KPICard[] => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => !['closed'].includes(p.status)).length;
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    
    // Mock calculated values - in real app these would come from aggregated data
    const coverage = 78; // Average coverage across all projects
    const budgetVariance = -5.2; // % under budget
    const approvalsOnTime = 85; // % of approvals on time
    const slotCompliance = 92; // % of slots kept as scheduled
    const returnRate = 88; // % of items returned
    const supplierPerformance = 4.2; // Average score out of 5

    return [
      {
        title: 'Aktive Projekte',
        value: activeProjects,
        change: 12,
        trend: 'up',
        icon: <Package className="w-5 h-5" />,
        color: 'blue',
        drilldownPath: 'active-projects'
      },
      {
        title: 'Deckungsgrad Gesamt',
        value: `${coverage}%`,
        change: 3.2,
        trend: 'up',
        icon: <Target className="w-5 h-5" />,
        color: 'green',
        drilldownPath: 'coverage'
      },
      {
        title: 'Budget vs. Ist',
        value: `${budgetVariance}%`,
        change: -2.1,
        trend: 'up', // Less negative is good
        icon: <Euro className="w-5 h-5" />,
        color: 'green',
        drilldownPath: 'budget-variance'
      },
      {
        title: 'Genehmigungen On-Time',
        value: `${approvalsOnTime}%`,
        change: -5,
        trend: 'down',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'orange',
        drilldownPath: 'approvals'
      },
      {
        title: 'Slot-Treue',
        value: `${slotCompliance}%`,
        change: 8,
        trend: 'up',
        icon: <Clock className="w-5 h-5" />,
        color: 'green',
        drilldownPath: 'slot-compliance'
      },
      {
        title: 'Rücklauf-Quote',
        value: `${returnRate}%`,
        change: -3,
        trend: 'down',
        icon: <TrendingUp className="w-5 h-5" />,
        color: 'orange',
        drilldownPath: 'return-rate'
      },
      {
        title: 'Lieferanten-Performance',
        value: `${supplierPerformance}/5`,
        change: 0.3,
        trend: 'up',
        icon: <Users className="w-5 h-5" />,
        color: 'blue',
        drilldownPath: 'supplier-performance'
      },
      {
        title: 'Gesamtbudget',
        value: `€${(totalBudget / 1000).toFixed(0)}k`,
        change: 15,
        trend: 'up',
        icon: <Euro className="w-5 h-5" />,
        color: 'blue',
        drilldownPath: 'total-budget'
      }
    ];
  };

  // Calculate project-specific KPIs
  const calculateProjectKPIs = (): KPICard[] => {
    if (!currentProject) return [];

    const projectMats = projectMaterials[currentProject.id] || [];
    const totalItems = projectMats.reduce((sum, m) => sum + m.quantity, 0);
    const coveredItems = Math.floor(totalItems * 0.75); // Mock calculation
    
    return [
      {
        title: 'Material-Abdeckung',
        value: `${Math.round((coveredItems / totalItems) * 100)}%`,
        change: 5,
        trend: 'up',
        icon: <Package className="w-5 h-5" />,
        color: 'green'
      },
      {
        title: 'Budget-Status',
        value: '78%',
        change: -2,
        trend: 'stable',
        icon: <Euro className="w-5 h-5" />,
        color: 'blue'
      },
      {
        title: 'Offene Genehmigungen',
        value: '3',
        change: -1,
        trend: 'up',
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'orange'
      },
      {
        title: 'Geplante Slots',
        value: '18',
        change: 2,
        trend: 'up',
        icon: <Calendar className="w-5 h-5" />,
        color: 'blue'
      }
    ];
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3 h-3 text-green-600" />;
      case 'down': return <ArrowDown className="w-3 h-3 text-red-600" />;
      default: return <Minus className="w-3 h-3 text-gray-600" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'green': return 'text-green-600 bg-green-100';
      case 'blue': return 'text-blue-600 bg-blue-100';
      case 'orange': return 'text-orange-600 bg-orange-100';
      case 'red': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDrilldownData = (path: string): DrilldownItem[] => {
    switch (path) {
      case 'active-projects':
        return projects
          .filter(p => !['closed'].includes(p.status))
          .map(p => ({
            id: p.id,
            name: p.name,
            value: p.status,
            status: p.status === 'planning' ? 'good' : p.status === 'approval' ? 'warning' : 'good',
            link: `/project/${p.id}`
          }));
      
      case 'coverage':
        return globalMaterials.map(material => {
          const usage = getMaterialUsage(material.id);
          const coverage = usage.openNeeds > 0 ? Math.floor(Math.random() * 40 + 60) : 100;
          return {
            id: material.id,
            name: material.name,
            value: `${coverage}%`,
            status: coverage > 80 ? 'good' : coverage > 60 ? 'warning' : 'critical'
          };
        });
      
      case 'budget-variance':
        return projects.map(p => ({
          id: p.id,
          name: p.name,
          value: `${(Math.random() * 20 - 10).toFixed(1)}%`,
          status: Math.random() > 0.7 ? 'critical' : Math.random() > 0.4 ? 'warning' : 'good'
        }));
      
      default:
        return [];
    }
  };

  const isGlobalView = !currentProject;
  const kpis = isGlobalView ? calculateGlobalKPIs() : calculateProjectKPIs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isGlobalView ? 'Globale Reports' : `Reports: ${currentProject?.name}`}
          </h2>
          <p className="text-muted-foreground">
            {isGlobalView 
              ? 'Performance-Dashboards und Drill-down-Analysen' 
              : 'Projekt-spezifische KPIs und Detailreports'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Tage</SelectItem>
              <SelectItem value="30d">30 Tage</SelectItem>
              <SelectItem value="90d">90 Tage</SelectItem>
              <SelectItem value="1y">1 Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card 
            key={index}
            className={kpi.drilldownPath ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
            onClick={() => kpi.drilldownPath && setSelectedDrilldown(kpi.drilldownPath)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-full ${getColorClasses(kpi.color)}`}>
                {kpi.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              {kpi.change !== undefined && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  {getTrendIcon(kpi.trend)}
                  <span className="ml-1">
                    {kpi.change > 0 ? '+' : ''}{kpi.change}% zum Vormonat
                  </span>
                  {kpi.drilldownPath && (
                    <ExternalLink className="w-3 h-3 ml-2" />
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Nach Kategorien</TabsTrigger>
          <TabsTrigger value="suppliers">Lieferanten</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Deckungsgrad-Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['KW 50', 'KW 51', 'KW 52', 'KW 1'].map((week, index) => {
                    const values = [65, 72, 78, 83];
                    return (
                      <div key={week} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{week}</span>
                        <div className="flex items-center gap-2 flex-1 ml-4">
                          <Progress value={values[index]} className="flex-1" />
                          <span className="text-sm font-medium w-12">{values[index]}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget-Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 4).map(project => {
                    const variance = (Math.random() * 20 - 10).toFixed(1);
                    const isPositive = parseFloat(variance) >= 0;
                    return (
                      <div key={project.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm font-medium">{project.name}</span>
                        <Badge 
                          className={isPositive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                        >
                          {variance}%
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kosten nach Kategorien</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Bühnen', 'Absperrung', 'Technik', 'Catering', 'Sicherheit'].map((category, index) => {
                  const costs = [85000, 45000, 120000, 35000, 60000];
                  const maxCost = Math.max(...costs);
                  const percentage = (costs[index] / maxCost) * 100;
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category}</span>
                        <span className="text-sm">€{costs[index].toLocaleString()}</span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lieferanten-Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Bühnentechnik Bayern', quality: 4.8, punctuality: 4.2, price: 3.9 },
                  { name: 'Zeltverleih München', quality: 4.5, punctuality: 4.7, price: 4.1 },
                  { name: 'Event Catering Plus', quality: 4.1, punctuality: 3.8, price: 4.3 },
                  { name: 'Security Solutions', quality: 4.6, punctuality: 4.4, price: 3.7 }
                ].map(supplier => (
                  <div key={supplier.name} className="p-4 border rounded space-y-2">
                    <h4 className="font-medium">{supplier.name}</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Qualität:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={supplier.quality * 20} className="flex-1" />
                          <span>{supplier.quality}/5</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pünktlichkeit:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={supplier.punctuality * 20} className="flex-1" />
                          <span>{supplier.punctuality}/5</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Preis:</span>
                        <div className="flex items-center gap-2">
                          <Progress value={supplier.price * 20} className="flex-1" />
                          <span>{supplier.price}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Projekt-Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map(project => {
                  const startDate = new Date(project.startDate);
                  const endDate = new Date(project.endDate);
                  const today = new Date();
                  const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={project.id} className="p-4 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{project.name}</h4>
                        <Badge variant="outline">
                          {daysUntilStart > 0 ? `in ${daysUntilStart} Tagen` : 'Läuft'}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {startDate.toLocaleDateString('de-DE')} - {endDate.toLocaleDateString('de-DE')}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: daysUntilStart <= 0 ? '75%' : '25%' }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {daysUntilStart <= 0 ? '75%' : '25%'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drilldown Modal/Drawer */}
      {selectedDrilldown && (
        <Card className="fixed bottom-4 right-4 w-96 max-h-96 shadow-lg z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Drill-down Details</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedDrilldown(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {getDrilldownData(selectedDrilldown).map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <span className="flex-1 truncate">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span>{item.value}</span>
                    {item.status && (
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'good' ? 'bg-green-500' :
                        item.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    )}
                    {item.link && <ExternalLink className="w-3 h-3" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}