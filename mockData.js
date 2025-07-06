// Dados simulados para o painel da Praça da Independência
// TODO: Substituir por dados reais de APIs quando disponível

// Coordenadas da Praça da Independência
export const PRACA_COORDINATES = {
  lat: -7.119722,
  lng: -34.871667,
  zoom: 17
};

// Pontos de referência na praça
export const PONTOS_REFERENCIA = [
  {
    id: 'centro',
    name: 'Centro da Praça',
    lat: -7.119722,
    lng: -34.871667,
    type: 'centro'
  },
  {
    id: 'coreto',
    name: 'Coreto',
    lat: -7.119800,
    lng: -34.871600,
    type: 'monumento'
  },
  {
    id: 'obelisco',
    name: 'Obelisco',
    lat: -7.119650,
    lng: -34.871700,
    type: 'monumento'
  },
  {
    id: 'entrada_norte',
    name: 'Entrada Norte',
    lat: -7.119600,
    lng: -34.871667,
    type: 'acesso'
  },
  {
    id: 'entrada_sul',
    name: 'Entrada Sul',
    lat: -7.119844,
    lng: -34.871667,
    type: 'acesso'
  }
];

// Função para gerar dados de heatmap de pessoas (simulação)
export const generatePessoasHeatmap = () => {
  const hora = new Date().getHours();
  const baseIntensity = getIntensityByHour(hora);
  
  return [
    // Centro da praça - sempre com mais movimento
    { lat: -7.119722, lng: -34.871667, intensity: baseIntensity * 0.9 },
    
    // Área do coreto
    { lat: -7.119800, lng: -34.871600, intensity: baseIntensity * 0.7 },
    { lat: -7.119790, lng: -34.871610, intensity: baseIntensity * 0.6 },
    
    // Área do obelisco
    { lat: -7.119650, lng: -34.871700, intensity: baseIntensity * 0.8 },
    { lat: -7.119660, lng: -34.871690, intensity: baseIntensity * 0.5 },
    
    // Caminhos principais (formato X)
    { lat: -7.119700, lng: -34.871650, intensity: baseIntensity * 0.6 },
    { lat: -7.119744, lng: -34.871684, intensity: baseIntensity * 0.5 },
    { lat: -7.119700, lng: -34.871684, intensity: baseIntensity * 0.6 },
    { lat: -7.119744, lng: -34.871650, intensity: baseIntensity * 0.5 },
    
    // Entradas da praça
    { lat: -7.119600, lng: -34.871667, intensity: baseIntensity * 0.7 },
    { lat: -7.119844, lng: -34.871667, intensity: baseIntensity * 0.7 },
    { lat: -7.119722, lng: -34.871600, intensity: baseIntensity * 0.6 },
    { lat: -7.119722, lng: -34.871734, intensity: baseIntensity * 0.6 },
    
    // Áreas de descanso (bancos)
    { lat: -7.119680, lng: -34.871620, intensity: baseIntensity * 0.4 },
    { lat: -7.119764, lng: -34.871714, intensity: baseIntensity * 0.4 },
    { lat: -7.119680, lng: -34.871714, intensity: baseIntensity * 0.4 },
    { lat: -7.119764, lng: -34.871620, intensity: baseIntensity * 0.4 },
    
    // Pontos aleatórios para simular movimento
    ...generateRandomPoints(10, baseIntensity * 0.3)
  ];
};

// Função para gerar dados de heatmap de veículos (simulação)
export const generateVeiculosHeatmap = () => {
  const hora = new Date().getHours();
  const baseIntensity = getTrafficIntensityByHour(hora);
  
  return [
    // Avenida Epitácio Pessoa (via principal)
    { lat: -7.119900, lng: -34.871500, intensity: baseIntensity * 0.9 },
    { lat: -7.119920, lng: -34.871520, intensity: baseIntensity * 0.8 },
    { lat: -7.119940, lng: -34.871540, intensity: baseIntensity * 0.7 },
    
    // Ruas laterais
    { lat: -7.119500, lng: -34.871800, intensity: baseIntensity * 0.6 },
    { lat: -7.119480, lng: -34.871820, intensity: baseIntensity * 0.5 },
    
    // Rua do lado oposto
    { lat: -7.119500, lng: -34.871500, intensity: baseIntensity * 0.5 },
    { lat: -7.119520, lng: -34.871480, intensity: baseIntensity * 0.4 },
    
    // Cruzamentos
    { lat: -7.119600, lng: -34.871400, intensity: baseIntensity * 0.7 },
    { lat: -7.119844, lng: -34.871900, intensity: baseIntensity * 0.6 },
    
    // Estacionamentos próximos
    { lat: -7.119300, lng: -34.871600, intensity: baseIntensity * 0.3 },
    { lat: -7.120000, lng: -34.871700, intensity: baseIntensity * 0.3 }
  ];
};

// Função para calcular intensidade baseada na hora do dia
function getIntensityByHour(hora) {
  // Picos: manhã (7-9h), almoço (12-14h), tarde (17-19h)
  if ((hora >= 7 && hora <= 9) || (hora >= 12 && hora <= 14) || (hora >= 17 && hora <= 19)) {
    return 0.8 + Math.random() * 0.2; // 0.8 - 1.0
  }
  // Horário moderado
  else if ((hora >= 10 && hora <= 11) || (hora >= 15 && hora <= 16) || (hora >= 20 && hora <= 21)) {
    return 0.5 + Math.random() * 0.3; // 0.5 - 0.8
  }
  // Horário baixo
  else {
    return 0.1 + Math.random() * 0.4; // 0.1 - 0.5
  }
}

// Função para calcular intensidade de tráfego baseada na hora
function getTrafficIntensityByHour(hora) {
  // Picos de trânsito: manhã (7-9h), tarde (17-19h)
  if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 19)) {
    return 0.9 + Math.random() * 0.1; // 0.9 - 1.0
  }
  // Horário comercial
  else if (hora >= 10 && hora <= 16) {
    return 0.6 + Math.random() * 0.3; // 0.6 - 0.9
  }
  // Horário noturno/madrugada
  else {
    return 0.2 + Math.random() * 0.3; // 0.2 - 0.5
  }
}

// Função para gerar pontos aleatórios dentro da área da praça
function generateRandomPoints(count, intensity) {
  const points = [];
  const centerLat = PRACA_COORDINATES.lat;
  const centerLng = PRACA_COORDINATES.lng;
  const radius = 0.0005; // Raio aproximado da praça
  
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    const lat = centerLat + (distance * Math.cos(angle));
    const lng = centerLng + (distance * Math.sin(angle));
    
    points.push({
      lat,
      lng,
      intensity: intensity * (0.5 + Math.random() * 0.5)
    });
  }
  
  return points;
}

// KPIs simulados
export const generateKPIs = () => {
  const hora = new Date().getHours();
  const baseVisitors = getBaseVisitorsByHour(hora);
  
  return {
    totalPessoas: Math.floor(baseVisitors + (Math.random() * 50 - 25)),
    duracaoMedia: Math.floor(15 + Math.random() * 25), // 15-40 minutos
    ultimaAtualizacao: new Date(),
    statusSistema: 'online',
    // KPIs adicionais
    pessoasUltimaHora: Math.floor(baseVisitors * 1.2 + (Math.random() * 30 - 15)),
    veiculosUltimaHora: Math.floor(baseVisitors * 0.3 + (Math.random() * 10 - 5))
  };
};

// Função para calcular número base de visitantes por hora
function getBaseVisitorsByHour(hora) {
  if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 19)) {
    return 150 + Math.random() * 50; // 150-200 pessoas
  }
  else if ((hora >= 10 && hora <= 16) || (hora >= 20 && hora <= 22)) {
    return 80 + Math.random() * 40; // 80-120 pessoas
  }
  else {
    return 20 + Math.random() * 30; // 20-50 pessoas
  }
}

// Configurações do mapa
export const MAP_CONFIG = {
  center: [PRACA_COORDINATES.lat, PRACA_COORDINATES.lng],
  zoom: PRACA_COORDINATES.zoom,
  minZoom: 15,
  maxZoom: 20,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Configurações do heatmap
export const HEATMAP_CONFIG = {
  pessoas: {
    radius: 25,
    blur: 15,
    maxZoom: 18,
    gradient: {
      0.0: 'blue',
      0.3: 'cyan',
      0.5: 'lime',
      0.7: 'yellow',
      1.0: 'red'
    }
  },
  veiculos: {
    radius: 30,
    blur: 20,
    maxZoom: 18,
    gradient: {
      0.0: 'purple',
      0.3: 'blue',
      0.5: 'green',
      0.7: 'orange',
      1.0: 'red'
    }
  }
};

