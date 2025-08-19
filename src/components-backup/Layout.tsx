import React from 'react';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { Calendar, Package, Users, FileText, Truck, Wrench, Calculator, BarChart3, Settings, Plus } from 'lucide-react';
import { Button } from './ui/button';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
  onNewEvent: () => void;
}

const menuItems = [
  { icon: BarChart3, label: 'Dashboard', path: 'dashboard' },
  { icon: Calendar, label: 'Events', path: 'events' },
  { icon: Package, label: 'BOM Import', path: 'bom-import' },
  { icon: Package, label: 'BOM Übersicht', path: 'bom-view' },
  { icon: Users, label: 'Anbieter-Matching', path: 'supplier-matching' },
  { icon: FileText, label: 'Genehmigungen', path: 'permits' },
  { icon: Truck, label: 'Logistik & Slots', path: 'logistics' },
  { icon: Wrench, label: 'Onsite', path: 'onsite' },
  { icon: Calculator, label: 'Abrechnung', path: 'billing' },
];

export function Layout({ children, currentView, onNavigate, onNewEvent }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2 className="font-semibold">Event Manager</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    isActive={currentView === item.path}
                    onClick={() => onNavigate(item.path)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenuButton>
              <Settings className="w-4 h-4" />
              <span>Einstellungen</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 flex flex-col">
          <header className="border-b bg-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1>Event Management System</h1>
            </div>
            <Button onClick={onNewEvent}>
              <Plus className="w-4 h-4 mr-2" />
              Neues Event
            </Button>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}