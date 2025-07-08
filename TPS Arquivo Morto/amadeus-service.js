// amadeus-service.js - Módulo de Integração Amadeus para TPS
// 🎯 Módulo dedicado para buscas de voos reais

import Amadeus from 'amadeus';

// ===== INICIALIZAÇÃO AMADEUS =====
let amadeus;

try {
  amadeus = new Amadeus({
    clientId: process.env.AMADEUS_API_KEY,
    clientSecret: process.env.AMADEUS_API_SECRET,
    hostname: process.env.NODE_ENV === 'production' ? 'production' : 'test'
  });
  console.log('✅ Amadeus inicializado com sucesso');
} catch (error) {
  console.error('❌ Erro ao inicializar Amadeus:', error.message);
}

// ===== CACHE SIMPLES PARA OTIMIZAÇÃO =====
const cache = new Map();
const CACHE_TTL = 300000; // 5 minutos

function getCacheKey(origem, destino, data) {
  return `${origem}-${destino}-${data}`;
}

function isValidCache(timestamp) {
  return Date.now() - timestamp < CACHE_TTL;
}

// ===== FUNÇÃO: BUSCAR CÓDIGOS DE AEROPORTOS =====
export async function buscarCodigoAeroporto(cidade) {
  try {
    if (!amadeus) {
      console.log('⚠️ Amadeus não disponível, usando fallback');
      return getCodigoFallback(cidade);
    }

    console.log(`🔍 Buscando código IATA para: ${cidade}`);
    
    const response = await amadeus.referenceData.locations.get({
      keyword: cidade,
      subType: 'AIRPORT,CITY',
      page: { limit: 1 }
    });
    
    if (response.data && response.data.length > 0) {
      const codigo = response.data[0].iataCode;
      console.log(`✅ Código encontrado: ${cidade} → ${codigo}`);
      return codigo;
    }
    
    console.log(`⚠️ Código não encontrado via API, usando fallback`);
    return getCodigoFallback(cidade);
    
  } catch (error) {
    console.error(`❌ Erro ao buscar código ${cidade}:`, error.message);
    return getCodigoFallback(cidade);
  }
}

// ===== FUNÇÃO: CÓDIGOS FALLBACK PARA CIDADES PRINCIPAIS =====
function getCodigoFallback(cidade) {
  const codigos = {
    // Brasil
    'são paulo': 'SAO',
    'sao paulo': 'SAO', 
    'rio de janeiro': 'RIO',
    'brasília': 'BSB',
    'brasilia': 'BSB',
    'salvador': 'SSA',
    'recife': 'REC',
    'fortaleza': 'FOR',
    'belo horizonte': 'CNF',
    'porto alegre': 'POA',
    'curitiba': 'CWB',
    'manaus': 'MAO',
    
    // Internacional
    'paris': 'CDG',
    'london': 'LHR',
    'londres': 'LHR',
    'new york': 'JFK',
    'nova york': 'JFK',
    'tokyo': 'NRT',
    'tóquio': 'NRT',
    'madrid': 'MAD',
    'barcelona': 'BCN',
    'rome': 'FCO',
    'roma': 'FCO',
    'amsterdam': 'AMS',
    'dubai': 'DXB',
    'sydney': 'SYD',
    'bangkok': 'BKK',
    'seoul': 'ICN',
    'seul': 'ICN',
    'los angeles': 'LAX',
    'miami': 'MIA',
    'toronto': 'YYZ',
    'mexico city': 'MEX',
    'cidade do méxico': 'MEX',
    'buenos aires': 'EZE',
    'santiago': 'SCL',
    'bogotá': 'BOG',
    'bogota': 'BOG',
    'lima': 'LIM',
    'lisboa': 'LIS',
    'lisbon': 'LIS'
  };
  
  const cidadeLower = cidade.toLowerCase().trim();
  return codigos[cidadeLower] || null;
}

// ===== FUNÇÃO: BUSCAR VOOS REAIS =====
export async function buscarVoosReais(origem, destino, dataIda, dataVolta = null, adultos = 1) {
  try {
    if (!amadeus) {
      console.log('⚠️ Amadeus não disponível, retornando null');
      return null;
    }

    // Verificar cache primeiro
    const cacheKey = getCacheKey(origem, destino, dataIda);
    const cached = cache.get(cacheKey);
    
    if (cached && isValidCache(cached.timestamp)) {
      console.log(`💾 Usando cache para: ${origem} → ${destino}`);
      return cached.data;
    }

    console.log(`🔍 Buscando voos: ${origem} → ${destino} em ${dataIda}`);
    
    const parametros = {
      originLocationCode: origem,
      destinationLocationCode: destino,
      departureDate: dataIda,
      adults: parseInt(adultos) || 1,
      max: 8,
      nonStop: 'false',
      currencyCode: 'BRL'
    };
    
    if (dataVolta) {
      parametros.returnDate = dataVolta;
    }
    
    const response = await amadeus.shopping.flightOffersSearch.get(parametros);
    
    if (response.data && response.data.length > 0) {
      const voosFormatados = formatarVoos(response.data);
      
      // Salvar no cache
      cache.set(cacheKey, {
        data: voosFormatados,
        timestamp: Date.now()
      });
      
      console.log(`✅ ${voosFormatados.length} voos encontrados`);
      return voosFormatados;
    }
    
    console.log(`⚠️ Nenhum voo encontrado para ${origem} → ${destino}`);
    return null;
    
  } catch (error) {
    console.error('❌ Erro na busca Amadeus:', error.message);
    
    // Log detalhado apenas em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      console.error('Detalhes do erro:', error.response?.data || error);
    }
    
    return null;
  }
}

// ===== FUNÇÃO: FORMATAR VOOS PARA RESPOSTA =====
function formatarVoos(voosAmadeus) {
  return voosAmadeus.map((voo, index) => {
    try {
      const preco = parseFloat(voo.price.total);
      const moeda = voo.price.currency;
      const segmentos = voo.itineraries[0].segments;
      
      // Primeiro segmento (saída)
      const primeiroSegmento = segmentos[0];
      
      // Último segmento (chegada final)
      const ultimoSegmento = segmentos[segmentos.length - 1];
      
      const vooFormatado = {
        id: index + 1,
        preco: formatarPreco(preco, moeda),
        precoNumerico: preco,
        companhia: obterNomeCompanhia(primeiroSegmento.carrierCode),
        codigoCompanhia: primeiroSegmento.carrierCode,
        numeroVoo: `${primeiroSegmento.carrierCode}${primeiroSegmento.number}`,
        
        // Horários
        saida: primeiroSegmento.departure.at,
        chegada: ultimoSegmento.arrival.at,
        saidaFormatada: formatarDataHora(primeiroSegmento.departure.at),
        chegadaFormatada: formatarDataHora(ultimoSegmento.arrival.at),
        
        // Duração e escalas
        duracao: voo.itineraries[0].duration,
        duracaoFormatada: formatarDuracao(voo.itineraries[0].duration),
        escalas: segmentos.length - 1,
        
        // Aeroportos
        aeroportoOrigem: primeiroSegmento.departure.iataCode,
        aeroportoDestino: ultimoSegmento.arrival.iataCode,
        
        // Detalhes adicionais
        classe: voo.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.class || 'Y',
        disponibilidade: voo.numberOfBookableSeats || 9
      };
      
      return vooFormatado;
      
    } catch (error) {
      console.error(`❌ Erro ao formatar voo ${index}:`, error);
      return null;
    }
  }).filter(voo => voo !== null);
}

// ===== FUNÇÃO: OBTER NOME DA COMPANHIA =====
function obterNomeCompanhia(codigo) {
  const companhias = {
    'G3': 'GOL',
    'AD': 'Azul',
    'TP': 'TAP',
    'LA': 'LATAM',
    'AF': 'Air France',
    'KL': 'KLM',
    'LH': 'Lufthansa',
    'BA': 'British Airways',
    'IB': 'Iberia',
    'EK': 'Emirates',
    'QR': 'Qatar Airways',
    'TK': 'Turkish Airlines',
    'UA': 'United',
    'AA': 'American Airlines',
    'DL': 'Delta',
    'JJ': 'TAM', // Código antigo
    'JT': 'Azul'
  };
  
  return companhias[codigo] || codigo;
}

// ===== FUNÇÃO: FORMATAR PREÇO =====
function formatarPreco(valor, moeda) {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: moeda || 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  return formatter.format(valor);
}

// ===== FUNÇÃO: FORMATAR DATA E HORA =====
function formatarDataHora(isoString) {
  const date = new Date(isoString);
  
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo'
  });
}

// ===== FUNÇÃO: FORMATAR DURAÇÃO =====
function formatarDuracao(isoDuration) {
  try {
    // ISO 8601 duration: PT5H30M
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    
    if (!match) return isoDuration;
    
    const horas = parseInt(match[1]) || 0;
    const minutos = parseInt(match[2]) || 0;
    
    if (horas > 0 && minutos > 0) {
      return `${horas}h ${minutos}m`;
    } else if (horas > 0) {
      return `${horas}h`;
    } else {
      return `${minutos}m`;
    }
    
  } catch (error) {
    return isoDuration;
  }
}

// ===== FUNÇÃO: ANÁLISE AVANÇADA DE VIAGEM =====
export function analisarViagemAvancada(prompt) {
  const promptLower = prompt.toLowerCase();
  
  // Padrões para detectar viagens
  const padroesViagem = [
    /viagem\s+(de|para|entre)\s+([a-záàâãéêíóôõúç\s]+?)(?:\s+para|\s+até|\s+e|\s+,|\s+\.|$)/gi,
    /voo\s+(de|para|entre)\s+([a-záàâãéêíóôõúç\s]+?)(?:\s+para|\s+até|\s+e|\s+,|\s+\.|$)/gi,
    /passagem\s+(de|para|entre)\s+([a-záàâãéêíóôõúç\s]+?)(?:\s+para|\s+até|\s+e|\s+,|\s+\.|$)/gi,
    /ir\s+(de|para)\s+([a-záàâãéêíóôõúç\s]+?)(?:\s+para|\s+até|\s+e|\s+,|\s+\.|$)/gi,
    /saindo\s+de\s+([a-záàâãéêíóôõúç\s]+?)(?:\s+para|\s+até|\s+com destino|\s+,|\s+\.|$)/gi,
    /com destino\s+a\s+([a-záàâãéêíóôõúç\s]+?)(?:\s+,|\s+\.|$)/gi
  ];
  
  // Padrões para datas
  const padroesDatas = [
    /(\d{1,2}\/\d{1,2}\/\d{4})/g,
    /(\d{1,2}-\d{1,2}-\d{4})/g,
    /(\d{4}-\d{1,2}-\d{1,2})/g,
    /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+\d{4}/gi,
    /(próxim[ao]|semana que vem|mês que vem)/gi
  ];
  
  let origem = null;
  let destino = null;
  let dataIda = null;
  let dataVolta = null;
  let passageiros = 1;
  
  // Extrair cidades
  for (const padrao of padroesViagem) {
    let match;
    padrao.lastIndex = 0; // Reset regex
    
    while ((match = padrao.exec(prompt)) !== null) {
      const preposicao = match[1];
      const cidade = match[2].trim();
      
      if (preposicao === 'de') {
        origem = cidade;
      } else if (preposicao === 'para') {
        destino = cidade;
      }
    }
  }
  
  // Extrair datas
  const datasEncontradas = [];
  for (const padrao of padroesDatas) {
    let match;
    while ((match = padrao.exec(prompt)) !== null) {
      datasEncontradas.push(match[0]);
    }
  }
  
  if (datasEncontradas.length > 0) {
    dataIda = processarData(datasEncontradas[0]);
    if (datasEncontradas.length > 1) {
      dataVolta = processarData(datasEncontradas[1]);
    }
  }
  
  // Extrair número de passageiros
  const matchPassageiros = prompt.match(/(\d+)\s*(pessoa|pessoas|adulto|adultos|passageiro|passageiros)/i);
  if (matchPassageiros) {
    passageiros = parseInt(matchPassageiros[1]);
  }
  
  // Determinar se é uma consulta de viagem
  const isViagem = !!(
    origem || destino || 
    promptLower.includes('voo') || 
    promptLower.includes('viagem') || 
    promptLower.includes('passagem') ||
    promptLower.includes('voar') ||
    promptLower.includes('viajar')
  );
  
  return {
    isViagem,
    origem: origem ? origem.replace(/[.,!?;]$/, '') : null,
    destino: destino ? destino.replace(/[.,!?;]$/, '') : null,
    dataIda,
    dataVolta,
    passageiros,
    confidence: calcularConfianca(origem, destino, dataIda, promptLower)
  };
}

// ===== FUNÇÃO: PROCESSAR DATA =====
function processarData(dataStr) {
  try {
    // Formato DD/MM/YYYY
    if (dataStr.includes('/')) {
      const [dia, mes, ano] = dataStr.split('/');
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    // Formato DD-MM-YYYY
    if (dataStr.includes('-') && dataStr.length <= 10) {
      const [dia, mes, ano] = dataStr.split('-');
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }
    
    // Formato YYYY-MM-DD (já correto)
    if (dataStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
      return dataStr;
    }
    
    // Datas por extenso - simplificado
    const hoje = new Date();
    if (dataStr.includes('próxim') || dataStr.includes('semana que vem')) {
      const futuro = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
      return futuro.toISOString().split('T')[0];
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// ===== FUNÇÃO: CALCULAR CONFIANÇA =====
function calcularConfianca(origem, destino, data, prompt) {
  let score = 0;
  
  if (origem) score += 30;
  if (destino) score += 30;
  if (data) score += 20;
  if (prompt.includes('voo')) score += 10;
  if (prompt.includes('passagem')) score += 10;
  
  return Math.min(score, 100);
}

// ===== FUNÇÃO: STATUS DO MÓDULO =====
export function getAmadeusStatus() {
  return {
    available: !!amadeus,
    cache_size: cache.size,
    environment: process.env.NODE_ENV || 'development',
    api_key_configured: !!process.env.AMADEUS_API_KEY,
    secret_configured: !!process.env.AMADEUS_API_SECRET
  };
}

// ===== FUNÇÃO: LIMPAR CACHE =====
export function clearCache() {
  cache.clear();
  console.log('🧹 Cache Amadeus limpo');
}

// ===== EXPORT DEFAULT =====
export default {
  buscarVoosReais,
  buscarCodigoAeroporto,
  analisarViagemAvancada,
  getAmadeusStatus,
  clearCache
};