// server.js
// 🚀 Servidor Principal TPS - Estrutura Gemini + Funcionalidade ChatGPT

import express from 'express';
import { generateAffiliateLinks } from './affiliate-links.js';
import { detectUserIntent } from './intent-detection.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Cache de respostas (DeepSeek)
const responseCache = new Map();
const CACHE_TTL = 300000; // 5 minutos

// Endpoint principal para processar mensagens
app.post('/api/process-query', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Mensagem não pode estar vazia'
      });
    }
    
    const cacheKey = message.toLowerCase().trim();
    
    // Verificar cache
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return res.json(cached.data);
      }
    }
    
    // Detectar intenção
    const intent = detectUserIntent(message);
    
    // Gerar resposta contextual
    let responseMessage = "🌟 Vou ajudar você a encontrar a melhor opção!";
    let tips = [];
    
    if (intent.service === 'flight' && intent.entities.destination) {
      responseMessage = `✈️ Perfeito! Vamos encontrar voos para ${intent.entities.destination}!`;
      
      // Dicas específicas por destino (DeepSeek valor agregado)
      const destinationTips = {
        'tóquio': '💡 Dica: Reserve com antecedência para melhores preços. Primavera (março-maio) é ideal!',
        'tokyo': '💡 Dica: Reserve com antecedência para melhores preços. Primavera (março-maio) é ideal!',
        'paris': '💡 Dica: Evite agosto quando muitos locais fecham para férias.',
        'dubai': '💡 Dica: Novembro a março tem o melhor clima.',
        'londres': '💡 Dica: Compre com antecedência, especialmente no verão!',
        'nova york': '💡 Dica: Evite feriados americanos para preços melhores.'
      };
      
      const tip = destinationTips[intent.entities.destination.toLowerCase()];
      if (tip) tips.push(tip);
    }
    
    if (intent.service === 'hotel' && intent.entities.city) {
      responseMessage = `🏨 Excelente! Vamos buscar hotéis em ${intent.entities.city}!`;
      tips.push('💡 Dica: Verifique as políticas de cancelamento antes de reservar.');
    }
    
    // Gerar links afiliados
    const affiliateLinks = generateAffiliateLinks(intent, {
      origin: getIATACode(intent.entities.origin),
      destination: getIATACode(intent.entities.destination),
      date: intent.entities.date,
      city: intent.entities.city,
      checkin: intent.entities.checkin,
      checkout: intent.entities.checkout
    });
    
    const response = {
      success: true,
      message: responseMessage,
      links: affiliateLinks,
      tips: tips,
      intent: intent.service
    };
    
    // Salvar no cache
    responseCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });
    
    res.json(response);
    
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({
      success: false,
      message: 'Estou melhorando meu sistema. Tente novamente em alguns minutos!',
      fallbackLink: 'https://trip.com'
    });
  }
});

// Função auxiliar para converter cidades em códigos IATA
function getIATACode(cityName) {
  if (!cityName) return null;
  
  const cityMap = {
    'são paulo': 'GRU',
    'sao paulo': 'GRU',
    'tóquio': 'NRT',
    'tokyo': 'NRT',
    'paris': 'CDG',
    'londres': 'LHR',
    'london': 'LHR',
    'dubai': 'DXB',
    'nova york': 'JFK',
    'new york': 'JFK',
    'madrid': 'MAD',
    'roma': 'FCO',
    'rome': 'FCO',
    'barcelona': 'BCN',
    'amsterdã': 'AMS',
    'amsterdam': 'AMS'
  };
  
  return cityMap[cityName.toLowerCase()] || 'GRU';
}

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ 
    message: 'TPS Server está funcionando!', 
    timestamp: new Date().toISOString() 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 TPS Server running on http://localhost:${PORT}`);
  console.log(`📝 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🌐 Frontend: http://localhost:${PORT}/index.html`);
});