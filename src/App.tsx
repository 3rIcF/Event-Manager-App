import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ✅ Event Manager App - BEREIT
          </h1>
          <div className="inline-flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-800 font-semibold">
              Build erfolgreich - Bereit zum Fortfahren!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;