// 🎯 TPS Travel API - Amadeus + Multi-Platform Hybrid v2.1.0
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import compression from 'compression';
import Amadeus from 'amadeus';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const cache = new NodeCache({ stdTTL: 600 });

// ==================== AMADEUS CONFIGURATION ====================
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY,
  clientSecret: process.env.AMADEUS_API_SECRET,
  hostname: 'test' // Use 'production' when ready
});

// ==================== CORS CONFIGURATION ====================
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-api-key');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    console.log('🔧 Preflight request recebido para:', req.url);
    return res.status(200).end();
  }
  
  next();
});

app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'X-Requested-With', 'Accept', 'Origin']
}));

// ==================== MIDDLEWARE ====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.amadeus.com", "https://test.api.amadeus.com", "https://api.groq.com", "https://canalvivo.org"]
    }
  }
}));

app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: 'Too many requests. Try again in 15 minutes.',
    retryAfter: '15 minutes'
  }
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== MULTI-PLATFORM CLASS ====================
class FlightSearchPlatforms {
  constructor() {
    this.platforms = {
      wayaway: {
        name: 'WayAway',
        baseUrl: 'https://wayaway.io',
        marker: '639764.Zz8dd2565f9d1a46fc8c6e658-639764',
        description: 'Compara preços de múltiplas companhias aéreas',
        commission: '4-7%',
        priority: 1
      },
      skyscanner: {
        name: 'Skyscanner',
        baseUrl: 'https://www.skyscanner.com.br',
        description: 'Maior comparador de voos do mundo',
        commission: 'Parceria',
        priority: 2
      },
      kayak: {
        name: 'Kayak',
        baseUrl: 'https://www.kayak.com.br',
        description: 'Busca inteligente de voos baratos',
        commission: 'Affiliate',
        priority: 3
      },
      momondo: {
        name: 'Momondo',
        baseUrl: 'https://www.momondo.com.br',
        description: 'Encontra voos únicos e baratos',
        commission: 'Parceria',
        priority: 4
      },
      google_flights: {
        name: 'Google Flights',
        baseUrl: 'https://www.google.com/travel/flights',
        description: 'Busca do Google com preços em tempo real',
        commission: 'Grátis',
        priority: 5
      }
    };
  }

  generateWayAwayUrl(origin, destination, date, passengers = 1) {
    const params = new URLSearchParams({
      marker: this.platforms.wayaway.marker,
      trace_id: `Zz8dd2565f9d1a46fc8c6e658-639764`,
      params: `${origin}1${destination}${date.replace(/-/g, '')}${passengers}`
    });
    
    return `${this.platforms.wayaway.baseUrl}/?${params.toString()}`;
  }

  generatePlatformUrls(origin, destination, date, passengers = 1) {
    const urls = {};
    
    urls.wayaway = this.generateWayAwayUrl(origin, destination, date, passengers);
    urls.skyscanner = `${this.platforms.skyscanner.baseUrl}/transport/flights/${origin}/${destination}/${date}/?adults=${passengers}`;
    urls.kayak = `${this.platforms.kayak.baseUrl}/flights/${origin}-${destination}/${date}?sort=bestflight_a`;
    urls.momondo = `${this.platforms.momondo.baseUrl}/flight-search/${origin}-${destination}/${date}?sort=bestflight_a`;
    urls.google_flights = `${this.platforms.google_flights.baseUrl}?f=0&gl=BR&hl=pt&curr=BRL`;
    
    return urls;
  }
}

// ==================== GPT SERVICE ====================
async function callGroqGPT(message, language = 'pt') {
  try {
    console.log('🤖 Calling Groq GPT with message:', message.substring(0, 100) + '...');

    const systemPrompt = {
      'pt': 'Você é um assistente de viagens especializado. Responda de forma direta, útil e amigável sobre viagens, voos, destinos e turismo.',
      'en': 'You are a specialized travel assistant. Answer directly, helpfully and friendly about travel, flights, destinations and tourism.'
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt[language] || systemPrompt['pt'] },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API Error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação.';

  } catch (error) {
    console.error('❌ Error calling Groq GPT:', error);
    return 'Desculpe, estou enfrentando dificuldades técnicas. Tente novamente em alguns instantes.';
  }
}

// ==================== MAIN FLIGHT SEARCH ENDPOINT ====================
app.post('/search-flights', async (req, res) => {
  try {
    const { origin, destination, date, passengers = 1 } = req.body;
    
    console.log('🔍 Buscando voos - Amadeus + Fallback:', { origin, destination, date, passengers });
    
    if (!origin || !destination || !date) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros obrigatórios: origin, destination, date'
      });
    }

    let amadeusFlights = [];
    let amadeusError = null;
    
    // ========== TENTAR AMADEUS PRIMEIRO ==========
    try {
      console.log('🛫 Tentando busca via Amadeus...');
      
      const amadeusResponse = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: origin.toUpperCase(),
        destinationLocationCode: destination.toUpperCase(),
        departureDate: date,
        adults: parseInt(passengers),
        max: 5
      });

      if (amadeusResponse.data && amadeusResponse.data.length > 0) {
        amadeusFlights = amadeusResponse.data.map(flight => {
          const segment = flight.itineraries[0].segments[0];
          const lastSegment = flight.itineraries[0].segments[flight.itineraries[0].segments.length - 1];
          
          return {
            id: flight.id,
            airline: segment.carrierCode,
            flight_number: `${segment.carrierCode}${segment.number}`,
            departure: {
              airport: segment.departure.iataCode,
              time: segment.departure.at,
              terminal: segment.departure.terminal
            },
            arrival: {
              airport: lastSegment.arrival.iataCode,
              time: lastSegment.arrival.at,
              terminal: lastSegment.arrival.terminal
            },
            price: {
              total: parseFloat(flight.price.total),
              currency: flight.price.currency
            },
            duration: flight.itineraries[0].duration,
            stops: flight.itineraries[0].segments.length - 1,
            cabin: flight.travelerPricings[0].fareDetailsBySegment[0].cabin || 'ECONOMY',
            source: 'amadeus_real'
          };
        });
        
        console.log(`✅ Amadeus: ${amadeusFlights.length} voos encontrados`);
      } else {
        console.log('⚠️ Amadeus: Nenhum voo encontrado');
      }
      
    } catch (error) {
      amadeusError = error.message;
      console.log('❌ Amadeus falhou:', error.message);
    }

    // ========== GERAR MULTI-PLATFORM LINKS ==========
    const platforms = new FlightSearchPlatforms();
    const urls = platforms.generatePlatformUrls(origin, destination, date, passengers);

    // ========== RESPOSTA HÍBRIDA ==========
    const response = {
      success: true,
      data_source: amadeusFlights.length > 0 ? 'amadeus_real' : 'platform_redirect',
      search: {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date: date,
        passengers: parseInt(passengers)
      },
      // Se Amadeus funcionou, mostrar voos reais
      flights: amadeusFlights.length > 0 ? amadeusFlights : [],
      // Sempre mostrar links para plataformas (para comparação)
      search_platforms: Object.entries(platforms.platforms).map(([key, platform]) => ({
        id: key,
        name: platform.name,
        url: urls[key],
        description: platform.description,
        priority: platform.priority
      })),
      // Status da busca
      amadeus_status: {
        attempted: true,
        success: amadeusFlights.length > 0,
        error: amadeusError,
        flights_found: amadeusFlights.length
      }
    };

    res.json(response);

  } catch (error) {
    console.error('❌ Erro geral na busca:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// ==================== AMADEUS TEST ENDPOINT ====================
app.get('/test-amadeus', async (req, res) => {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'GRU',
      destinationLocationCode: 'CDG',
      departureDate: '2025-08-15',
      adults: 1,
      max: 2
    });

    res.json({
      success: true,
      message: 'Amadeus funcionando!',
      flights: response.data?.length || 0,
      sample: response.data?.[0] || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== OTHER ENDPOINTS ====================

// Homepage
app.get('/', (req, res) => {
  res.json({
    message: '🎯 TPS Travel API - Amadeus + Multi-Platform Hybrid',
    version: '2.1.0',
    status: 'Amadeus API + Fallback para múltiplas plataformas',
    features: ['Real flight data', 'Multi-platform search', 'Intelligent fallback'],
    endpoints: {
      search: '/search-flights',
      test: '/test-amadeus',
      gpt: '/gpt-tps',
      status: '/status'
    }
  });
});

// GPT Endpoint
app.post('/gpt-tps', async (req, res) => {
  try {
    const { message, language = 'pt' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Mensagem é obrigatória'
      });
    }

    const response = await callGroqGPT(message, language);

    res.json({
      content: response,
      timestamp: new Date().toISOString(),
      language: language,
      model: 'llama-3.1-8b-instant'
    });

  } catch (error) {
    console.error('❌ Error in GPT endpoint:', error);
    res.status(500).json({
      error: 'Falha no serviço GPT',
      details: error.message
    });
  }
});

// Status endpoint
app.get('/status', async (req, res) => {
  let amadeusStatus = 'unknown';
  
  try {
    // Test Amadeus connection
    await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: 'GRU',
      destinationLocationCode: 'GIG',
      departureDate: '2025-08-15',
      adults: 1,
      max: 1
    });
    amadeusStatus = 'online';
  } catch (error) {
    amadeusStatus = 'offline';
  }
  
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '2.1.0',
    services: {
      amadeus: amadeusStatus,
      gpt: process.env.GROQ_API_KEY ? 'configured' : 'not configured',
      platforms: Object.keys(new FlightSearchPlatforms().platforms).length
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '2.1.0'
  });
});

// ==================== ERROR HANDLERS & LOGGING ====================

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Error handlers
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    available_endpoints: ['/', '/search-flights', '/test-amadeus', '/gpt-tps', '/status', '/health']
  });
});

// ==================== SERVER INITIALIZATION ====================
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ====================================');
  console.log(`✅ TPS Server v2.1.0 running on http://0.0.0.0:${PORT}`);
  console.log('📋 Hybrid Configuration:');
  console.log(`   🛫 Primary: Amadeus API (real data)`);
  console.log(`   🔄 Fallback: Multi-platform links`);
  console.log(`   🤖 GPT: Groq integration`);
  console.log('📋 Available endpoints:');
  console.log(`   GET  / - Homepage`);
  console.log(`   POST /search-flights - Hybrid flight search`);
  console.log(`   GET  /test-amadeus - Test Amadeus API`);
  console.log(`   POST /gpt-tps - GPT Chat`);
  console.log(`   GET  /status - API status`);
  console.log(`   GET  /health - Health check`);
  console.log('🚀 ====================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down server...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down server...');
  server.close(() => process.exit(0));
});

export default app;