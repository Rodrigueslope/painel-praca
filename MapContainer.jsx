import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MAP_CONFIG, 
  PONTOS_REFERENCIA, 
  generatePessoasHeatmap, 
  generateVeiculosHeatmap
} from '../data/mockData';

// Fix para ícones do Leaflet no React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente principal do mapa
const MapContainerComponent = ({ showPessoas = true, showVeiculos = true }) => {
  const [pessoasData, setPessoasData] = useState([]);
  const [veiculosData, setVeiculosData] = useState([]);

  // Atualiza dados do heatmap a cada 30 segundos
  useEffect(() => {
    const updateData = () => {
      if (showPessoas) {
        setPessoasData(generatePessoasHeatmap());
      }
      if (showVeiculos) {
        setVeiculosData(generateVeiculosHeatmap());
      }
    };

    // Atualização inicial
    updateData();

    // Atualização periódica
    const interval = setInterval(updateData, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [showPessoas, showVeiculos]);

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={MAP_CONFIG.attribution}
        />
        
        {/* Marcadores dos pontos de referência */}
        {PONTOS_REFERENCIA.map((ponto) => (
          <Marker key={ponto.id} position={[ponto.lat, ponto.lng]}>
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">{ponto.name}</h3>
                <p className="text-sm text-gray-600">Tipo: {ponto.type}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Controles de camadas */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Camadas</h4>
        <div className="space-y-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showPessoas}
              onChange={(e) => {
                console.log('Toggle pessoas:', e.target.checked);
              }}
              className="rounded"
            />
            <span>Fluxo de Pessoas</span>
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-red-500 rounded"></div>
          </label>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={showVeiculos}
              onChange={(e) => {
                console.log('Toggle veículos:', e.target.checked);
              }}
              className="rounded"
            />
            <span>Fluxo de Veículos</span>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-red-500 rounded"></div>
          </label>
        </div>
      </div>
      
      {/* Legenda do heatmap */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="font-semibold text-sm mb-2">Intensidade</h4>
        <div className="flex items-center space-x-2">
          <span className="text-xs">Baixa</span>
          <div className="w-20 h-3 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded"></div>
          <span className="text-xs">Alta</span>
        </div>
        <div className="mt-2 text-xs text-gray-600">
          <div className="flex items-center space-x-1 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded"></div>
            <span>Pessoas: {pessoasData.length} pontos</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded"></div>
            <span>Veículos: {veiculosData.length} pontos</span>
          </div>
        </div>
      </div>

      {/* Simulação de heatmap com círculos coloridos */}
      {showPessoas && pessoasData.map((point, index) => (
        <div
          key={`pessoa-${index}`}
          className="absolute pointer-events-none z-10"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${(point.lng - MAP_CONFIG.center[1]) * 10000}px, ${(MAP_CONFIG.center[0] - point.lat) * 10000}px)`,
            width: `${20 + point.intensity * 30}px`,
            height: `${20 + point.intensity * 30}px`,
            backgroundColor: `rgba(59, 130, 246, ${point.intensity * 0.6})`,
            borderRadius: '50%',
            border: '2px solid rgba(59, 130, 246, 0.8)'
          }}
        />
      ))}

      {showVeiculos && veiculosData.map((point, index) => (
        <div
          key={`veiculo-${index}`}
          className="absolute pointer-events-none z-10"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(${(point.lng - MAP_CONFIG.center[1]) * 10000}px, ${(MAP_CONFIG.center[0] - point.lat) * 10000}px)`,
            width: `${15 + point.intensity * 25}px`,
            height: `${15 + point.intensity * 25}px`,
            backgroundColor: `rgba(147, 51, 234, ${point.intensity * 0.5})`,
            borderRadius: '50%',
            border: '2px solid rgba(147, 51, 234, 0.7)'
          }}
        />
      ))}
    </div>
  );
};

export default MapContainerComponent;

