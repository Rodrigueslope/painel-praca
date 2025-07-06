// Configurações da Praça da Independência
const PRACA_CONFIG = {
    center: [-7.119722, -34.871667],
    zoom: 17,
    minZoom: 15,
    maxZoom: 20
};

// API OpenWeather - Configuração com fallback
const WEATHER_CONFIG = {
    apiKey: 'd9da98b3560b007a19706897feaa7416',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    // Fallback para CORS - usar proxy se necessário
    proxyUrl: '', // Pode ser configurado se necessário
    timeout: 10000 // 10 segundos timeout
};

// Pontos de referência
const PONTOS_REFERENCIA = [
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
    // Entradas em pontos diferentes:
    {
        id: 'entrada_norte',
        name: 'Entrada Norte',
        lat: -7.118384,
        lng: -34.870916,
        type: 'acesso'
    },
    {
        id: 'entrada_sul',
        name: 'Entrada Sul',
        lat: -7.119900,
        lng: -34.870563,
        type: 'acesso'
    },
    {
        id: 'entrada_leste',
        name: 'Entrada Leste',
        lat: -7.119545,
        lng: -34.871400,
        type: 'acesso'
    },
    {
        id: 'entrada_oeste',
        name: 'Entrada Oeste',
        lat: -7.119722,
        lng: -34.871950,
        type: 'acesso'
    }
];

// Variáveis globais
let map;
let pessoasData = [];
let veiculosData = [];
let pessoasMarkers = [];
let veiculosMarkers = [];
let showPessoas = true;
let showVeiculos = true;
let weatherData = {};
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 5;

// Log de debug
console.log('Script carregado, aguardando DOM...');

// CORREÇÃO: Aguardar DOM estar totalmente carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM totalmente carregado, iniciando aplicação...');
    
    // Verificar se o elemento do mapa existe
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        console.error('Elemento #map não encontrado no DOM!');
        showError('Erro: Elemento do mapa não encontrado.');
        return;
    }
    
    console.log('Elemento #map encontrado, verificando Leaflet...');
    
    // Aguardar Leaflet carregar com retry mais robusto
    waitForLeafletRobust();
});

// Aguardar Leaflet carregar com retry robusto
function waitForLeafletRobust() {
    initializationAttempts++;
    
    if (typeof L !== 'undefined' && L.map) {
        console.log('Leaflet carregado com sucesso, inicializando mapa...');
        initializeApp();
    } else if (initializationAttempts < MAX_INIT_ATTEMPTS) {
        console.log(`Tentativa ${initializationAttempts}/${MAX_INIT_ATTEMPTS}: Aguardando Leaflet carregar...`);
        setTimeout(waitForLeafletRobust, 1000); // Aumentar intervalo para 1 segundo
    } else {
        console.error('Falha ao carregar Leaflet após múltiplas tentativas');
        showError('Erro ao carregar biblioteca de mapas. Tente recarregar a página.');
        
        // Tentar carregar Leaflet via CDN alternativo
        loadLeafletFallback();
    }
}

// Carregar Leaflet via CDN alternativo
function loadLeafletFallback() {
    console.log('Tentando carregar Leaflet via CDN alternativo...');
    
    // Remover scripts existentes
    const existingScripts = document.querySelectorAll('script[src*="leaflet"]');
    existingScripts.forEach(script => script.remove());
    
    // Carregar CSS alternativo
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
    cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    cssLink.crossOrigin = '';
    document.head.appendChild(cssLink);
    
    // Carregar JS alternativo
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    
    script.onload = function() {
        console.log('Leaflet carregado via CDN alternativo');
        initializationAttempts = 0; // Reset contador
        setTimeout(() => {
            if (typeof L !== 'undefined' && L.map) {
                initializeApp();
            } else {
                showError('Erro persistente ao carregar mapas. Verifique sua conexão.');
            }
        }, 1000);
    };
    
    script.onerror = function() {
        console.error('Falha ao carregar Leaflet via CDN alternativo');
        showError('Erro ao carregar biblioteca de mapas. Verifique sua conexão com a internet.');
    };
    
    document.head.appendChild(script);
}

// Inicializar aplicação
function initializeApp() {
    try {
        console.log('Inicializando aplicação...');
        
        // Remover loading
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Inicializar mapa
        initializeMap();
        
        // Aguardar mapa carregar antes de continuar
        setTimeout(() => {
            initializeEventListeners();
            setupHorarioFilter(); // Configurar filtro de horários
            updateDateTime();
            updateData();
            fetchWeatherData();
            
            // Configurar intervalos
            setInterval(updateData, 30000);
            setInterval(fetchWeatherData, 600000);
            setInterval(updateDateTime, 1000);
            
            console.log('Aplicação inicializada com sucesso!');
        }, 1000);
        
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        showError('Erro ao carregar o painel. Recarregue a página.');
    }
}

// Inicializar mapa com verificações robustas
function initializeMap() {
    try {
        console.log('Criando mapa...');
        
        // Verificar novamente se o elemento existe
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            throw new Error('Elemento #map não encontrado');
        }
        
        // Verificar se Leaflet está disponível
        if (typeof L === 'undefined' || !L.map) {
            throw new Error('Leaflet não está disponível');
        }
        
        // Criar mapa
        map = L.map('map', {
            center: PRACA_CONFIG.center,
            zoom: PRACA_CONFIG.zoom,
            minZoom: PRACA_CONFIG.minZoom,
            maxZoom: PRACA_CONFIG.maxZoom,
            zoomControl: true,
            attributionControl: true,
            preferCanvas: true // Melhor performance
        });
        
        console.log('Mapa criado com sucesso, adicionando tiles...');
        
        // Múltiplos provedores de tiles para fallback
        const tileProviders = [
            {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                options: {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                    subdomains: ['a', 'b', 'c']
                }
            },
            {
                url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                options: {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19
                }
            }
        ];
        
        // Tentar carregar tiles
        let tileLayer;
        let providerIndex = 0;
        
        function tryLoadTiles() {
            if (providerIndex >= tileProviders.length) {
                console.error('Todos os provedores de tiles falharam');
                showError('Erro ao carregar mapa base. Verifique sua conexão.');
                return;
            }
            
            const provider = tileProviders[providerIndex];
            console.log(`Tentando provedor ${providerIndex + 1}: ${provider.url}`);
            
            tileLayer = L.tileLayer(provider.url, provider.options);
            
            tileLayer.on('load', function() {
                console.log('Tiles carregados com sucesso!');
                addReferenceMarkers();
            });
            
            tileLayer.on('tileerror', function(e) {
                console.warn(`Erro ao carregar tile do provedor ${providerIndex + 1}:`, e);
                providerIndex++;
                if (providerIndex < tileProviders.length) {
                    map.removeLayer(tileLayer);
                    setTimeout(tryLoadTiles, 1000);
                }
            });
            
            tileLayer.addTo(map);
        }
        
        tryLoadTiles();
        
        // Forçar carregamento após timeout
        setTimeout(() => {
            if (map) {
                map.invalidateSize();
                console.log('Mapa redimensionado');
                addReferenceMarkers();
            }
        }, 3000);
        
        console.log('Mapa inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar mapa:', error);
        showError('Erro ao carregar o mapa. Verifique sua conexão.');
    }
}

// Adicionar marcadores de referência
function addReferenceMarkers() {
    try {
        console.log('Adicionando marcadores de referência...');
        
        if (!map) {
            console.error('Mapa não está inicializado');
            return;
        }
        
        PONTOS_REFERENCIA.forEach(ponto => {
            const marker = L.marker([ponto.lat, ponto.lng]).addTo(map);
            marker.bindPopup(`
                <div style="text-align: center; padding: 0.5rem;">
                    <h3 style="margin: 0 0 0.5rem 0; font-size: 14px; color: #1e293b;">${ponto.name}</h3>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">Tipo: ${ponto.type}</p>
                    <p style="margin: 0.25rem 0 0 0; font-size: 10px; color: #9ca3af;">
                        ${ponto.lat.toFixed(6)}, ${ponto.lng.toFixed(6)}
                    </p>
                </div>
            `);
        });
        
        console.log('Marcadores de referência adicionados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao adicionar marcadores:', error);
    }
}

// Mostrar erro
function showError(message) {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.innerHTML = `
            <div style="color: #dc2626;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                <p>${message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Recarregar Página
                </button>
            </div>
        `;
        loading.style.display = 'block';
    }
}

// Inicializar event listeners
function initializeEventListeners() {
    try {
        console.log('Configurando event listeners...');
        
        const togglePessoas = document.getElementById('toggle-pessoas');
        const toggleVeiculos = document.getElementById('toggle-veiculos');
        
        if (togglePessoas) {
            togglePessoas.addEventListener('change', function(e) {
                showPessoas = e.target.checked;
                console.log('Toggle pessoas:', showPessoas);
                updateHeatmapDisplay();
            });
        }
        
        if (toggleVeiculos) {
            toggleVeiculos.addEventListener('change', function(e) {
                showVeiculos = e.target.checked;
                console.log('Toggle veículos:', showVeiculos);
                updateHeatmapDisplay();
            });
        }
        
        console.log('Event listeners configurados com sucesso!');
        
    } catch (error) {
        console.error('Erro ao configurar event listeners:', error);
    }
}

// Buscar dados meteorológicos com timeout e fallback
async function fetchWeatherData() {
    try {
        console.log('Buscando dados meteorológicos...');
        
        const lat = Math.abs(PRACA_CONFIG.center[0]);
        const lon = Math.abs(PRACA_CONFIG.center[1]);
        
        // URLs com timeout
        const currentWeatherUrl = `${WEATHER_CONFIG.baseUrl}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_CONFIG.apiKey}&units=metric&lang=pt_br`;
        const airQualityUrl = `${WEATHER_CONFIG.baseUrl}/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_CONFIG.apiKey}`;
        
        // Função para fetch com timeout
        const fetchWithTimeout = (url, timeout = WEATHER_CONFIG.timeout) => {
            return Promise.race([
                fetch(url),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), timeout)
                )
            ]);
        };
        
        const [weatherResponse, airResponse] = await Promise.allSettled([
            fetchWithTimeout(currentWeatherUrl),
            fetchWithTimeout(airQualityUrl)
        ]);
        
        let weather = null;
        let air = null;
        
        // Processar resposta do clima
        if (weatherResponse.status === 'fulfilled' && weatherResponse.value.ok) {
            weather = await weatherResponse.value.json();
        } else {
            console.warn('Erro ao buscar dados de clima:', weatherResponse.reason);
        }
        
        // Processar resposta da qualidade do ar
        if (airResponse.status === 'fulfilled' && airResponse.value.ok) {
            air = await airResponse.value.json();
        } else {
            console.warn('Erro ao buscar dados de qualidade do ar:', airResponse.reason);
        }
        
        // Montar dados meteorológicos
        if (weather) {
            weatherData = {
                temperature: Math.round(weather.main.temp),
                windSpeed: Math.round(weather.wind.speed * 3.6),
                windDirection: weather.wind.deg || 0,
                humidity: weather.main.humidity,
                pressure: weather.main.pressure,
                airQuality: air ? air.list[0].main.aqi : Math.ceil(Math.random() * 3) + 1,
                uvIndex: Math.round(Math.random() * 8) + 1, // Simulado
                description: weather.weather[0].description,
                icon: weather.weather[0].icon
            };
            
            console.log('Dados meteorológicos obtidos:', weatherData);
        } else {
            throw new Error('Falha ao obter dados meteorológicos');
        }
        
        updateWeatherDisplay();
        
    } catch (error) {
        console.error('Erro ao buscar dados meteorológicos:', error);
        weatherData = generateMockWeatherData();
        updateWeatherDisplay();
    }
}

// Gerar dados meteorológicos simulados
function generateMockWeatherData() {
    const hora = new Date().getHours();
    
    return {
        temperature: 25 + Math.round(Math.random() * 10),
        windSpeed: 5 + Math.round(Math.random() * 15),
        windDirection: Math.round(Math.random() * 360),
        humidity: 60 + Math.round(Math.random() * 30),
        pressure: 1010 + Math.round(Math.random() * 20),
        airQuality: Math.ceil(Math.random() * 5),
        uvIndex: hora >= 6 && hora <= 18 ? Math.ceil(Math.random() * 10) : 0,
        description: 'Parcialmente nublado',
        icon: '02d'
    };
}

// Atualizar exibição meteorológica
function updateWeatherDisplay() {
    try {
        const tempElement = document.getElementById('temperatura-value');
        const windElement = document.getElementById('vento-value');
        const airElement = document.getElementById('qualidade-ar-value');
        const uvElement = document.getElementById('uv-value');
        
        if (tempElement) tempElement.textContent = `${weatherData.temperature}°C`;
        if (windElement) windElement.textContent = `${weatherData.windSpeed} km/h`;
        if (uvElement) uvElement.textContent = weatherData.uvIndex.toFixed(1);
        
        if (airElement) {
            const qualityLabels = ['', 'Boa', 'Moderada', 'Ruim', 'Muito Ruim', 'Perigosa'];
            airElement.textContent = qualityLabels[weatherData.airQuality] || 'N/A';
        }
        
    } catch (error) {
        console.error('Erro ao atualizar dados meteorológicos:', error);
    }
}

// Gerar dados de pessoas
function generatePessoasData() {
    const hora = new Date().getHours();
    const baseIntensity = getIntensityByHour(hora);
    
    const data = [
        { lat: -7.119722, lng: -34.871667, intensity: baseIntensity * 0.9 },
        { lat: -7.119800, lng: -34.871600, intensity: baseIntensity * 0.7 },
        { lat: -7.119790, lng: -34.871610, intensity: baseIntensity * 0.6 },
        { lat: -7.119650, lng: -34.871700, intensity: baseIntensity * 0.8 },
        { lat: -7.119660, lng: -34.871690, intensity: baseIntensity * 0.5 },
        { lat: -7.119700, lng: -34.871650, intensity: baseIntensity * 0.6 },
        { lat: -7.119744, lng: -34.871684, intensity: baseIntensity * 0.5 },
        { lat: -7.119700, lng: -34.871684, intensity: baseIntensity * 0.6 },
        { lat: -7.119744, lng: -34.871650, intensity: baseIntensity * 0.5 },
        { lat: -7.119600, lng: -34.871667, intensity: baseIntensity * 0.7 },
        { lat: -7.119844, lng: -34.871667, intensity: baseIntensity * 0.7 },
        { lat: -7.119722, lng: -34.871600, intensity: baseIntensity * 0.6 },
        { lat: -7.119722, lng: -34.871734, intensity: baseIntensity * 0.6 },
        { lat: -7.119680, lng: -34.871620, intensity: baseIntensity * 0.4 },
        { lat: -7.119764, lng: -34.871714, intensity: baseIntensity * 0.4 },
        { lat: -7.119680, lng: -34.871714, intensity: baseIntensity * 0.4 },
        { lat: -7.119764, lng: -34.871620, intensity: baseIntensity * 0.4 }
    ];
    
    // Adicionar pontos aleatórios
    for (let i = 0; i < 10; i++) {
        data.push(generateRandomPoint(baseIntensity * 0.3));
    }
    
    return data;
}

// Gerar dados de veículos (apenas nas vias e entorno)
function generateVeiculosData() {
    const hora = new Date().getHours();
    const baseIntensity = getTrafficIntensityByHour(hora);
    
    // Coordenadas das vias e entorno da praça (não dentro da área verde)
    const viasEntorno = [
        // Avenida Epitácio Pessoa (norte da praça)
        { lat: -7.119400, lng: -34.871600, intensity: baseIntensity * 0.9 },
        { lat: -7.119420, lng: -34.871650, intensity: baseIntensity * 0.8 },
        { lat: -7.119380, lng: -34.871700, intensity: baseIntensity * 0.7 },
        { lat: -7.119450, lng: -34.871550, intensity: baseIntensity * 0.6 },
        
        // Rua da Independência (sul da praça)
        { lat: -7.120000, lng: -34.871600, intensity: baseIntensity * 0.8 },
        { lat: -7.120020, lng: -34.871650, intensity: baseIntensity * 0.7 },
        { lat: -7.119980, lng: -34.871700, intensity: baseIntensity * 0.6 },
        { lat: -7.120040, lng: -34.871550, intensity: baseIntensity * 0.5 },
        
        // Rua lateral oeste
        { lat: -7.119600, lng: -34.871400, intensity: baseIntensity * 0.6 },
        { lat: -7.119700, lng: -34.871420, intensity: baseIntensity * 0.5 },
        { lat: -7.119800, lng: -34.871440, intensity: baseIntensity * 0.4 },
        
        // Rua lateral leste
        { lat: -7.119600, lng: -34.871900, intensity: baseIntensity * 0.6 },
        { lat: -7.119700, lng: -34.871920, intensity: baseIntensity * 0.5 },
        { lat: -7.119800, lng: -34.871940, intensity: baseIntensity * 0.4 },
        
        // Cruzamentos e esquinas
        { lat: -7.119400, lng: -34.871400, intensity: baseIntensity * 0.7 },
        { lat: -7.119400, lng: -34.871900, intensity: baseIntensity * 0.7 },
        { lat: -7.120000, lng: -34.871400, intensity: baseIntensity * 0.6 },
        { lat: -7.120000, lng: -34.871900, intensity: baseIntensity * 0.6 }
    ];
    
    return viasEntorno;
}

// Calcular intensidade por hora
function getIntensityByHour(hora) {
    if ((hora >= 7 && hora <= 9) || (hora >= 12 && hora <= 14) || (hora >= 17 && hora <= 19)) {
        return 0.8 + Math.random() * 0.2;
    } else if ((hora >= 10 && hora <= 11) || (hora >= 15 && hora <= 16) || (hora >= 20 && hora <= 21)) {
        return 0.5 + Math.random() * 0.3;
    } else {
        return 0.1 + Math.random() * 0.4;
    }
}

// Calcular intensidade de tráfego
function getTrafficIntensityByHour(hora) {
    if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 19)) {
        return 0.9 + Math.random() * 0.1;
    } else if (hora >= 10 && hora <= 16) {
        return 0.6 + Math.random() * 0.3;
    } else {
        return 0.2 + Math.random() * 0.3;
    }
}

// Gerar ponto aleatório
function generateRandomPoint(intensity) {
    const centerLat = PRACA_CONFIG.center[0];
    const centerLng = PRACA_CONFIG.center[1];
    const radius = 0.0005;
    
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;
    
    const lat = centerLat + (distance * Math.cos(angle));
    const lng = centerLng + (distance * Math.sin(angle));
    
    return {
        lat,
        lng,
        intensity: intensity * (0.5 + Math.random() * 0.5)
    };
}

// Gerar KPIs
function generateKPIs() {
    const hora = new Date().getHours();
    const baseVisitors = getBaseVisitorsByHour(hora);
    
    return {
        totalPessoas: Math.floor(baseVisitors + (Math.random() * 50 - 25)),
        duracaoMedia: Math.floor(15 + Math.random() * 25),
        ultimaAtualizacao: new Date(),
        statusSistema: 'online',
        pessoasUltimaHora: Math.floor(baseVisitors * 1.2 + (Math.random() * 30 - 15)),
        veiculosUltimaHora: Math.floor(baseVisitors * 0.3 + (Math.random() * 10 - 5))
    };
}

// Calcular visitantes base por hora
function getBaseVisitorsByHour(hora) {
    if ((hora >= 7 && hora <= 9) || (hora >= 17 && hora <= 19)) {
        return 150 + Math.random() * 50;
    } else if ((hora >= 10 && hora <= 16) || (hora >= 20 && hora <= 22)) {
        return 80 + Math.random() * 40;
    } else {
        return 20 + Math.random() * 30;
    }
}

// Atualizar dados
function updateData() {
    try {
        console.log('Atualizando dados...');
        
        // Usar função específica se horário estiver selecionado
        if (horarioSelecionado && horarioSelecionado !== 'atual') {
            pessoasData = generatePessoasDataByHorario(horarioSelecionado);
        } else {
            pessoasData = generatePessoasData();
        }
        
        veiculosData = generateVeiculosData();
        const kpis = generateKPIs();
        
        // Atualizar KPIs
        const elements = {
            'total-pessoas': kpis.totalPessoas,
            'duracao-media': kpis.duracaoMedia + 'min',
            'pessoas-hora': kpis.pessoasUltimaHora,
            'veiculos-hora': kpis.veiculosUltimaHora,
            'pessoas-count': pessoasData.length,
            'veiculos-count': veiculosData.length
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        // Atualizar última atualização
        const now = new Date();
        const lastUpdateEl = document.getElementById('last-update');
        const lastDateEl = document.getElementById('last-date');
        
        if (lastUpdateEl) lastUpdateEl.textContent = now.toLocaleTimeString('pt-BR');
        if (lastDateEl) lastDateEl.textContent = now.toLocaleDateString('pt-BR');
        
        // Atualizar heatmap
        updateHeatmapDisplay();
        
    } catch (error) {
        console.error('Erro ao atualizar dados:', error);
    }
}

// Atualizar exibição do heatmap
function updateHeatmapDisplay() {
    if (!map) {
        console.log('Mapa não inicializado ainda');
        return;
    }
    
    try {
        console.log('Atualizando heatmap...');
        
        // Limpar marcadores existentes
        clearHeatmapMarkers();
        
        // Adicionar marcadores de pessoas
        if (showPessoas && pessoasData.length > 0) {
            console.log('Adicionando marcadores de pessoas:', pessoasData.length);
            pessoasData.forEach((point) => {
                const size = 8 + point.intensity * 15;
                const opacity = 0.3 + point.intensity * 0.5;
                
                const marker = L.circleMarker([point.lat, point.lng], {
                    radius: size,
                    fillColor: '#3b82f6',
                    color: '#1d4ed8',
                    weight: 2,
                    opacity: 0.8,
                    fillOpacity: opacity
                }).addTo(map);
                
                marker.bindPopup(`
                    <div style="text-align: center; padding: 0.5rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #3b82f6; font-size: 14px;">Fluxo de Pessoas</h4>
                        <p style="margin: 0; font-size: 12px;">Intensidade: ${(point.intensity * 100).toFixed(0)}%</p>
                    </div>
                `);
                
                pessoasMarkers.push(marker);
            });
        }
        
        // Adicionar marcadores de veículos
        if (showVeiculos && veiculosData.length > 0) {
            console.log('Adicionando marcadores de veículos:', veiculosData.length);
            veiculosData.forEach((point) => {
                const size = 6 + point.intensity * 12;
                const opacity = 0.3 + point.intensity * 0.4;
                
                const marker = L.circleMarker([point.lat, point.lng], {
                    radius: size,
                    fillColor: '#8b5cf6',
                    color: '#7c3aed',
                    weight: 2,
                    opacity: 0.7,
                    fillOpacity: opacity
                }).addTo(map);
                
                marker.bindPopup(`
                    <div style="text-align: center; padding: 0.5rem;">
                        <h4 style="margin: 0 0 0.5rem 0; color: #8b5cf6; font-size: 14px;">Fluxo de Veículos</h4>
                        <p style="margin: 0; font-size: 12px;">Intensidade: ${(point.intensity * 100).toFixed(0)}%</p>
                    </div>
                `);
                
                veiculosMarkers.push(marker);
            });
        }
        
        console.log('Heatmap atualizado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao atualizar heatmap:', error);
    }
}

// Limpar marcadores do heatmap
function clearHeatmapMarkers() {
    try {
        pessoasMarkers.forEach(marker => {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        });
        veiculosMarkers.forEach(marker => {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        });
        pessoasMarkers = [];
        veiculosMarkers = [];
    } catch (error) {
        console.error('Erro ao limpar marcadores:', error);
    }
}

// Atualizar data e hora
function updateDateTime() {
    try {
        const now = new Date();
        const dateString = now.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Atualizar data no header se existir
        const currentDateEl = document.getElementById('current-date');
        if (currentDateEl) {
            currentDateEl.textContent = dateString;
        }
    } catch (error) {
        console.error('Erro ao atualizar data/hora:', error);
    }
}

// Variável global para o horário selecionado
let horarioSelecionado = 'atual';

// Gerar dados de pessoas baseado no horário selecionado
function generatePessoasDataByHorario(horario) {
    let horaSimulada;
    
    switch (horario) {
        case 'pico-manha':
            horaSimulada = 8; // 8h da manhã
            break;
        case 'pico-almoco':
            horaSimulada = 13; // 13h
            break;
        case 'pico-tarde':
            horaSimulada = 18; // 18h
            break;
        case 'madrugada':
            horaSimulada = 3; // 3h da madrugada
            break;
        case 'noite':
            horaSimulada = 22; // 22h
            break;
        default:
            horaSimulada = new Date().getHours(); // Horário atual
    }
    
    const baseIntensity = getIntensityByHour(horaSimulada);
    const data = [];
    
    // Pontos fixos com intensidade baseada no horário
    const pontosPrincipais = [
        { lat: -7.119700, lng: -34.871650, base: 0.9 }, // Centro da praça
        { lat: -7.119650, lng: -34.871600, base: 0.8 }, // Próximo ao coreto
        { lat: -7.119750, lng: -34.871700, base: 0.7 }, // Área de descanso
        { lat: -7.119600, lng: -34.871650, base: 0.6 }, // Entrada norte
        { lat: -7.119800, lng: -34.871650, base: 0.6 }, // Entrada sul
        { lat: -7.119700, lng: -34.871550, base: 0.5 }, // Entrada oeste
        { lat: -7.119700, lng: -34.871750, base: 0.5 }, // Entrada leste
    ];
    
    // Adicionar pontos principais
    pontosPrincipais.forEach(ponto => {
        data.push({
            lat: ponto.lat,
            lng: ponto.lng,
            intensity: baseIntensity * ponto.base
        });
    });
    
    // Adicionar pontos aleatórios baseados na intensidade do horário
    const numPontosAleatorios = horario.includes('pico') ? 20 : (horario === 'madrugada' ? 5 : 12);
    
    for (let i = 0; i < numPontosAleatorios; i++) {
        data.push(generateRandomPoint(baseIntensity * 0.4));
    }
    
    return data;
}

// Atualizar descrição do horário
function updateHorarioDescription(horario) {
    const descriptions = {
        'atual': 'Dados baseados no horário atual',
        'pico-manha': 'Alta concentração - Horário de pico matinal (7h-9h)',
        'pico-almoco': 'Concentração moderada - Horário de almoço (12h-14h)',
        'pico-tarde': 'Alta concentração - Horário de pico vespertino (17h-19h)',
        'madrugada': 'Baixa concentração - Período de madrugada (0h-6h)',
        'noite': 'Concentração baixa/moderada - Período noturno (20h-23h)'
    };
    
    const descriptionEl = document.getElementById('horario-description');
    if (descriptionEl) {
        descriptionEl.textContent = descriptions[horario] || descriptions['atual'];
    }
}

// Configurar filtro de horários
function setupHorarioFilter() {
    const horarioFilter = document.getElementById('horario-filter');
    if (horarioFilter) {
        horarioFilter.addEventListener('change', function() {
            horarioSelecionado = this.value;
            console.log('Horário selecionado:', horarioSelecionado);
            
            // Atualizar descrição
            updateHorarioDescription(horarioSelecionado);
            
            // Regenerar dados de pessoas baseado no horário
            pessoasData = generatePessoasDataByHorario(horarioSelecionado);
            
            // Atualizar heatmap
            updateHeatmapDisplay();
            
            // Atualizar contadores
            updatePointCounts();
        });
        
        // Configurar descrição inicial
        updateHorarioDescription('atual');
    }
}

// Redimensionar mapa quando a janela muda
window.addEventListener('resize', function() {
    if (map) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
    }
});

// Detectar problemas de conectividade
window.addEventListener('online', function() {
    console.log('Conexão restaurada');
    if (!map) {
        location.reload();
    }
});

window.addEventListener('offline', function() {
    console.log('Conexão perdida');
    showError('Conexão com a internet perdida. Algumas funcionalidades podem não funcionar.');
});

