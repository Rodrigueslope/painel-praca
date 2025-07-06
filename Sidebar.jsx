import { useState, useEffect } from 'react';
import { Users, Clock, RefreshCw, Activity, Car, MapPin } from 'lucide-react';
import { generateKPIs } from '../data/mockData';

// Componente para cartão de KPI
const KPICard = ({ title, value, icon: Icon, subtitle, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    red: "bg-red-50 text-red-600 border-red-200"
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${colorClasses[color]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-6 h-6" />
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
      {subtitle && (
        <p className="text-xs opacity-75 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

// Componente principal da sidebar
const Sidebar = () => {
  const [kpis, setKpis] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Atualiza KPIs a cada 30 segundos
  useEffect(() => {
    const updateKPIs = () => {
      setIsLoading(true);
      // Simula delay de API
      setTimeout(() => {
        setKpis(generateKPIs());
        setIsLoading(false);
      }, 500);
    };

    // Atualização inicial
    updateKPIs();

    // Atualização periódica
    const interval = setInterval(updateKPIs, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading && !kpis.totalPessoas) {
    return (
      <div className="h-full bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-50 p-6 overflow-y-auto">
      {/* Header da Sidebar */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Dashboard
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Praça da Independência</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">João Pessoa, PB</p>
      </div>

      {/* KPIs Principais */}
      <div className="space-y-4 mb-6">
        <KPICard
          title="Total de Pessoas"
          value={kpis.totalPessoas || 0}
          icon={Users}
          subtitle="Presentes na praça"
          color="blue"
        />
        
        <KPICard
          title="Duração Média"
          value={`${kpis.duracaoMedia || 0}min`}
          icon={Clock}
          subtitle="Tempo de permanência"
          color="green"
        />
        
        <KPICard
          title="Pessoas/Hora"
          value={kpis.pessoasUltimaHora || 0}
          icon={Activity}
          subtitle="Última hora"
          color="yellow"
        />
        
        <KPICard
          title="Veículos/Hora"
          value={kpis.veiculosUltimaHora || 0}
          icon={Car}
          subtitle="Fluxo no entorno"
          color="purple"
        />
      </div>

      {/* Status do Sistema */}
      <div className="bg-white rounded-lg p-4 mb-6 border">
        <h3 className="font-semibold text-sm mb-3 flex items-center">
          <Activity className="w-4 h-4 mr-2" />
          Status do Sistema
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sistema</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sensores</span>
            <span className="text-sm font-medium text-green-600">Ativos</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Conectividade</span>
            <span className="text-sm font-medium text-green-600">Estável</span>
          </div>
        </div>
      </div>

      {/* Última Atualização */}
      <div className="bg-white rounded-lg p-4 border">
        <h3 className="font-semibold text-sm mb-3 flex items-center">
          <RefreshCw className="w-4 h-4 mr-2" />
          Última Atualização
        </h3>
        <div className="space-y-1">
          <p className="text-lg font-bold text-gray-800">
            {kpis.ultimaAtualizacao ? formatTime(kpis.ultimaAtualizacao) : '--:--:--'}
          </p>
          <p className="text-sm text-gray-600">
            {kpis.ultimaAtualizacao ? formatDate(kpis.ultimaAtualizacao) : '--/--/----'}
          </p>
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">
              Próxima atualização em 30s
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-blue-600 h-1 rounded-full animate-pulse" 
                style={{ width: '75%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Informações do Responsável */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-1">Responsável</p>
          <p className="text-sm font-semibold text-gray-700">Rodrigues Lopes</p>
          <p className="text-xs text-gray-500">(RBIM)</p>
        </div>
      </div>

      {/* Nota sobre integração futura */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          <strong>Nota:</strong> Dados simulados para demonstração. 
          Estrutura preparada para integração com APIs reais.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;

