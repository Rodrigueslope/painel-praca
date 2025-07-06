import { useState } from 'react';
import Header from './components/Header';
import MapContainerComponent from './components/MapContainer';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [showPessoas, setShowPessoas] = useState(true);
  const [showVeiculos, setShowVeiculos] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map Container */}
        <div className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? 'w-full' : 'lg:w-2/3 xl:w-3/4'
        }`}>
          <MapContainerComponent 
            showPessoas={showPessoas}
            showVeiculos={showVeiculos}
          />
        </div>
        
        {/* Sidebar */}
        <div className={`transition-all duration-300 ${
          sidebarCollapsed 
            ? 'w-0 overflow-hidden' 
            : 'w-full lg:w-1/3 xl:w-1/4 min-w-[320px]'
        }`}>
          <Sidebar />
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-[1001] hover:bg-blue-700 transition-colors"
        aria-label={sidebarCollapsed ? 'Mostrar painel' : 'Ocultar painel'}
      >
        <svg 
          className={`w-6 h-6 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 5l7 7-7 7" 
          />
        </svg>
      </button>

      {/* Floating Controls for Map Layers */}
      <div className="fixed top-20 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] lg:hidden">
        <h4 className="font-semibold text-sm mb-2">Camadas</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showPessoas}
              onChange={(e) => setShowPessoas(e.target.checked)}
              className="rounded"
            />
            <span>Pessoas</span>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-red-500 rounded"></div>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showVeiculos}
              onChange={(e) => setShowVeiculos(e.target.checked)}
              className="rounded"
            />
            <span>Veículos</span>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-red-500 rounded"></div>
          </label>
        </div>
      </div>

      {/* Footer com informações importantes */}
      <footer className="bg-white border-t border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>© 2024 RBIM - Rodrigues Lopes</span>
            <span>Praça da Independência, João Pessoa - PB</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Dados atualizados a cada 30 segundos</span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistema Operacional</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

