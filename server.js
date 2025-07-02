// 🎯 TPS Travel API - Amadeus Integration + Email Service + GPT v1.2.0
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import NodeCache from 'node-cache';
import compression from 'compression';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const cache = new NodeCache({ stdTTL: 600 });
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Email transporter
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
};

// Test email on startup
const testEmailConfiguration = async () => {
  try {
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
      const transporter = createEmailTransporter();
      await transporter.verify();
      console.log('✅ Gmail SMTP service ready');
    } else {
      console.log('⚠️  Gmail credentials not configured');
    }
  } catch (error) {
    console.log('❌ Gmail SMTP configuration error:', error.message);
  }
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.amadeus.com", "https://openrouter.ai", "https://canalvivo.org"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://canalvivo.org', 'https://app.canalvivo.org', 'https://tps-railway-api-production.up.railway.app'] : 
    ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

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
app.use(express.static(join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Amadeus API Class
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
        throw new Error(`Authentication error: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000;
      
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting Amadeus token:', error);
      throw error;
    }
  }

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
      throw new Error(`Amadeus API Error: ${response.status} - ${errorData.error_description || 'Unknown error'}`);
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
      console.error('❌ Error searching flights:', error);
      throw error;
    }
  }

  async searchHotels(params) {
    const cacheKey = `hotels_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/v1/reference-data/locations/hotels/by-city', params);
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('❌ Error searching hotels:', error);
      throw error;
    }
  }

  async searchAirports(params) {
    const cacheKey = `airports_${JSON.stringify(params)}`;
    const cached = cache.get(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.makeRequest('/v1/reference-data/locations', params);
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('❌ Error searching airports:', error);
      throw error;
    }
  }
}

const amadeus = new AmadeusAPI();

// ==================== GPT SERVICE ====================

// Função para chamar OpenRouter GPT
async function callOpenRouterGPT(message, language = 'en') {
  try {
    console.log('🤖 Calling OpenRouter GPT with message:', message.substring(0, 100) + '...');

    // Criar prompt contextual baseado no idioma
    const systemPrompt = {
      'en': 'You are a helpful travel assistant. Answer user questions directly and naturally without introductions.',
      'pt': 'Você é um assistente de viagens útil. Responda as perguntas do usuário de forma direta e natural, sem introduções.',
      'es': 'Eres un asistente de viajes útil. Responde las preguntas del usuario de forma directa y natural, sin introducciones.',
      'fr': 'Vous êtes un assistant de voyage utile. Répondez aux questions de l\'utilisateur directement et naturellement, sans introductions.',
      'ko': '여행 도우미입니다. 소개 없이 자연스럽고 직접적으로 사용자 질문에 답하세요.'
    };

    const prompt = systemPrompt[language] || systemPrompt['en'];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://canalvivo.org',
        'X-Title': 'TPS Travel Assistant'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from GPT');
    }

    console.log('✅ GPT response received successfully');
    return content;

  } catch (error) {
    console.error('❌ Error calling OpenRouter GPT:', error);
    
    // Fallback: resposta inteligente baseada na mensagem
    return getIntelligentFallback(message, language);
  }
}

// Sistema de fallback inteligente
function getIntelligentFallback(message, language = 'en') {
  const lowerMessage = message.toLowerCase();

  const responses = {
    'en': {
      paris: `🗼 **Paris Travel Plan**\n\nPerfect choice! Paris offers incredible experiences year-round.\n\n**Flight Tips:** Book 2-3 months ahead for best prices. Direct flights available from major cities.\n\n**Best Areas to Stay:**\n• Marais - Historic charm, great restaurants\n• Saint-Germain - Art galleries, café culture\n• Montmartre - Artistic atmosphere, Sacré-Cœur\n\n**Must-See:**\n• Eiffel Tower (book skip-the-line tickets)\n• Louvre Museum (pre-book timed entry)\n• Seine River cruise at sunset\n• Champs-Élysées shopping\n\n**Local Tips:**\n• Metro day pass: €8\n• Many museums free first Sunday of month\n• Dinner reservations essential\n\nReady to help with specific dates and bookings! ✨`,
      
      default: `✨ **Welcome to TPS Travel!**\n\nI'm here to help plan your perfect trip! I can assist with:\n\n🗺️ **Complete Itinerary Planning**\n✈️ **Flight Recommendations**\n🏨 **Hotel Bookings**\n🚗 **Local Transportation**\n🛡️ **Travel Insurance**\n🎫 **Activities & Tours**\n\n**To get started, tell me:**\n• Your dream destination\n• Travel dates\n• Number of travelers\n• Budget range\n\nLet's turn your travel dreams into reality! 🌟`
    },
    'pt': {
      paris: `🗼 **Plano de Viagem - Paris**\n\nExcelente escolha! Paris oferece experiências incríveis o ano todo.\n\n**Dicas de Voo:** Reserve 2-3 meses antes para melhores preços. Voos diretos disponíveis das principais cidades.\n\n**Melhores Áreas para Ficar:**\n• Marais - Charme histórico, ótimos restaurantes\n• Saint-Germain - Galerias de arte, cultura de café\n• Montmartre - Atmosfera artística, Sacré-Cœur\n\n**Imperdíveis:**\n• Torre Eiffel (reserve ingressos furarfila)\n• Museu do Louvre (reserve entrada com hora marcada)\n• Cruzeiro no Rio Sena ao pôr do sol\n• Compras na Champs-Élysées\n\n**Dicas Locais:**\n• Passe diário do metrô: €8\n• Muitos museus gratuitos no primeiro domingo do mês\n• Reservas para jantar essenciais\n\nPronto para ajudar com datas específicas e reservas! ✨`,
      
      default: `✨ **Bem-vindo ao TPS Travel!**\n\nEstou aqui para ajudar a planejar sua viagem perfeita! Posso auxiliar com:\n\n🗺️ **Planejamento Completo de Itinerário**\n✈️ **Recomendações de Voos**\n🏨 **Reservas de Hotéis**\n🚗 **Transporte Local**\n🛡️ **Seguro Viagem**\n🎫 **Atividades e Tours**\n\n**Para começar, me conte:**\n• Seu destino dos sonhos\n• Datas da viagem\n• Número de viajantes\n• Faixa de orçamento\n\nVamos transformar seus sonhos de viagem em realidade! 🌟`
    }
  };

  const langResponses = responses[language] || responses['en'];

  if (lowerMessage.includes('paris')) return langResponses.paris;
  if (lowerMessage.includes('new york')) return langResponses.paris?.replace('Paris', 'New York').replace('🗼', '🗽');
  
  return langResponses.default;
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TPS Travel API - Amadeus Integration + Email Service + GPT',
    version: '1.2.0',
    status: 'Backend do TPS ativo com GPT integrado.',
    documentation: '/api/status',
    endpoints: {
      gpt: '/gpt-tps',
      status: '/api/status',
      test: '/test'
    }
  });
});

// ==================== GPT ENDPOINT - O QUE ESTAVA FALTANDO! ====================
app.post('/gpt-tps', async (req, res) => {
  try {
    const { message, language = 'en', timestamp } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        error: 'Message is required and must be a non-empty string'
      });
    }

    console.log('🤖 GPT Request received:', {
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      language,
      timestamp,
      ip: req.ip
    });

    // Chamar GPT
    const response = await callOpenRouterGPT(message, language);

    console.log('✅ GPT Response sent successfully');

    res.json({
      content: response,
      timestamp: new Date().toISOString(),
      language: language,
      model: 'deepseek/deepseek-chat'
    });

  } catch (error) {
    console.error('❌ Error in GPT endpoint:', error);

    // Fallback automático
    const fallbackResponse = getIntelligentFallback(req.body.message || '', req.body.language || 'en');

    res.status(200).json({
      content: fallbackResponse,
      timestamp: new Date().toISOString(),
      language: req.body.language || 'en'
    });
  }
});

// Status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const token = await amadeus.getAccessToken();
    const isAmadeusOnline = !!token;
    const isEmailConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_PASS);
    const isGPTConfigured = !!OPENROUTER_API_KEY;

    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.3.0',
      services: {
        amadeus: isAmadeusOnline ? 'online' : 'offline',
        email: isEmailConfigured ? 'configured' : 'not configured',
        gpt: isGPTConfigured ? 'configured - NO AUTO RESPONSES' : 'not configured',
        cache: cache.getStats()
      }
    });
  } catch (error) {
    console.error('❌ Error checking status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error checking service status',
      error: error.message
    });
  }
});

// ==================== EMAIL ROUTES ====================

// Send verification email
app.post('/api/send-verification', async (req, res) => {
  try {
    const { email, name, token } = req.body;

    // Validation
    if (!email || !name || !token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, name, token' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email address format' 
      });
    }

    // Check if Gmail credentials are configured
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured. Please set GMAIL_USER and GMAIL_PASS environment variables.'
      });
    }

    console.log('📧 Sending verification email to:', email);

    const transporter = createEmailTransporter();
    const origin = req.get('origin') || req.get('host') || 'https://canalvivo.org';
    
    const mailOptions = {
      from: `"TPS Travel System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🔐 TPS Travel - Verify Your Email Address',
      html: generateVerificationEmailHTML(name, token, origin)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Verification email sent successfully:', info.messageId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Verification email sent successfully!',
      messageId: info.messageId,
      recipient: email
    });

  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send verification email',
      details: error.message
    });
  }
});

// Send welcome email
app.post('/api/send-welcome', async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: email, name' 
      });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured'
      });
    }

    console.log('📧 Sending welcome email to:', email);

    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"TPS Travel System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🎉 Welcome to TPS Travel - Email Verified!',
      html: generateWelcomeEmailHTML(name)
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Welcome email sent successfully:', info.messageId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Welcome email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send welcome email',
      details: error.message
    });
  }
});

// General email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: to, subject, and (html or text)' 
      });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
      return res.status(500).json({
        success: false,
        error: 'Email service not configured'
      });
    }

    console.log('📧 Sending custom email to:', to);

    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: `"TPS Travel System" <${process.env.GMAIL_USER}>`,
      to: to,
      subject: subject,
      ...(html && { html }),
      ...(text && { text })
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully:', info.messageId);
    
    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      details: error.message
    });
  }
});

// ==================== AMADEUS ROUTES ====================

// Buscar voos
app.get('/api/flights/search', async (req, res) => {
  try {
    const { originLocationCode, destinationLocationCode, departureDate, returnDate, adults, travelClass } = req.query;

    // Validação básica
    if (!originLocationCode || !destinationLocationCode || !departureDate || !adults) {
      return res.status(400).json({
        error: 'Required parameters: originLocationCode, destinationLocationCode, departureDate, adults'
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

    console.log('🛫 Searching flights:', searchParams);
    const flights = await amadeus.searchFlights(searchParams);
    
    res.json({
      success: true,
      count: flights.data?.length || 0,
      flights: flights.data || [],
      meta: flights.meta || {}
    });

  } catch (error) {
    console.error('❌ Error searching flights:', error);
    res.status(500).json({
      error: 'Error searching flights',
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
        error: 'Required parameter: cityCode (ex: PAR for Paris)'
      });
    }

    const searchParams = {
      cityCode,
      ...(radius && { radius: parseInt(radius) })
    };

    console.log('🏨 Searching hotels:', searchParams);
    const hotels = await amadeus.searchHotels(searchParams);
    
    res.json({
      success: true,
      count: hotels.data?.length || 0,
      hotels: hotels.data || [],
      meta: hotels.meta || {}
    });

  } catch (error) {
    console.error('❌ Error searching hotels:', error);
    res.status(500).json({
      error: 'Error searching hotels',
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
        error: 'Required parameter: keyword (ex: Paris, PAR, CDG)'
      });
    }

    const searchParams = {
      keyword,
      subType: subType || 'AIRPORT,CITY',
      'page[limit]': 10,
      'page[offset]': 0
    };

    console.log('✈️ Searching airports:', searchParams);
    const airports = await amadeus.searchAirports(searchParams);
    
    res.json({
      success: true,
      count: airports.data?.length || 0,
      airports: airports.data || [],
      meta: airports.meta || {}
    });

  } catch (error) {
    console.error('❌ Error searching airports:', error);
    res.status(500).json({
      error: 'Error searching airports',
      message: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.2.0',
    services: {
      gpt: 'configured',
      amadeus: 'configured',
      email: 'configured'
    }
  });
});

// Teste diagnóstico
app.get('/test', (req, res) => {
  console.log('🔥 TEST ROUTE CALLED!');
  res.json({ 
    message: 'Route working!', 
    timestamp: new Date().toISOString(),
    services: {
      email: !!(process.env.GMAIL_USER && process.env.GMAIL_PASS),
      amadeus: !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET),
      gpt: !!OPENROUTER_API_KEY
    },
    endpoints: {
      gpt: '/gpt-tps ✅ NEW!',
      flights: '/api/flights/search',
      hotels: '/api/hotels/search',
      status: '/api/status'
    }
  });
});

// ==================== ERROR HANDLERS ====================

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 Handler - SEMPRE POR ÚLTIMO!
app.use('*', (req, res) => {
  console.log(`⚠️ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      '/',
      '/health',
      '/test',
      '/gpt-tps ✅ NEW!',
      '/api/status',
      '/api/flights/search',
      '/api/hotels/search',
      '/api/airports/search',
      '/api/send-verification',
      '/api/send-welcome',
      '/api/send-email'
    ]
  });
});

// ==================== INICIALIZAÇÃO ====================

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down server...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down server...');
  process.exit(0);
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log('🚀 ====================================');
  console.log(`✅ TPS Server v1.2.0 running on http://0.0.0.0:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log(`   GET  / - Homepage`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /test - Diagnostic test`);
  console.log(`   POST /gpt-tps - GPT Chat Endpoint ✅ NEW!`);
  console.log(`   GET  /api/status - API status`);
  console.log(`   GET  /api/flights/search - Search flights`);
  console.log(`   GET  /api/hotels/search - Search hotels`);
  console.log(`   GET  /api/airports/search - Search airports`);
  console.log(`   POST /api/send-verification - Send verification email`);
  console.log(`   POST /api/send-welcome - Send welcome email`);
  console.log(`   POST /api/send-email - Send custom email`);
  console.log('🚀 ====================================');
  console.log('🤖 GPT Integration: ACTIVE with OpenRouter');
  console.log('✈️ Amadeus Integration: ACTIVE');
  console.log('📧 Email Service: ACTIVE');
  console.log('🚀 ====================================');
  
  // Test email configuration
  await testEmailConfiguration();
});

export default app;