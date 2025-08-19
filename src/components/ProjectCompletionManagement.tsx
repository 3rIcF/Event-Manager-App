import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  CheckCircle,
  Star,
  MessageSquare,
  TrendingUp,
  Award,
  FileText,
  Users,
  Calendar,
  Target,
  Lightbulb,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  PieChart,
  Download,
  Send,
  Clock,
  DollarSign
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useApp } from './AppContext';

interface ProjectRetrospective {
  id: string;
  project_id: string;
  overall_success_rating: number; // 1-5
  timeline_rating: number; // 1-5
  budget_rating: number; // 1-5
  team_satisfaction_rating: number; // 1-5
  client_satisfaction_rating: number; // 1-5
  
  what_went_well: string[];
  what_could_be_improved: string[];
  lessons_learned: string[];
  recommendations_future: string[];
  
  key_metrics: {
    budget_variance: number; // percentage
    timeline_variance: number; // days
    attendance_target_met: boolean;
    quality_score: number; // 1-10
    roi_achieved: boolean;
  };
  
  completed_by: string;
  completed_at: string;
  status: 'draft' | 'completed' | 'approved';
}

interface SupplierEvaluation {
  id: string;
  project_id: string;
  supplier_id: string;
  supplier_name: string;
  category: string;
  
  ratings: {
    quality: number; // 1-5
    punctuality: number; // 1-5  
    communication: number; // 1-5
    price_value: number; // 1-5
    professionalism: number; // 1-5
    overall: number; // 1-5
  };
  
  delivery_performance: {
    on_time: boolean;
    complete_delivery: boolean;
    quality_met_expectations: boolean;
    responsive_to_changes: boolean;
  };
  
  feedback: {
    positive_aspects: string;
    areas_for_improvement: string;
    would_recommend: boolean;
    would_use_again: boolean;
  };
  
  contract_value: number;
  evaluated_by: string;
  evaluation_date: string;
  status: 'draft' | 'completed' | 'sent_to_supplier';
}

interface LessonsLearned {
  id: string;
  project_id: string;
  category: 'planning' | 'execution' | 'communication' | 'budget' | 'team' | 'vendor' | 'technical';
  title: string;
  description: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  lesson_type: 'success' | 'challenge' | 'risk' | 'opportunity';
  
  recommendations: string[];
  applicable_to_future_projects: boolean;
  stakeholders_involved: string[];
  
  created_by: string;
  created_at: string;
  status: 'draft' | 'reviewed' | 'approved' | 'archived';
}

interface ProjectMetrics {
  final_budget: number;
  budget_variance_percentage: number;
  timeline_variance_days: number;
  total_attendees: number;
  attendee_target_met: boolean;
  client_satisfaction_score: number;
  team_satisfaction_score: number;
  total_suppliers: number;
  supplier_issues: number;
  change_requests: number;
  incidents_resolved: number;
  roi_percentage: number;
}

// Mock Data
const mockRetrospective: ProjectRetrospective = {
  id: '1',
  project_id: '1',
  overall_success_rating: 4,
  timeline_rating: 4,
  budget_rating: 3,
  team_satisfaction_rating: 5,
  client_satisfaction_rating: 4,
  
  what_went_well: [
    'Exzellente Teamkoordination und Kommunikation',
    'Rechtzeitige Identifikation und Lösung kritischer Issues',
    'Hohe Teilnehmerzufriedenheit laut Feedback',
    'Innovative Lösungen für Logistik-Herausforderungen',
    'Erfolgreiche Integration neuer Technologien'
  ],
  
  what_could_be_improved: [
    'Budgetplanung für unvorhergesehene Änderungen',
    'Frühzeitige Einbindung aller Stakeholder',
    'Backup-Pläne für wetterbedingte Probleme',
    'Dokumentation von Entscheidungsprozessen',
    'Vendor-Management und SLA-Überwachung'
  ],
  
  lessons_learned: [
    'Buffer-Zeit für Setup ist kritisch bei Outdoor-Events',
    'Regelmäßige Stakeholder-Updates reduzieren Last-Minute-Änderungen',
    'Lokale Behörden frühzeitig einbeziehen spart Zeit und Stress',
    'Redundante Systeme für kritische Infrastruktur sind Investment wert',
    'Team-Building vor Projekt-Start verbessert Zusammenarbeit erheblich'
  ],
  
  recommendations_future: [
    'Mindestens 20% Budget-Buffer für Events dieser Größenordnung',
    'Wetter-Contingency-Plan bereits in initiale Planung einbeziehen',
    'Vendor-Scorecards einführen für objektive Bewertung',
    'Post-Event Surveys automatisieren für bessere Datensammlung',
    'Lessons-Learned-Database für zukünftige Referenz aufbauen'
  ],
  
  key_metrics: {
    budget_variance: -8.5, // 8.5% over budget
    timeline_variance: 2, // 2 days ahead of schedule
    attendance_target_met: true,
    quality_score: 8.2,
    roi_achieved: true
  },
  
  completed_by: 'Max Müller',
  completed_at: '2025-02-22T15:30:00',
  status: 'completed'
};

const mockSupplierEvaluations: SupplierEvaluation[] = [
  {
    id: '1',
    project_id: '1',
    supplier_id: '1',
    supplier_name: 'ProAudio München',
    category: 'Audio/Video',
    
    ratings: {
      quality: 5,
      punctuality: 4,
      communication: 5,
      price_value: 4,
      professionalism: 5,
      overall: 5
    },
    
    delivery_performance: {
      on_time: true,
      complete_delivery: true,
      quality_met_expectations: true,
      responsive_to_changes: true
    },
    
    feedback: {
      positive_aspects: 'Exzellente Klangqualität, sehr professionelles Team, schnelle Reaktion auf Änderungswünsche während der Veranstaltung.',
      areas_for_improvement: 'Anfahrtszeit könnte optimiert werden, kleinere Verzögerung beim Setup durch Traffic.',
      would_recommend: true,
      would_use_again: true
    },
    
    contract_value: 4500,
    evaluated_by: 'Anna Schmidt',
    evaluation_date: '2025-02-20T10:00:00',
    status: 'completed'
  },
  {
    id: '2',
    project_id: '1',
    supplier_id: '2', 
    supplier_name: 'LightTech Solutions',
    category: 'Lighting',
    
    ratings: {
      quality: 4,
      punctuality: 3,
      communication: 4,
      price_value: 4,
      professionalism: 4,
      overall: 4
    },
    
    delivery_performance: {
      on_time: false,
      complete_delivery: true,
      quality_met_expectations: true,
      responsive_to_changes: true
    },
    
    feedback: {
      positive_aspects: 'Kreative Lichtshow-Konzepte, gute Technik, flexibel bei kurzfristigen Änderungen.',
      areas_for_improvement: 'Verspätung beim Setup (30min), bessere Zeitplanung erforderlich.',
      would_recommend: true,
      would_use_again: true
    },
    
    contract_value: 6200,
    evaluated_by: 'Peter Wagner',
    evaluation_date: '2025-02-20T14:00:00',
    status: 'completed'
  },
  {
    id: '3',
    project_id: '1',
    supplier_id: '3',
    supplier_name: 'SecureEvents GmbH',
    category: 'Security',
    
    ratings: {
      quality: 5,
      punctuality: 5,
      communication: 5,
      price_value: 5,
      professionalism: 5,
      overall: 5
    },
    
    delivery_performance: {
      on_time: true,
      complete_delivery: true,
      quality_met_expectations: true,
      responsive_to_changes: true
    },
    
    feedback: {
      positive_aspects: 'Ausgezeichnete Koordination, professionelles Auftreten, proaktive Problemlösung. Team war sehr gut eingespielt.',
      areas_for_improvement: 'Keine wesentlichen Verbesserungsvorschläge.',
      would_recommend: true,
      would_use_again: true
    },
    
    contract_value: 3200,
    evaluated_by: 'Max Müller',
    evaluation_date: '2025-02-19T16:30:00',
    status: 'completed'
  }
];

const mockLessonsLearned: LessonsLearned[] = [
  {
    id: '1',
    project_id: '1',
    category: 'planning',
    title: 'Wetter-Contingency-Planung bei Outdoor-Events',
    description: 'Für das Stadtfest war ursprünglich keine detaillierte Wetter-Backup-Strategie geplant. Als am Samstag Regen drohte, mussten schnell Alternativen gefunden werden.',
    impact_level: 'high',
    lesson_type: 'challenge',
    
    recommendations: [
      'Wetter-Contingency-Plan bereits in der Angebotsphase erstellen',
      'Backup-Locations oder überdachte Bereiche frühzeitig sichern',
      'Wetterdienst-Updates in tägliche Briefings integrieren',
      'Flexible Zelt/Pavillon-Optionen in Budgetplanung berücksichtigen'
    ],
    
    applicable_to_future_projects: true,
    stakeholders_involved: ['Event-Manager', 'Logistik-Team', 'Vendor-Koordination'],
    
    created_by: 'Max Müller',
    created_at: '2025-02-20T09:15:00',
    status: 'approved'
  },
  {
    id: '2',
    project_id: '1',
    category: 'execution',
    title: 'Erfolgreiche Integration Live-Streaming',
    description: 'Die Integration einer Live-Streaming-Lösung war nicht ursprünglich geplant, wurde aber aufgrund der Nachfrage spontan implementiert und war ein großer Erfolg.',
    impact_level: 'medium',
    lesson_type: 'success',
    
    recommendations: [
      'Live-Streaming standardmäßig als Option anbieten',
      'Partnerships mit Streaming-Providern aufbauen',
      'Technical Rider um Streaming-Anforderungen erweitern',
      'Social Media Integration bei Streaming berücksichtigen'
    ],
    
    applicable_to_future_projects: true,
    stakeholders_involved: ['Technical Team', 'Marketing', 'Client'],
    
    created_by: 'Anna Schmidt',
    created_at: '2025-02-21T11:30:00',
    status: 'approved'
  },
  {
    id: '3',
    project_id: '1',
    category: 'budget',
    title: 'Unvorhergesehene Behörden-Auflagen',
    description: 'Zusätzliche Sicherheitsauflagen der Stadt München führten zu ungeplanten Kosten von €2.400 für extra Absperrungen und Sicherheitspersonal.',
    impact_level: 'medium',
    lesson_type: 'risk',
    
    recommendations: [
      'Frühzeitige Abstimmung mit lokalen Behörden (mindestens 8 Wochen vorher)',
      '10% Buffer für behördliche Auflagen in Sicherheits-Budget',
      'Direkte Kontakte zu lokalen Behörden-Vertretern aufbauen',
      'Standardisierte Checkliste für Behörden-Requirements erstellen'
    ],
    
    applicable_to_future_projects: true,
    stakeholders_involved: ['Project Manager', 'Legal/Compliance', 'Finance'],
    
    created_by: 'Peter Wagner',
    created_at: '2025-02-19T14:45:00',
    status: 'approved'
  }
];

const mockProjectMetrics: ProjectMetrics = {
  final_budget: 258500,
  budget_variance_percentage: -8.5,
  timeline_variance_days: 2,
  total_attendees: 45000,
  attendee_target_met: true,
  client_satisfaction_score: 4.2,
  team_satisfaction_score: 4.6,
  total_suppliers: 12,
  supplier_issues: 2,
  change_requests: 7,
  incidents_resolved: 3,
  roi_percentage: 145
};

export function ProjectCompletionManagement() {
  const { currentProject } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'retrospective' | 'suppliers' | 'lessons'>('overview');
  const [retrospective] = useState<ProjectRetrospective>(mockRetrospective);
  const [supplierEvaluations] = useState<SupplierEvaluation[]>(mockSupplierEvaluations);
  const [lessonsLearned] = useState<LessonsLearned[]>(mockLessonsLearned);
  const [metrics] = useState<ProjectMetrics>(mockProjectMetrics);

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Key Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt-Bewertung</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{retrospective.overall_success_rating}</div>
              <div className="flex">
                {getRatingStars(retrospective.overall_success_rating)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">von 5 Sternen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget-Performance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.budget_variance_percentage > 0 ? '+' : ''}{metrics.budget_variance_percentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              €{metrics.final_budget.toLocaleString('de-DE')} Final
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Timeline</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{metrics.timeline_variance_days} Tage
            </div>
            <p className="text-xs text-muted-foreground">vor Zeitplan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teilnehmer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.total_attendees.toLocaleString('de-DE')}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.attendee_target_met ? '✅ Ziel erreicht' : '❌ Ziel verfehlt'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Zufriedenheits-Ratings</CardTitle>
            <CardDescription>Bewertungen aller wichtigen Bereiche</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Gesamterfolg', value: retrospective.overall_success_rating },
              { label: 'Zeitplan', value: retrospective.timeline_rating },
              { label: 'Budget', value: retrospective.budget_rating },
              { label: 'Team-Zufriedenheit', value: retrospective.team_satisfaction_rating },
              { label: 'Kunden-Zufriedenheit', value: retrospective.client_satisfaction_rating }
            ].map(rating => (
              <div key={rating.label} className="flex items-center justify-between">
                <span className="text-sm font-medium">{rating.label}</span>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {getRatingStars(rating.value)}
                  </div>
                  <span className={`text-sm font-bold ${getRatingColor(rating.value)}`}>
                    {rating.value}/5
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance-Metriken</CardTitle>
            <CardDescription>Wichtige Projekt-Kennzahlen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>ROI erreicht:</span>
                  <span className="font-semibold text-green-600">
                    {metrics.roi_percentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Qualitäts-Score:</span>
                  <span className="font-semibold">
                    {retrospective.key_metrics.quality_score}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lieferanten gesamt:</span>
                  <span className="font-semibold">{metrics.total_suppliers}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Lieferanten-Issues:</span>
                  <span className={`font-semibold ${metrics.supplier_issues > 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {metrics.supplier_issues}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Change Requests:</span>
                  <span className="font-semibold">{metrics.change_requests}</span>
                </div>
                <div className="flex justify-between">
                  <span>Incidents gelöst:</span>
                  <span className="font-semibold text-green-600">{metrics.incidents_resolved}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('retrospective')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Retrospektive
            </CardTitle>
            <CardDescription>
              Detaillierte Projekt-Nachbesprechung und Lessons Learned
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              ✅ {retrospective.what_went_well.length} Erfolge dokumentiert<br />
              🔄 {retrospective.what_could_be_improved.length} Verbesserungsvorschläge<br />
              💡 {retrospective.lessons_learned.length} Lessons Learned
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('suppliers')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Anbieter-Bewertung
            </CardTitle>
            <CardDescription>
              Bewertungen und Feedback für alle Lieferanten
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              📊 {supplierEvaluations.length} Bewertungen abgeschlossen<br />
              ⭐ Ø {(supplierEvaluations.reduce((acc, sup) => acc + sup.ratings.overall, 0) / supplierEvaluations.length).toFixed(1)} Gesamt-Rating<br />
              ✅ {supplierEvaluations.filter(s => s.feedback.would_recommend).length} Empfehlungen
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('lessons')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Lessons Learned
            </CardTitle>
            <CardDescription>
              Erkenntnisse für zukünftige Projekte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              📚 {lessonsLearned.length} Erkenntnisse dokumentiert<br />
              🎯 {lessonsLearned.filter(l => l.applicable_to_future_projects).length} für Zukunft relevant<br />
              ⚠️ {lessonsLearned.filter(l => l.impact_level === 'high' || l.impact_level === 'critical').length} kritische Punkte
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRetrospective = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projekt-Retrospektive</h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Report exportieren
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            An Stakeholder senden
          </Button>
        </div>
      </div>

      {/* Was gut lief */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <ThumbsUp className="h-5 w-5" />
            Was gut lief
          </CardTitle>
          <CardDescription>Erfolge und positive Aspekte des Projekts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {retrospective.what_went_well.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <span className="text-green-800">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verbesserungspotential */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-700">
            <TrendingUp className="h-5 w-5" />
            Verbesserungspotential
          </CardTitle>
          <CardDescription>Bereiche die optimiert werden können</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {retrospective.what_could_be_improved.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <span className="text-yellow-800">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lessons Learned */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Lightbulb className="h-5 w-5" />
            Erkenntnisse
          </CardTitle>
          <CardDescription>Wichtige Learnings für zukünftige Projekte</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {retrospective.lessons_learned.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <span className="text-blue-800">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Empfehlungen für die Zukunft */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <Target className="h-5 w-5" />
            Empfehlungen für zukünftige Projekte
          </CardTitle>
          <CardDescription>Konkrete Handlungsempfehlungen basierend auf den Erkenntnissen</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {retrospective.recommendations_future.map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                <span className="text-purple-800">{item}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSupplierEvaluations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Anbieter-Bewertungen</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Bewertung hinzufügen
        </Button>
      </div>

      <div className="space-y-6">
        {supplierEvaluations.map(evaluation => (
          <Card key={evaluation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{evaluation.supplier_name}</CardTitle>
                  <CardDescription>{evaluation.category} • €{evaluation.contract_value.toLocaleString('de-DE')}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {getRatingStars(evaluation.ratings.overall)}
                  </div>
                  <span className={`text-lg font-bold ${getRatingColor(evaluation.ratings.overall)}`}>
                    {evaluation.ratings.overall}/5
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ratings Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(evaluation.ratings).filter(([key]) => key !== 'overall').map(([key, rating]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm text-gray-600 mb-1 capitalize">
                      {key === 'quality' && 'Qualität'}
                      {key === 'punctuality' && 'Pünktlichkeit'}
                      {key === 'communication' && 'Kommunikation'}
                      {key === 'price_value' && 'Preis-Leistung'}
                      {key === 'professionalism' && 'Professionalität'}
                    </div>
                    <div className="flex justify-center mb-1">
                      {getRatingStars(rating)}
                    </div>
                    <div className={`text-sm font-semibold ${getRatingColor(rating)}`}>
                      {rating}/5
                    </div>
                  </div>
                ))}
              </div>

              {/* Performance Indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${evaluation.delivery_performance.on_time ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">Pünktlich</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${evaluation.delivery_performance.complete_delivery ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">Vollständig</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${evaluation.delivery_performance.quality_met_expectations ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">Qualität erfüllt</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${evaluation.delivery_performance.responsive_to_changes ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">Flexibel</span>
                </div>
              </div>

              {/* Feedback */}
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Positive Aspekte:</h4>
                  <p className="text-green-800 text-sm">{evaluation.feedback.positive_aspects}</p>
                </div>
                {evaluation.feedback.areas_for_improvement && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Verbesserungsvorschläge:</h4>
                    <p className="text-yellow-800 text-sm">{evaluation.feedback.areas_for_improvement}</p>
                  </div>
                )}
              </div>

              {/* Recommendations */}
              <div className="flex gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Weiterempfehlen:</span>
                  <Badge className={evaluation.feedback.would_recommend ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {evaluation.feedback.would_recommend ? 'Ja' : 'Nein'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Wieder beauftragen:</span>
                  <Badge className={evaluation.feedback.would_use_again ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {evaluation.feedback.would_use_again ? 'Ja' : 'Nein'}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback senden
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Bewertung exportieren
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderLessonsLearned = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lessons Learned</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Lesson hinzufügen
        </Button>
      </div>

      <div className="space-y-4">
        {lessonsLearned.map(lesson => (
          <Card key={lesson.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{lesson.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <Badge variant="secondary" className="capitalize">
                      {lesson.category === 'planning' && 'Planung'}
                      {lesson.category === 'execution' && 'Durchführung'}
                      {lesson.category === 'communication' && 'Kommunikation'}
                      {lesson.category === 'budget' && 'Budget'}
                      {lesson.category === 'team' && 'Team'}
                      {lesson.category === 'vendor' && 'Lieferanten'}
                      {lesson.category === 'technical' && 'Technik'}
                    </Badge>
                    <Badge 
                      className={
                        lesson.lesson_type === 'success' ? 'bg-green-100 text-green-800' :
                        lesson.lesson_type === 'challenge' ? 'bg-yellow-100 text-yellow-800' :
                        lesson.lesson_type === 'risk' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }
                      variant="outline"
                    >
                      {lesson.lesson_type === 'success' && '✅ Erfolg'}
                      {lesson.lesson_type === 'challenge' && '⚠️ Herausforderung'}
                      {lesson.lesson_type === 'risk' && '🚨 Risiko'}
                      {lesson.lesson_type === 'opportunity' && '💡 Chance'}
                    </Badge>
                    <Badge 
                      className={
                        lesson.impact_level === 'critical' ? 'bg-red-100 text-red-800' :
                        lesson.impact_level === 'high' ? 'bg-orange-100 text-orange-800' :
                        lesson.impact_level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }
                      variant="outline"
                    >
                      {lesson.impact_level === 'critical' && 'Kritisch'}
                      {lesson.impact_level === 'high' && 'Hoch'}
                      {lesson.impact_level === 'medium' && 'Mittel'}
                      {lesson.impact_level === 'low' && 'Niedrig'}
                    </Badge>
                  </CardDescription>
                </div>
                {lesson.applicable_to_future_projects && (
                  <Badge className="bg-purple-100 text-purple-800" variant="outline">
                    Für Zukunft relevant
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Beschreibung:</h4>
                <p className="text-gray-700 text-sm">{lesson.description}</p>
              </div>

              {lesson.recommendations.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Handlungsempfehlungen:</h4>
                  <div className="space-y-2">
                    {lesson.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Target className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span className="text-blue-800 text-sm">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lesson.stakeholders_involved.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Beteiligte Stakeholder:</h4>
                  <div className="flex flex-wrap gap-1">
                    {lesson.stakeholders_involved.map(stakeholder => (
                      <Badge key={stakeholder} variant="outline" className="text-xs">
                        {stakeholder}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 text-sm text-gray-500">
                <span>Erstellt von: {lesson.created_by}</span>
                <span>{new Date(lesson.created_at).toLocaleDateString('de-DE')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Kein Projekt ausgewählt</h2>
        <p className="text-gray-600">Wählen Sie ein Projekt aus, um den Projekt-Abschluss zu verwalten.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projekt-Abschluss</h1>
          <p className="text-gray-600">Retrospektive, Lessons Learned und Anbieter-Bewertung</p>
        </div>
      </div>

      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Übersicht', icon: BarChart3 },
            { id: 'retrospective', label: 'Retrospektive', icon: FileText },
            { id: 'suppliers', label: 'Anbieter-Bewertung', icon: Users },
            { id: 'lessons', label: 'Lessons Learned', icon: Lightbulb }
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
        {activeTab === 'retrospective' && renderRetrospective()}
        {activeTab === 'suppliers' && renderSupplierEvaluations()}
        {activeTab === 'lessons' && renderLessonsLearned()}
      </div>
    </div>
  );
}