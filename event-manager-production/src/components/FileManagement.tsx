import React, { useState, useRef } from 'react';

interface FileItem {
  id: string;
  name: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  category: 'contracts' | 'permits' | 'technical' | 'marketing' | 'financials' | 'photos' | 'other';
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  projectId?: string;
  tags?: string[];
  version: number;
  isPublic: boolean;
  downloadCount: number;
  lastAccessed?: string;
}

const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'stadtfest_genehmigung_2025.pdf',
    originalName: 'Genehmigung_Stadtfest_München.pdf',
    fileType: 'application/pdf',
    fileSize: 2456789,
    category: 'permits',
    description: 'Behördliche Genehmigung für Stadtfest München 2025',
    uploadedBy: 'Klaus Richter',
    uploadedAt: '2024-12-15T10:30:00Z',
    projectId: '1',
    tags: ['Genehmigung', 'Behörde', 'München'],
    version: 2,
    isPublic: false,
    downloadCount: 12,
    lastAccessed: '2024-12-20T14:22:00Z'
  },
  {
    id: '2',
    name: 'catering_vertrag_gourmet_events.pdf',
    originalName: 'Vertrag_Catering_VIP.pdf',
    fileType: 'application/pdf',
    fileSize: 892345,
    category: 'contracts',
    description: 'Catering-Vertrag für VIP-Bereich',
    uploadedBy: 'Maria Schneider',
    uploadedAt: '2024-12-10T16:45:00Z',
    projectId: '1',
    tags: ['Vertrag', 'Catering', 'VIP'],
    version: 1,
    isPublic: false,
    downloadCount: 8
  },
  {
    id: '3',
    name: 'buehnenplan_technisch.dwg',
    originalName: 'Technical_Stage_Plan_v3.dwg',
    fileType: 'application/acad',
    fileSize: 15678901,
    category: 'technical',
    description: 'Technischer Bühnenplan mit Verkabelung',
    uploadedBy: 'Thomas Weber',
    uploadedAt: '2024-12-08T09:15:00Z',
    projectId: '1',
    tags: ['Technik', 'Bühne', 'Plan'],
    version: 3,
    isPublic: true,
    downloadCount: 25,
    lastAccessed: '2024-12-21T11:30:00Z'
  },
  {
    id: '4',
    name: 'marketing_flyer_entwurf.jpg',
    originalName: 'Flyer_Design_Final.jpg',
    fileType: 'image/jpeg',
    fileSize: 3456789,
    category: 'marketing',
    description: 'Finaler Flyer-Entwurf für Print',
    uploadedBy: 'Anna Schmidt',
    uploadedAt: '2024-12-05T14:20:00Z',
    projectId: '1',
    tags: ['Marketing', 'Flyer', 'Design'],
    version: 1,
    isPublic: true,
    downloadCount: 45
  }
];

export function FileManagement() {
  const [files, setFiles] = useState<FileItem[]>(mockFiles);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterProject, setFilterProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'downloads'>('date');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): string => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📈';
    if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
    return '📎';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'contracts': 'bg-blue-100 text-blue-800',
      'permits': 'bg-green-100 text-green-800',
      'technical': 'bg-purple-100 text-purple-800',
      'marketing': 'bg-pink-100 text-pink-800',
      'financials': 'bg-yellow-100 text-yellow-800',
      'photos': 'bg-indigo-100 text-indigo-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'contracts': 'Verträge',
      'permits': 'Genehmigungen',
      'technical': 'Technik',
      'marketing': 'Marketing',
      'financials': 'Finanzen',
      'photos': 'Fotos',
      'other': 'Sonstiges'
    };
    return labels[category] || category;
  };

  const filteredFiles = files.filter(file => {
    const categoryMatch = filterCategory === 'all' || file.category === filterCategory;
    const projectMatch = filterProject === 'all' || file.projectId === filterProject || (!file.projectId && filterProject === 'global');
    const searchMatch = searchTerm === '' || 
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return categoryMatch && projectMatch && searchMatch;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'date':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'size':
        return b.fileSize - a.fileSize;
      case 'downloads':
        return b.downloadCount - a.downloadCount;
      default:
        return 0;
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    Array.from(uploadedFiles).forEach(file => {
      const newFile: FileItem = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
        category: 'other',
        description: '',
        uploadedBy: 'Current User',
        uploadedAt: new Date().toISOString(),
        projectId: '1', // Current project
        tags: [],
        version: 1,
        isPublic: false,
        downloadCount: 0
      };

      setFiles(prev => [...prev, newFile]);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadFile = (file: FileItem) => {
    // Simulate file download
    setFiles(prev => prev.map(f => 
      f.id === file.id 
        ? { 
            ...f, 
            downloadCount: f.downloadCount + 1,
            lastAccessed: new Date().toISOString()
          }
        : f
    ));
    
    // In real implementation, would trigger actual download
    alert(`Download gestartet: ${file.originalName}`);
  };

  const deleteFile = (fileId: string) => {
    if (window.confirm('Datei wirklich löschen?')) {
      setFiles(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const renderFileGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredFiles.map(file => (
        <div key={file.id} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="text-center mb-3">
            <div className="text-4xl mb-2">{getFileIcon(file.fileType)}</div>
            <h4 className="font-medium text-gray-900 text-sm truncate" title={file.originalName}>
              {file.originalName}
            </h4>
          </div>

          <div className="space-y-2 text-xs text-gray-600 mb-3">
            <div className="flex justify-between">
              <span>Größe:</span>
              <span>{formatFileSize(file.fileSize)}</span>
            </div>
            <div className="flex justify-between">
              <span>Downloads:</span>
              <span>{file.downloadCount}</span>
            </div>
            <div className="flex justify-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                {getCategoryLabel(file.category)}
              </span>
            </div>
          </div>

          {file.description && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{file.description}</p>
          )}

          <div className="flex gap-1">
            <button 
              onClick={() => downloadFile(file)}
              className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
            >
              Download
            </button>
            <button 
              onClick={() => setSelectedFile(file)}
              className="flex-1 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50"
            >
              Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFileList = () => (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datei</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Größe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hochgeladen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Downloads</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFiles.map(file => (
              <tr key={file.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(file.fileType)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{file.originalName}</p>
                      {file.description && (
                        <p className="text-sm text-gray-500 truncate max-w-xs">{file.description}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                    {getCategoryLabel(file.category)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatFileSize(file.fileSize)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>
                    <p>{new Date(file.uploadedAt).toLocaleDateString()}</p>
                    <p className="text-xs">{file.uploadedBy}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {file.downloadCount}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => downloadFile(file)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Download
                    </button>
                    <button 
                      onClick={() => setSelectedFile(file)}
                      className="text-gray-600 hover:text-gray-800 text-sm"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => deleteFile(file.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Löschen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderFileDetail = () => {
    if (!selectedFile) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Zurück
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{getFileIcon(selectedFile.fileType)}</span>
              <h2 className="text-xl font-semibold">{selectedFile.originalName}</h2>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => downloadFile(selectedFile)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Download
            </button>
            <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
              Bearbeiten
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Datei-Informationen</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Dateiname:</span>
                    <p className="font-medium">{selectedFile.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Dateigröße:</span>
                    <p className="font-medium">{formatFileSize(selectedFile.fileSize)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Typ:</span>
                    <p className="font-medium">{selectedFile.fileType}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Version:</span>
                    <p className="font-medium">v{selectedFile.version}</p>
                  </div>
                </div>

                {selectedFile.description && (
                  <div className="pt-2 border-t">
                    <span className="text-sm text-gray-500">Beschreibung:</span>
                    <p className="text-sm">{selectedFile.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Upload-Details</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Hochgeladen von:</span>
                  <p className="font-medium">{selectedFile.uploadedBy}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Hochgeladen am:</span>
                  <p className="font-medium">{new Date(selectedFile.uploadedAt).toLocaleString()}</p>
                </div>
                {selectedFile.lastAccessed && (
                  <div>
                    <span className="text-sm text-gray-500">Letzter Zugriff:</span>
                    <p className="font-medium">{new Date(selectedFile.lastAccessed).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Kategorisierung</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Kategorie:</span>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedFile.category)}`}>
                      {getCategoryLabel(selectedFile.category)}
                    </span>
                  </div>
                </div>

                {selectedFile.tags && selectedFile.tags.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-500">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedFile.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-500">Sichtbarkeit:</span>
                  <p className="font-medium">
                    {selectedFile.isPublic ? '🌐 Öffentlich' : '🔒 Privat'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Statistiken</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Downloads:</span>
                  <span className="font-medium">{selectedFile.downloadCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Version:</span>
                  <span className="font-medium">v{selectedFile.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Projekt:</span>
                  <span className="font-medium">
                    {selectedFile.projectId || 'Global'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Aktionen</h3>
              <div className="space-y-2">
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm">
                  Neue Version hochladen
                </button>
                <button className="w-full border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
                  Link teilen
                </button>
                <button className="w-full border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
                  Tags bearbeiten
                </button>
                <button 
                  onClick={() => deleteFile(selectedFile.id)}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                >
                  Datei löschen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (selectedFile) {
    return (
      <div className="p-6">
        {renderFileDetail()}
      </div>
    );
  }

  const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
  const totalDownloads = files.reduce((sum, file) => sum + file.downloadCount, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dateiverwaltung</h1>
          <p className="text-gray-600">Dokumente, Pläne und Medien verwalten</p>
        </div>
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.dwg"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            📁 Dateien hochladen
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Dateien gesamt</h3>
          <p className="text-2xl font-bold text-gray-900">{files.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Gesamtgröße</h3>
          <p className="text-2xl font-bold text-blue-600">{formatFileSize(totalSize)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Downloads</h3>
          <p className="text-2xl font-bold text-green-600">{totalDownloads}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-500">Kategorien</h3>
          <p className="text-2xl font-bold text-purple-600">
            {Array.from(new Set(files.map(f => f.category))).length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <input
              type="text"
              placeholder="Dateien durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded px-3 py-2 text-sm w-64"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Kategorie:</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Alle</option>
              <option value="contracts">Verträge</option>
              <option value="permits">Genehmigungen</option>
              <option value="technical">Technik</option>
              <option value="marketing">Marketing</option>
              <option value="financials">Finanzen</option>
              <option value="photos">Fotos</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Projekt:</label>
            <select 
              value={filterProject} 
              onChange={(e) => setFilterProject(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="all">Alle</option>
              <option value="global">Global</option>
              <option value="1">Stadtfest München</option>
              <option value="2">BMW Pressekonferenz</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mr-2">Sortierung:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="date">Datum</option>
              <option value="name">Name</option>
              <option value="size">Größe</option>
              <option value="downloads">Downloads</option>
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm ${
                viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
              }`}
            >
              ☰ Liste
            </button>
          </div>
        </div>
      </div>

      {/* File Content */}
      {filteredFiles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="text-gray-400 text-4xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Dateien gefunden</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? `Keine Dateien für "${searchTerm}" gefunden.` : 'Laden Sie Ihre ersten Dateien hoch.'}
          </p>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Dateien hochladen
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' && renderFileGrid()}
          {viewMode === 'list' && renderFileList()}
        </>
      )}
    </div>
  );
}