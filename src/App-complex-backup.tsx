import React, { useState } from 'react';
import { AppProvider, useApp } from './components/AppContext';
import { NewLayout } from './components/NewLayout';
import { GlobalDashboard } from './components/GlobalDashboard';
import { ProjectsList } from './components/ProjectsList';
import { ProjectDashboard } from './components/ProjectDashboard';
import { ProjectWizard } from './components/ProjectWizard';
import { BOMImport } from './components/BOMImport';
import { BOMView } from './components/BOMView';
import { BOMHierarchy } from './components/BOMHierarchy';
import { SupplierMatching } from './components/SupplierMatching';
import { PermitsManagement } from './components/PermitsManagement';
import { LogisticsSlots } from './components/LogisticsSlots';
import { MasterDataManager } from './components/MasterDataManager';
import { ReportsManager } from './components/ReportsManager';
import { FileManager } from './components/FileManager';
import { CalendarManager } from './components/CalendarManager';
import { ServiceManagement } from './components/ServiceManagement';
import { FinanceManagement } from './components/FinanceManagement';
import { OperationsManagement } from './components/OperationsManagement';

function AppContent() {
  const { currentProject, globalView, projectView } = useApp();
  const [showProjectWizard, setShowProjectWizard] = useState(false);

  const renderContent = () => {
    if (currentProject) {
      // Project context
      switch (projectView) {
        case 'dashboard':
          return <ProjectDashboard />;
        case 'bom':
          return <BOMHierarchy projectId={currentProject.id} />;
        case 'procurement':
          return <SupplierMatching />;
        case 'permits':
          return <PermitsManagement />;
        case 'logistics':
          return <LogisticsSlots />;
        case 'services':
          return <ServiceManagement />;
        case 'accommodation':
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Unterkunft & Catering</h2>
              <p className="text-muted-foreground">Hotel-Matrix und Catering-Planung - In Entwicklung</p>
            </div>
          );
        case 'operations':
          return <OperationsManagement />;
        case 'finances':
          return <FinanceManagement />;
        case 'files':
          return <FileManager />;
        case 'completion':
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Projekt-Abschluss</h2>
              <p className="text-muted-foreground">Retrospektive, Lessons Learned und Anbieter-Bewertung - In Entwicklung</p>
            </div>
          );
        default:
          return <ProjectDashboard />;
      }
    } else {
      // Global context
      switch (globalView) {
        case 'dashboard':
          return <GlobalDashboard onNewProject={() => setShowProjectWizard(true)} />;
        case 'projects':
          return <ProjectsList onNewProject={() => setShowProjectWizard(true)} />;
        case 'master-data':
          return <MasterDataManager />;
        case 'calendar':
          return <CalendarManager />;
        case 'files':
          return <FileManager />;
        case 'reports':
          return <ReportsManager />;
        case 'settings':
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Einstellungen</h2>
              <p className="text-muted-foreground">Rollen, Integrationen und System-Konfiguration - In Entwicklung</p>
            </div>
          );
        default:
          return <GlobalDashboard onNewProject={() => setShowProjectWizard(true)} />;
      }
    }
  };

  return (
    <NewLayout onNewProject={() => setShowProjectWizard(true)}>
      {renderContent()}
      <ProjectWizard 
        open={showProjectWizard} 
        onOpenChange={setShowProjectWizard} 
      />
    </NewLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}