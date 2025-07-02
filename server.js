// 🎯 TPS Travel API - Clean Version v1.3.0
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
      connectSrc: ["'self'", "https://api.amadeus.com", "https://openrouter.ai"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    ['https://canalvivo.org', 'https://app.canalvivo.org'] : 
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

// GPT Service - CLEAN VERSION
async function callOpenRouterGPT(message, language = 'en') {
  try {
    console.log('🤖 Calling OpenRouter GPT with message:', message.substring(0, 100) + '...');

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
    throw error;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TPS Travel API - Clean Version',
    version: '1.3.0',
    status: 'NO AUTO RESPONSES - ONLY REAL GPT',
    endpoints: {
      gpt: '/gpt-tps',
      status: '/api/status',
      test: '/test'
    }
  });
});

// GPT Endpoint - CLEAN VERSION
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

    res.status(500).json({
      error: 'Sorry, I cannot respond right now. Please try again.',
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

// Test endpoint
app.get('/test', (req, res) => {
  console.log('🔥 TEST ROUTE CALLED!');
  res.json({ 
    message: 'TPS API Working!', 
    timestamp: new Date().toISOString(),
    version: '1.3.0',
    services: {
      email: !!(process.env.GMAIL_USER && process.env.GMAIL_PASS),
      amadeus: !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET),
      gpt: !!OPENROUTER_API_KEY
    },
    endpoints: {
      gpt: '/gpt-tps ✅ CLEAN VERSION!',
      status: '/api/status'
    },
    note: 'NO AUTO RESPONSES - ONLY REAL GPT!'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.3.0'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  console.log(`⚠️ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: ['/', '/health', '/test', '/gpt-tps', '/api/status']
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log('🚀 ====================================');
  console.log(`✅ TPS Server v1.3.0 running on http://0.0.0.0:${PORT}`);
  console.log('🤖 GPT Integration: ACTIVE - NO AUTO RESPONSES');
  console.log('🚀 ====================================');
  
  await testEmailConfiguration();
});

export default app;
