import React, { createContext, useContext, useState, ReactNode } from 'react';

// Base data structures following the specification
export interface GlobalMaterial {
  id: string;
  name: string;
  category: string;
  unit: string;
  specs?: string;
  portfolio?: string[];
  standardLeadTime?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  usedInProjects: string[];
}

export interface ProjectMaterial {
  id: string;
  projectId: string;
  globalMaterialId: string;
  quantity: number;
  phase: 'setup' | 'show' | 'teardown';
  location?: string;
  deliveryTime?: string;
  pickupTime?: string;
  needs?: string[];
  specialPrice?: number;
  notes?: string;
  // Override flags
  hasOverride: boolean;
  overriddenFields: string[];
  lastSyncVersion: number;
}

export interface GlobalSupplier {
  id: string;
  name: string;
  portfolio: string[];
  regions: string[];
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  scores: {
    quality: number;
    punctuality: number;
    price: number;
    overall: number;
  };
  version: number;
  usedInProjects: string[];
}

export interface ProjectSupplier {
  id: string;
  projectId: string;
  globalSupplierId: string;
  timeline: {
    arrival?: string;
    setup?: string;
    operation?: string;
    teardown?: string;
  };
  needs: string[];
  personnel: number;
  vehicles: string[];
  onsiteContact: string;
  briefingGenerated: boolean;
  hasOverride: boolean;
  overriddenFields: string[];
}

export interface Comment {
  id: string;
  entityType: 'material' | 'supplier' | 'project';
  entityId: string;
  scope: 'global' | 'project';
  projectId?: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface DiffNotification {
  id: string;
  projectId: string;
  entityType: 'material' | 'supplier';
  entityId: string;
  globalEntityId: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  status: 'pending' | 'ignored' | 'accepted';
  createdAt: string;
}

interface DataContextType {
  // Global data
  globalMaterials: GlobalMaterial[];
  globalSuppliers: GlobalSupplier[];
  
  // Project data
  projectMaterials: Record<string, ProjectMaterial[]>;
  projectSuppliers: Record<string, ProjectSupplier[]>;
  
  // Comments
  comments: Comment[];
  
  // Diff notifications
  diffNotifications: DiffNotification[];
  
  // Actions
  addGlobalMaterial: (material: Omit<GlobalMaterial, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'usedInProjects'>) => GlobalMaterial;
  updateGlobalMaterial: (id: string, updates: Partial<GlobalMaterial>) => void;
  addProjectMaterial: (projectId: string, material: Omit<ProjectMaterial, 'id'>) => void;
  updateProjectMaterial: (projectId: string, materialId: string, updates: Partial<ProjectMaterial>) => void;
  
  addComment: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  getCommentsForEntity: (entityType: string, entityId: string, scope?: 'global' | 'project', projectId?: string) => Comment[];
  
  createDiffNotification: (notification: Omit<DiffNotification, 'id' | 'createdAt'>) => void;
  handleDiffAction: (notificationId: string, action: 'accept' | 'ignore') => void;
  
  // Helper functions
  getEffectiveMaterial: (projectId: string, globalMaterialId: string) => GlobalMaterial & Partial<ProjectMaterial>;
  getMaterialUsage: (globalMaterialId: string) => { projectCount: number; openNeeds: number; };
}

const DataContext = createContext<DataContextType | null>(null);

// Mock data
const mockGlobalMaterials: GlobalMaterial[] = [
  {
    id: 'mat_001',
    name: 'Bauzaun Element 3,5m',
    category: 'Absperrung',
    unit: 'Stk',
    specs: 'Standard Bauzaun, feuerverzinkt, 3,5m x 2m',
    portfolio: ['basic', 'outdoor'],
    standardLeadTime: 2,
    version: 3,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-20',
    usedInProjects: ['proj_001', 'proj_002']
  },
  {
    id: 'mat_002',
    name: 'LED Spot 50W RGB',
    category: 'Technik',
    unit: 'Stk',
    specs: 'Professioneller LED Scheinwerfer, DMX-steuerbar, IP65',
    portfolio: ['lighting', 'rgb', 'dmx'],
    standardLeadTime: 5,
    version: 1,
    createdAt: '2024-02-10',
    updatedAt: '2024-02-10',
    usedInProjects: ['proj_001']
  }
];

const mockProjectMaterials: Record<string, ProjectMaterial[]> = {
  'proj_001': [
    {
      id: 'pmat_001',
      projectId: 'proj_001',
      globalMaterialId: 'mat_001',
      quantity: 150,
      phase: 'setup',
      location: 'Perimeter Süd',
      deliveryTime: '2025-09-15 08:00',
      pickupTime: '2025-09-18 16:00',
      needs: ['stapler', 'crew_2'],
      hasOverride: true,
      overriddenFields: ['quantity', 'location'],
      lastSyncVersion: 2
    },
    {
      id: 'pmat_002',
      projectId: 'proj_001',
      globalMaterialId: 'mat_002',
      quantity: 12,
      phase: 'setup',
      hasOverride: false,
      overriddenFields: [],
      lastSyncVersion: 1
    }
  ]
};

const mockComments: Comment[] = [
  {
    id: 'comment_001',
    entityType: 'material',
    entityId: 'mat_001',
    scope: 'global',
    content: 'Neuer Lieferant verfügbar - bessere Preise',
    author: 'Anna Schmidt',
    createdAt: '2024-12-20T10:30:00Z'
  },
  {
    id: 'comment_002',
    entityType: 'material',
    entityId: 'pmat_001',
    scope: 'project',
    projectId: 'proj_001',
    content: 'Boden ist sehr weich - extra Füße bestellen',
    author: 'Max Müller',
    createdAt: '2024-12-21T14:15:00Z'
  }
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [globalMaterials, setGlobalMaterials] = useState<GlobalMaterial[]>(mockGlobalMaterials);
  const [globalSuppliers, setGlobalSuppliers] = useState<GlobalSupplier[]>([]);
  const [projectMaterials, setProjectMaterials] = useState<Record<string, ProjectMaterial[]>>(mockProjectMaterials);
  const [projectSuppliers, setProjectSuppliers] = useState<Record<string, ProjectSupplier[]>>({});
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [diffNotifications, setDiffNotifications] = useState<DiffNotification[]>([]);

  const addGlobalMaterial = (material: Omit<GlobalMaterial, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'usedInProjects'>) => {
    const newMaterial: GlobalMaterial = {
      ...material,
      id: `mat_${Date.now()}`,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usedInProjects: []
    };
    
    setGlobalMaterials(prev => [...prev, newMaterial]);
    return newMaterial;
  };

  const updateGlobalMaterial = (id: string, updates: Partial<GlobalMaterial>) => {
    setGlobalMaterials(prev => prev.map(material => {
      if (material.id === id) {
        const updated = {
          ...material,
          ...updates,
          version: material.version + 1,
          updatedAt: new Date().toISOString()
        };
        
        // Create diff notifications for projects using this material
        const affectedProjects = Object.entries(projectMaterials)
          .filter(([projectId, materials]) => 
            materials.some(pm => pm.globalMaterialId === id && pm.hasOverride)
          );
        
        affectedProjects.forEach(([projectId]) => {
          createDiffNotification({
            projectId,
            entityType: 'material',
            entityId: id,
            globalEntityId: id,
            changes: Object.keys(updates).map(field => ({
              field,
              oldValue: (material as any)[field],
              newValue: (updates as any)[field]
            })),
            status: 'pending'
          });
        });
        
        return updated;
      }
      return material;
    }));
  };

  const addProjectMaterial = (projectId: string, material: Omit<ProjectMaterial, 'id'>) => {
    const newMaterial: ProjectMaterial = {
      ...material,
      id: `pmat_${Date.now()}`
    };
    
    setProjectMaterials(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), newMaterial]
    }));
    
    // Update global material usage
    setGlobalMaterials(prev => prev.map(gm => 
      gm.id === material.globalMaterialId 
        ? { ...gm, usedInProjects: [...new Set([...gm.usedInProjects, projectId])] }
        : gm
    ));
  };

  const updateProjectMaterial = (projectId: string, materialId: string, updates: Partial<ProjectMaterial>) => {
    setProjectMaterials(prev => ({
      ...prev,
      [projectId]: (prev[projectId] || []).map(material =>
        material.id === materialId ? { ...material, ...updates } : material
      )
    }));
  };

  const addComment = (comment: Omit<Comment, 'id' | 'createdAt'>) => {
    const newComment: Comment = {
      ...comment,
      id: `comment_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setComments(prev => [...prev, newComment]);
  };

  const getCommentsForEntity = (entityType: string, entityId: string, scope?: 'global' | 'project', projectId?: string) => {
    return comments.filter(comment => 
      comment.entityType === entityType && 
      comment.entityId === entityId &&
      (!scope || comment.scope === scope) &&
      (!projectId || comment.projectId === projectId)
    );
  };

  const createDiffNotification = (notification: Omit<DiffNotification, 'id' | 'createdAt'>) => {
    const newNotification: DiffNotification = {
      ...notification,
      id: `diff_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    
    setDiffNotifications(prev => [...prev, newNotification]);
  };

  const handleDiffAction = (notificationId: string, action: 'accept' | 'ignore') => {
    const notification = diffNotifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    if (action === 'accept') {
      // Remove override from project material
      setProjectMaterials(prev => ({
        ...prev,
        [notification.projectId]: (prev[notification.projectId] || []).map(material =>
          material.globalMaterialId === notification.globalEntityId
            ? { ...material, hasOverride: false, overriddenFields: [] }
            : material
        )
      }));
    }
    
    // Mark notification as handled
    setDiffNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, status: action === 'accept' ? 'accepted' : 'ignored' } : n
    ));
  };

  const getEffectiveMaterial = (projectId: string, globalMaterialId: string) => {
    const globalMaterial = globalMaterials.find(m => m.id === globalMaterialId);
    const projectMaterial = projectMaterials[projectId]?.find(m => m.globalMaterialId === globalMaterialId);
    
    if (!globalMaterial) throw new Error('Global material not found');
    
    // Merge global and project data, with project overrides taking precedence
    return {
      ...globalMaterial,
      ...(projectMaterial || {}),
      // Effective view combines both
      isProjectSpecific: !!projectMaterial,
      hasOverride: projectMaterial?.hasOverride || false
    };
  };

  const getMaterialUsage = (globalMaterialId: string) => {
    const projectCount = Object.values(projectMaterials)
      .filter(materials => materials.some(m => m.globalMaterialId === globalMaterialId))
      .length;
    
    const openNeeds = Object.values(projectMaterials)
      .flat()
      .filter(m => m.globalMaterialId === globalMaterialId)
      .reduce((sum, m) => sum + m.quantity, 0);
    
    return { projectCount, openNeeds };
  };

  return (
    <DataContext.Provider value={{
      globalMaterials,
      globalSuppliers,
      projectMaterials,
      projectSuppliers,
      comments,
      diffNotifications,
      addGlobalMaterial,
      updateGlobalMaterial,
      addProjectMaterial,
      updateProjectMaterial,
      addComment,
      getCommentsForEntity,
      createDiffNotification,
      handleDiffAction,
      getEffectiveMaterial,
      getMaterialUsage
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}