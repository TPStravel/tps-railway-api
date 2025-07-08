// tps-travel-router.js
// 🧠 Módulo de Análise Inteligente de Viagem para TPS-GPT

const destinosSuportados = {
  'paris': ['paris', 'frança', 'france', 'torre eiffel', 'louvre'],
  'london': ['londres', 'london', 'inglaterra', 'england', 'big ben'],
  'new york': ['nova york', 'new york', 'nyc', 'manhattan', 'times square'],
  'tokyo': ['tóquio', 'tokyo', 'japão', 'japan', 'shibuya', 'ginza'],
  'seoul': ['seul', 'seoul', 'coreia', 'korea', 'gangnam', 'myeongdong'],
  'bangkok': ['bangkok', 'tailândia', 'thailand', 'wat pho'],
  'dubai': ['dubai', 'emirados', 'uae', 'burj khalifa'],
  'barcelona': ['barcelona', 'espanha', 'spain', 'sagrada familia'],
  'rome': ['roma', 'rome', 'itália', 'italy', 'coliseu', 'vaticano'],
  'amsterdam': ['amsterdam', 'holanda', 'netherlands', 'canais']
};

const servicosViagem = {
  voos: ['voo', 'voos', 'flight', 'passagem', 'aéreo', 'avião'],
  hospedagem: ['hotel', 'hotéis', 'hospedagem', 'acomodação', 'resort'],
  transporte: ['transporte', 'carro', 'aluguel', 'táxi', 'uber'],
  atividades: ['passeio', 'tour', 'atividade', 'ingresso', 'atração'],
  seguro: ['seguro', 'insurance', 'proteção', 'cobertura'],
  pacotes: ['pacote', 'package', 'combo', 'promoção']
};

const palavrasChaveViagem = [
  'viagem', 'viajar', 'ir para', 'conhecer', 'visitar', 'quero ir',
  'destino', 'travel', 'trip', 'vacation', 'férias', 'passeio'
];

function analisarViagem(prompt, lang = 'pt') {
  console.log(`🔍 Analisando prompt: "${prompt}"`);
  
  const textoLower = prompt.toLowerCase();
  
  // Verificar se é relacionado a viagem
  const ehViagem = palavrasChaveViagem.some(palavra => textoLower.includes(palavra)) ||
                   Object.values(destinosSuportados).some(aliases => 
                     aliases.some(alias => textoLower.includes(alias))
                   );
  
  if (!ehViagem) {
    console.log('❌ Não é uma consulta de viagem');
    return null;
  }
  
  console.log('✅ Consulta de viagem detectada');
  
  // Detectar destino
  const destinoDetectado = detectarDestino(textoLower);
  
  // Detectar serviços
  const servicosDetectados = detectarServicos(textoLower);
  
  // Calcular confiança
  let confianca = 0.3;
  if (destinoDetectado) confianca += 0.4;
  if (servicosDetectados.length > 0) confianca += 0.3;
  
  const resultado = {
    destino: destinoDetectado ? {
      cidade: normalizarNomeCidade(destinoDetectado),
      detectado: destinoDetectado,
      confianca: confianca
    } : null,
    servicos: servicosDetectados.length > 0 ? servicosDetectados : ['voos', 'hospedagem'],
    confianca: Math.min(confianca, 1.0),
    promptOriginal: prompt,
    idioma: lang
  };
  
  console.log(`✅ Análise concluída:`, resultado);
  return resultado;
}

function detectarDestino(texto) {
  let melhorDestino = null;
  let maiorPontuacao = 0;
  
  for (const [destino, aliases] of Object.entries(destinosSuportados)) {
    const pontuacao = aliases.filter(alias => texto.includes(alias)).length;
    if (pontuacao > maiorPontuacao) {
      maiorPontuacao = pontuacao;
      melhorDestino = destino;
    }
  }
  
  if (melhorDestino) {
    console.log(`🎯 Destino detectado: ${melhorDestino}`);
  }
  
  return melhorDestino;
}

function detectarServicos(texto) {
  const servicosEncontrados = [];
  
  for (const [servico, palavras] of Object.entries(servicosViagem)) {
    if (palavras.some(palavra => texto.includes(palavra))) {
      servicosEncontrados.push(servico);
    }
  }
  
  console.log(`🔧 Serviços detectados: ${servicosEncontrados.join(', ')}`);
  return servicosEncontrados;
}

function normalizarNomeCidade(destino) {
  const normalizacao = {
    'new york': 'New York',
    'são paulo': 'São Paulo',
    'rio de janeiro': 'Rio de Janeiro'
  };
  
  return normalizacao[destino] || 
         destino.split(' ').map(palavra => 
           palavra.charAt(0).toUpperCase() + palavra.slice(1)
         ).join(' ');
}

export { analisarViagem, normalizarNomeCidade };

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analisarViagem, normalizarNomeCidade };
}