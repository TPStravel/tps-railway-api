// intent-detection.js
// 🧠 Detecção de Intenção - Híbrido DeepSeek + ChatGPT

// Cache simples para performance
const intentCache = new Map();

export function detectUserIntent(message) {
  const text = message.toLowerCase().trim();
  
  // Verificar cache
  if (intentCache.has(text)) {
    return intentCache.get(text);
  }
  
  const result = {
    service: 'unknown',
    confidence: 0,
    entities: {}
  };
  
  // 1. Detecção hierárquica de serviços (DeepSeek)
  const servicePatterns = {
    flight: {
      keywords: ['voo', 'voar', 'passagem', 'avião', 'viajar para', 'ir para'],
      confidence: 0.9
    },
    hotel: {
      keywords: ['hotel', 'hospedagem', 'acomodação', 'dormir', 'ficar em'],
      confidence: 0.9
    },
    insurance: {
      keywords: ['seguro', 'proteção', 'cobertura', 'emergência'],
      confidence: 0.8
    }
  };
  
  // Detectar tipo de serviço
  for (const [service, config] of Object.entries(servicePatterns)) {
    if (config.keywords.some(keyword => text.includes(keyword))) {
      result.service = service;
      result.confidence = config.confidence;
      break;
    }
  }
  
  // 2. Extração de entidades específicas por serviço
  if (result.service === 'flight') {
    // Detectar destino
    const destinationPatterns = [
      /(?:para|a)\s+([^,\.;]+?)(?:\s|$|,|\.)/,
      /(?:ir para|viajar para)\s+([^,\.;]+?)(?:\s|$|,|\.)/
    ];
    
    for (const pattern of destinationPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.entities.destination = match[1].trim();
        break;
      }
    }
    
    // Detectar origem
    const originMatch = text.match(/(?:de|saindo de)\s+([^,\.;]+?)(?:\s|$|,|\.)/);
    if (originMatch) {
      result.entities.origin = originMatch[1].trim();
    } else {
      result.entities.origin = 'São Paulo'; // Default
    }
    
    // Detectar data
    const dateMatch = text.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (dateMatch) {
      result.entities.date = `${dateMatch[3]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')}`;
    } else {
      // Data padrão (próximo mês)
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      result.entities.date = nextMonth.toISOString().split('T')[0];
    }
  }
  
  if (result.service === 'hotel') {
    // Detectar cidade
    const cityMatch = text.match(/(?:em|no|na)\s+([^,\.;]+?)(?:\s|$|,|\.)/);
    if (cityMatch) {
      result.entities.city = cityMatch[1].trim();
    }
    
    // Datas padrão para hotel (checkin hoje + 7 dias, checkout + 2 dias)
    const checkin = new Date();
    checkin.setDate(checkin.getDate() + 7);
    const checkout = new Date(checkin);
    checkout.setDate(checkout.getDate() + 2);
    
    result.entities.checkin = checkin.toISOString().split('T')[0];
    result.entities.checkout = checkout.toISOString().split('T')[0];
  }
  
  // Salvar no cache
  intentCache.set(text, result);
  
  return result;
}

// Para CommonJS (compatibilidade)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detectUserIntent };
}