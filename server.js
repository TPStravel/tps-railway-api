// 🎯 TPS Travel API - Amadeus Integration v1.0.0
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ==================== CONFIGURAÇÃO ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Cache - 10 minutos para dados da Amadeus
const cache = new NodeCache({ stdTTL: 600 });

// ==================== MIDDLEWARE ====================

// Segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.amadeus.com"]
    }
  }
}));

// Compressão
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://seu-dominio.com'] : 
    ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máx 100 requests por IP
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
    retryAfter: '15 minutos'
  }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(join(__dirname, 'public')));

// Middleware de log
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// ==================== AMADEUS API CLASS ====================

class AmadeusAPI {
  constructor() {
    this.clientId = process.env.AMADEUS_API_KEY || 'YOUR_CLIENT_ID';
    this.clientSecret = process.env.AMADEUS_API_SECRET || 'YOUR_CLIENT_SECRET';
    this.baseURL = process.env.AMADEUS_ENV === 'production' ? 
      'https://api.amadeus.com' : 
      'https://test.api.amadeus.com';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Obter token de acesso
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/security/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`
      });

      if (!response.ok) {
        throw new Error(`Erro de autenticação: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000; // 5 min antes
      
      return this.accessToken;
    } catch (error) {
      console.error('❌ Erro ao obter token Amadeus:', error);
      throw error;
    }
  }

  // Fazer requisição autenticada
  async makeRequest(endpoint, params = {}) {
    const token = await this.getAccessToken();
    const queryString = new URLSearchParams(params).toString();
    const url = `${this.baseURL}${endpoint}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Amadeus API Error: ${response.status} - ${errorData.error_description || 'Erro desconhecido'}`);
    }

    return response.json();
  }

  // Buscar ofertas de voos
  async searchFlights(params) {
    const cacheKey = `flights_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/v2/shopping/flight-offers', params);
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar voos:', error);
      throw error;
    }
  }

  // Buscar hotéis
  async searchHotels(params) {
    const cacheKey = `hotels_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/v1/reference-data/locations/hotels/by-city', params);
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar hotéis:', error);
      throw error;
    }
  }

  // Buscar aeroportos
  async searchAirports(params) {
    const cacheKey = `airports_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/v1/reference-data/locations', params);
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar aeroportos:', error);
      throw error;
    }
  }
}

const amadeus = new AmadeusAPI();

// ==================== ROTAS ====================

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TPS Travel API - Amadeus Integration',
    version: '1.0.0',
    status: 'Backend do TPS ativo.',
    documentation: '/api/status',
    endpoints: {
      status: '/api/status',
      flights: '/api/flights/search?originLocationCode=GRU&destinationLocationCode=CDG&departureDate=2025-07-15&adults=1',
      hotels: '/api/hotels/search?cityCode=PAR',
      airports: '/api/airports/search?keyword=São Paulo'
    }
  });
});

// Status da API
app.get('/api/status', async (req, res) => {
  try {
    console.log('🔍 Verificando status da API...');
    
    // Testar conectividade com Amadeus
    const token = await amadeus.getAccessToken();
    const isAmadeusOnline = !!token;

    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        amadeus: isAmadeusOnline ? 'online' : 'offline',
        cache: cache.getStats(),
        environment: process.env.NODE_ENV || 'development'
      },
      endpoints: {
        flights: '/api/flights/search',
        hotels: '/api/hotels/search',
        airports: '/api/airports/search'
      }
    });
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao verificar status dos serviços',
      error: error.message
    });
  }
});

// Buscar voos
app.get('/api/flights/search', async (req, res) => {
  try {
    const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, travelClass } = req.query;

    // Validação básica
    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: originLocationCode, destinationLocationCode, departureDate, adults'
      });
    }

    const searchParams = {
      originLocationCode,
      destinationLocationCode,
      departureDate,
      adults: parseInt(adults),
      ...(returnDate && { returnDate }),
      ...(travelClass && { travelClass }),
      max: 10 // Limitar resultados
    };

    console.log('🛫 Buscando voos:', searchParams);
    const flights = await amadeus.searchFlights(searchParams);
    
    res.json({
      success: true,
      count: flights.data?.length || 0,
      flights: flights.data || [],
      meta: flights.meta || {}
    });

  } catch (error) {
    console.error('❌ Erro na busca de voos:', error);
    res.status(500).json({
      error: 'Erro ao buscar voos',
      message: error.message
    });
  }
});

// Buscar hotéis
app.get('/api/hotels/search', async (req, res) => {
  try {
    const { cityCode, checkInDate, checkOutDate, adults, radius } = req.query;

    if (!cityCode) {
      return res.status(400).json({
        error: 'Parâmetro obrigatório: cityCode (ex: PAR para Paris)'
      });
    }

    const searchParams = {
      cityCode,
      ...(radius && { radius: parseInt(radius) })
    };

    console.log('🏨 Buscando hotéis:', searchParams);
    const hotels = await amadeus.searchHotels(searchParams);
    
    res.json({
      success: true,
      count: hotels.data?.length || 0,
      hotels: hotels.data || [],
      meta: hotels.meta || {}
    });

  } catch (error) {
    console.error('❌ Erro na busca de hotéis:', error);
    res.status(500).json({
      error: 'Erro ao buscar hotéis',
      message: error.message
    });
  }
});

// Buscar aeroportos
app.get('/api/airports/search', async (req, res) => {
  try {
    const { keyword, subType } = req.query;

    if (!keyword) {
      return res.status(400).json({
        error: 'Parâmetro obrigatório: keyword (ex: Paris, PAR, CDG)'
      });
    }

    const searchParams = {
      keyword,
      subType: subType || 'AIRPORT,CITY',
      'page[limit]': 10,
      'page[offset]': 0
    };

    console.log('✈️ Buscando aeroportos:', searchParams);
    const airports = await amadeus.searchAirports(searchParams);
    
    res.json({
      success: true,
      count: airports.data?.length || 0,
      airports: airports.data || [],
      meta: airports.meta || {}
    });

  } catch (error) {
    console.error('❌ Erro na busca de aeroportos:', error);
    res.status(500).json({
      error: 'Erro ao buscar aeroportos',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Teste diagnóstico
app.get('/test', (req, res) => {
  console.log('🔥 ROTA TESTE CHAMADA!');
  res.json({ 
    message: 'Rota funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// ==================== ERROR HANDLERS ====================

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('❌ Erro não tratado:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// 404 Handler - SEMPRE POR ÚLTIMO!
app.use('*', (req, res) => {
  console.log(`⚠️ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Endpoint não encontrado',
    message: `${req.method} ${req.originalUrl} não existe`,
    availableEndpoints: [
      '/',
      '/health',
      '/test',
      '/api/status',
      '/api/flights/search',
      '/api/hotels/search',
      '/api/airports/search'
    ]
  });
});

// ==================== INICIALIZAÇÃO ====================

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ====================================');
  console.log(`✅ Servidor TPS rodando em http://0.0.0.0:${PORT}`);
  console.log('📋 Endpoints disponíveis:');
  console.log(`   GET  / - Página inicial`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /test - Teste diagnóstico`);
  console.log(`   GET  /api/status - Status da API`);
  console.log(`   GET  /api/flights/search - Buscar voos`);
  console.log(`   GET  /api/hotels/search - Buscar hotéis`);
  console.log(`   GET  /api/airports/search - Buscar aeroportos`);
  console.log('🚀 ====================================');
});

export default app;