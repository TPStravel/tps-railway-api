// 🎯 TPS Travel API - Amadeus Integration + Email Service v1.1.0
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

import { readFileSync } from 'fs';

// ==================== CONFIGURAÇÃO ====================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Cache - 10 minutos para dados da Amadeus
const cache = new NodeCache({ stdTTL: 600 });

// ==================== EMAIL CONFIGURATION ====================

// Gmail transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
};

// Test email configuration on startup
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
    error: 'Too many requests. Try again in 15 minutes.',
    retryAfter: '15 minutes'
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
        throw new Error(`Authentication error: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 300000; // 5 min antes
      
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting Amadeus token:', error);
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
      console.error('❌ Error searching hotels:', error);
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
      console.error('❌ Error searching airports:', error);
      throw error;
    }
  }
}

const amadeus = new AmadeusAPI();

// ==================== EMAIL HELPER FUNCTIONS ====================

// Generate HTML email template
const generateVerificationEmailHTML = (name, token, origin) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .header-subtitle {
          font-size: 18px;
          opacity: 0.9;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 20px;
          color: #333;
          margin-bottom: 20px;
        }
        .message {
          color: #666;
          font-size: 16px;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .verification-box {
          background: #f8f9fa;
          border: 2px dashed #667eea;
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
        }
        .verification-title {
          color: #667eea;
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 15px;
        }
        .verification-code {
          font-size: 32px;
          font-weight: bold;
          color: #333;
          letter-spacing: 8px;
          background: white;
          padding: 15px 30px;
          border-radius: 8px;
          border: 1px solid #e1e5e9;
          display: inline-block;
          margin: 10px 0;
        }
        .verify-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          font-weight: 600;
          margin: 20px 0;
          transition: transform 0.2s;
        }
        .verify-button:hover {
          transform: translateY(-2px);
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e1e5e9;
        }
        .footer-text {
          color: #666;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .team-signature {
          color: #333;
          font-weight: 600;
          margin-top: 20px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 12px;
          }
          .content {
            padding: 30px 20px;
          }
          .verification-code {
            font-size: 24px;
            letter-spacing: 4px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TPS</div>
          <div class="header-subtitle">Travel Professional System</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${name}! 👋</div>
          
          <div class="message">
            Welcome to TPS Travel! We're excited to have you on board. To complete your registration and secure your account, please verify your email address.
          </div>
          
          <div class="verification-box">
            <div class="verification-title">🔐 Your Verification Code</div>
            <div class="verification-code">${token}</div>
            <div style="margin-top: 15px; color: #666; font-size: 14px;">
              Copy this code and paste it in the verification field
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="${origin}/verify-email.html?token=${token}" class="verify-button">
              ✨ Verify Email Address
            </a>
          </div>
          
          <div class="message" style="margin-top: 30px; font-size: 14px; color: #888;">
            If you didn't create this account, please ignore this email. This verification link will expire in 24 hours for security reasons.
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">
            Need help? Contact our support team anytime.
          </div>
          <div class="team-signature">
            Best regards,<br>
            <strong>TPS Travel Team</strong>
          </div>
          <div style="margin-top: 20px; font-size: 12px; color: #999;">
            This is an automated message. Please do not reply to this email.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Generate welcome email template
const generateWelcomeEmailHTML = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f6f8;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #4CAF50, #2E7D32);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .logo {
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .success-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .welcome-title {
          font-size: 28px;
          color: #333;
          margin-bottom: 20px;
          font-weight: bold;
        }
        .message {
          color: #666;
          font-size: 16px;
          margin-bottom: 30px;
          line-height: 1.6;
        }
        .cta-button {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 8px;
          display: inline-block;
          font-weight: 600;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e1e5e9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TPS</div>
          <div>Email Verified Successfully!</div>
        </div>
        
        <div class="content">
          <div class="success-icon">🎉</div>
          <div class="welcome-title">Welcome aboard, ${name}!</div>
          
          <div class="message">
            Your email has been verified successfully! You now have full access to TPS Travel Professional System. Start planning your next adventure and discover all the amazing features we have to offer.
          </div>
          
          <a href="#" class="cta-button">Start Exploring TPS</a>
        </div>
        
        <div class="footer">
          <div style="color: #333; font-weight: 600;">
            Best regards,<br>
            <strong>TPS Travel Team</strong>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ==================== ROTAS ====================

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🚀 TPS Travel API - Amadeus Integration + Email Service',
    version: '1.1.0',
    status: 'Backend do TPS ativo.',
    documentation: '/api/status',
    endpoints: {
      status: '/api/status',
      flights: '/api/flights/search',
      hotels: '/api/hotels/search',
      airports: '/api/airports/search',
      email: {
        verification: '/api/send-verification',
        welcome: '/api/send-welcome',
        general: '/api/send-email'
      }
    }
  });
});

// Status da API
app.get('/api/status', async (req, res) => {
  try {
    console.log('🔍 Checking API status...');
    
    // Testar conectividade com Amadeus
    const token = await amadeus.getAccessToken();
    const isAmadeusOnline = !!token;

    // Check email service
    const isEmailConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_PASS);

    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      services: {
        amadeus: isAmadeusOnline ? 'online' : 'offline',
        email: isEmailConfigured ? 'configured' : 'not configured',
        cache: cache.getStats(),
        environment: process.env.NODE_ENV || 'development'
      },
      endpoints: {
        flights: '/api/flights/search',
        hotels: '/api/hotels/search',
        airports: '/api/airports/search',
        email: '/api/send-verification'
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
    const origin = req.get('origin') || req.get('host') || 'https://your-domain.com';
    
    const mailOptions = {
      from: `"TPS Travel System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🔐 TPS Travel - Verify Your Email Address',
      html: readFileSync('./verification-template.html', 'utf8')
        .replace('{{USER_NAME}}', name)
        .replace('{{VERIFICATION_TOKEN}}', token)
        .replace('{{USER_EMAIL}}', email)
        .replace('{{VERIFICATION_LINK}}', origin + '/verify?token=' + token)
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
    version: '1.1.0'
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
      amadeus: !!(process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET)
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
  console.log(`✅ TPS Server running on http://0.0.0.0:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log(`   GET  / - Homepage`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /test - Diagnostic test`);
  console.log(`   GET  /api/status - API status`);
  console.log(`   GET  /api/flights/search - Search flights`);
  console.log(`   GET  /api/hotels/search - Search hotels`);
  console.log(`   GET  /api/airports/search - Search airports`);
  console.log(`   POST /api/send-verification - Send verification email`);
  console.log(`   POST /api/send-welcome - Send welcome email`);
  console.log(`   POST /api/send-email - Send custom email`);
  console.log('🚀 ====================================');
  
  // Test email configuration
  await testEmailConfiguration();
});

export default app;