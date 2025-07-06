import { MapPin, Calendar, User } from 'lucide-react';

const Header = () => {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Título Principal */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Painel Praça da Independência
              </h1>
              <p className="text-sm text-gray-600">
                Análise de Fluxo em Tempo Real - João Pessoa, PB
              </p>
            </div>
          </div>
        </div>

        {/* Informações do Lado Direito */}
        <div className="flex items-center space-x-6">
          {/* Data Atual */}
          <div className="flex items-center space-x-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium capitalize">{currentDate}</span>
          </div>

          {/* Responsável */}
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="w-5 h-5" />
            <div className="text-right">
              <p className="text-sm font-medium">Rodrigues Lopes</p>
              <p className="text-xs text-gray-500">(RBIM)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coordenadas da Praça */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>
              <strong>Coordenadas:</strong> 7° 07′ 11″ S, 34° 52′ 18″ O
            </span>
            <span>
              <strong>Bairro:</strong> Tambiá
            </span>
            <span>
              <strong>Inauguração:</strong> 1922
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">Sistema Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

