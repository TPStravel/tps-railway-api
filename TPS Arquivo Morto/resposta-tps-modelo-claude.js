// resposta-tps-modelo-claude.js
// 🎯 TPS Claude Response Engine - Sistema de Respostas Encantadoras
// 🌟 Diretor Criativo: Claude | Foco: Conversão + Encantamento + Eficiência

// ===== CONFIGURAÇÃO DE LINKS AFILIADOS =====
const LINKS_AFILIADOS = {
  voos: {
    airfrance: 'https://www.airfrance.com.br/pt-br/?utm_source=tps&utm_campaign=premium',
    latam: 'https://www.latam.com/pt_br/?utm_source=tps&utm_campaign=conversion',
    klm: 'https://www.klm.com.br/?utm_source=tps&utm_campaign=luxury',
    lufthansa: 'https://www.lufthansa.com/br/pt/?utm_source=tps&utm_campaign=business',
    emirates: 'https://www.emirates.com/br/portuguese/?utm_source=tps&utm_campaign=first',
    turkish: 'https://www.turkishairlines.com/pt-br/?utm_source=tps&utm_campaign=conectar',
    tap: 'https://www.flytap.com/pt-br/?utm_source=tps&utm_campaign=europa',
    united: 'https://www.united.com/pt/br/?utm_source=tps&utm_campaign=eua'
  },
  hoteis: {
    booking: 'https://www.booking.com/?utm_source=tps&utm_campaign=hoteis',
    marriott: 'https://www.marriott.com.br/?utm_source=tps&utm_campaign=luxury',
    hilton: 'https://www.hilton.com/pt/?utm_source=tps&utm_campaign=premium'
  },
  carros: {
    hertz: 'https://www.hertz.com.br/?utm_source=tps&utm_campaign=carros',
    localiza: 'https://www.localiza.com/?utm_source=tps&utm_campaign=brasil'
  }
};

// ===== BANCO DE DADOS DE VOOS DINÂMICOS =====
const VOOS_DATABASE = {
  'paris': [
    {
      cia: 'Air France',
      emoji: '🇫🇷',
      horario: '22:10 – 11:45 (+1)',
      terminal: 'GRU T3 → CDG T2',
      classe: { tipo: 'First', emoji: '👑' },
      preco: 'USD 892',
      link: 'airfrance',
      duracao: '11h 35m',
      destaque: 'Direto'
    },
    {
      cia: 'LATAM',
      emoji: '🇧🇷',
      horario: '14:35 – 06:10 (+1)',
      terminal: 'GRU T2 → CDG T1',
      classe: { tipo: 'Business', emoji: '💼' },
      preco: 'USD 623',
      link: 'latam',
      duracao: '15h 35m',
      destaque: '1 escala'
    },
    {
      cia: 'KLM',
      emoji: '🇳🇱',
      horario: '23:55 – 14:20 (+1)',
      terminal: 'GRU T3 → AMS → CDG',
      classe: { tipo: 'Economy', emoji: '🧳' },
      preco: 'USD 547',
      link: 'klm',
      duracao: '14h 25m',
      destaque: 'Melhor preço'
    },
    {
      cia: 'Lufthansa',
      emoji: '🇩🇪',
      horario: '19:45 – 13:15 (+1)',
      terminal: 'GRU T1 → FRA → CDG',
      classe: { tipo: 'Premium Eco', emoji: '✨' },
      preco: 'USD 698',
      link: 'lufthansa',
      duracao: '17h 30m',
      destaque: 'Confort+'
    }
  ],
  'londres': [
    {
      cia: 'British Airways',
      emoji: '🇬🇧',
      horario: '21:15 – 11:05 (+1)',
      terminal: 'GRU T3 → LHR T5',
      classe: { tipo: 'First', emoji: '👑' },
      preco: 'USD 1,247',
      link: 'airfrance',
      duracao: '11h 50m',
      destaque: 'Direto'
    },
    {
      cia: 'LATAM',
      emoji: '🇧🇷',
      horario: '16:20 – 07:35 (+1)',
      terminal: 'GRU T2 → LHR T3',
      classe: { tipo: 'Business', emoji: '💼' },
      preco: 'USD 845',
      link: 'latam',
      duracao: '15h 15m',
      destaque: '1 escala'
    },
    {
      cia: 'KLM',
      emoji: '🇳🇱',
      horario: '23:55 – 16:40 (+1)',
      terminal: 'GRU T3 → AMS → LHR',
      classe: { tipo: 'Economy', emoji: '🧳' },
      preco: 'USD 623',
      link: 'klm',
      duracao: '16h 45m',
      destaque: 'Econômico'
    }
  ],
  'nova-york': [
    {
      cia: 'LATAM',
      emoji: '🇧🇷',
      horario: '23:50 – 07:25 (+1)',
      terminal: 'GRU T2 → JFK T1',
      classe: { tipo: 'Business', emoji: '💼' },
      preco: 'USD 1,156',
      link: 'latam',
      duracao: '9h 35m',
      destaque: 'Direto'
    },
    {
      cia: 'United',
      emoji: '🇺🇸',
      horario: '00:35 – 06:55',
      terminal: 'GRU T3 → EWR T1',
      classe: { tipo: 'Economy', emoji: '🧳' },
      preco: 'USD 732',
      link: 'united',
      duracao: '10h 20m',
      destaque: 'Madrugada'
    },
    {
      cia: 'Air France',
      emoji: '🇫🇷',
      horario: '22:10 – 15:45 (+1)',
      terminal: 'GRU T3 → CDG → JFK',
      classe: { tipo: 'Premium Eco', emoji: '✨' },
      preco: 'USD 892',
      link: 'airfrance',
      duracao: '17h 35m',
      destaque: 'Via Paris'
    }
  ],
  'toquio': [
    {
      cia: 'Emirates',
      emoji: '🇦🇪',
      horario: '02:25 – 05:40 (+2)',
      terminal: 'GRU T3 → DXB → NRT',
      classe: { tipo: 'First', emoji: '👑' },
      preco: 'USD 2,340',
      link: 'emirates',
      duracao: '27h 15m',
      destaque: 'Luxury'
    },
    {
      cia: 'Turkish Airlines',
      emoji: '🇹🇷',
      horario: '01:35 – 23:15 (+1)',
      terminal: 'GRU T3 → IST → NRT',
      classe: { tipo: 'Business', emoji: '💼' },
      preco: 'USD 1,624',
      link: 'turkish',
      duracao: '21h 40m',
      destaque: 'Via Istanbul'
    },
    {
      cia: 'Air France',
      emoji: '🇫🇷',
      horario: '22:10 – 15:25 (+2)',
      terminal: 'GRU T3 → CDG → NRT',
      classe: { tipo: 'Economy', emoji: '🧳' },
      preco: 'USD 1,247',
      link: 'airfrance',
      duracao: '17h 15m',
      destaque: 'Via Paris'
    }
  ]
};

// ===== FRASES DE ABERTURA ENCANTADORAS =====
const ABERTURAS_MAGICAS = [
  "🌟 Sua próxima aventura está a um clique de distância!",
  "✨ Que viagem incrível você está planejando!",
  "🎯 Encontrei as melhores opções para sua jornada dos sonhos:",
  "🚀 Essas opções vão fazer você decolar de alegria:",
  "💫 Prepare-se para uma experiência inesquecível:",
  "🌍 O mundo está esperando por você! Veja essas opções:",
  "🎪 Como um concierge digital, sugiro essas pérolas:",
  "🔥 Essas ofertas estão imperdíveis para seu destino:"
];

// ===== FRASES DE TRANSIÇÃO INTELIGENTES =====
const TRANSICOES_INTELIGENTES = [
  "🏨 Quer que eu encontre também hotéis charmosos ou 🚗 um carro para explorar livremente?",
  "💼 Precisa de hospedagem de luxo ou transporte local? Estou aqui para ajudar!",
  "🌟 Que tal completar a experiência com hotel boutique e aluguel de carro?",
  "✨ Posso sugerir também acomodações incríveis e mobilidade para sua estadia!",
  "🎯 Hotel dos sonhos ou carro para aventuras? Diga e eu organizo tudo!",
  "💫 Hospedagem premium ou liberdade sobre quatro rodas? Você escolhe!",
  "🔮 Quer transformar essa viagem em uma experiência completa? Hotel + carro?",
  "🌈 Vamos completar o pacote perfeito? Hospedagem e transporte à sua escolha!"
];

// ===== FUNÇÃO PRINCIPAL: GERAR RESPOSTA ENCANTADORA =====
function gerarRespostaEncantadora(destino, tipoConsulta = 'voos') {
  const destinoLimpo = destino.toLowerCase().replace(/\s+/g, '-');
  const voos = VOOS_DATABASE[destinoLimpo] || gerarVoosGenericos(destino);
  
  const abertura = ABERTURAS_MAGICAS[Math.floor(Math.random() * ABERTURAS_MAGICAS.length)];
  const transicao = TRANSICOES_INTELIGENTES[Math.floor(Math.random() * TRANSICOES_INTELIGENTES.length)];
  
  let resposta = `${abertura}\n\n`;
  resposta += renderVoosFormatados(voos, destino);
  resposta += `\n\n${transicao}`;
  resposta += `\n\n💝 *Cada clique me ajuda a continuar encontrando as melhores ofertas para você!*`;
  
  return resposta;
}

// ===== FUNÇÃO: RENDERIZAR VOOS FORMATADOS =====
function renderVoosFormatados(voos, destino) {
  let tabela = `| 🛫 Companhia | 🕒 Horário | Terminal | 💼 Classe | 💰 Valor |\n`;
  tabela += `|-------------|------------|----------|-----------|----------|\n`;
  
  voos.slice(0, 5).forEach((voo, index) => {
    const numero = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][index];
    const link = LINKS_AFILIADOS.voos[voo.link] || '#';
    
    tabela += `| ${numero} ${voo.cia} ${voo.emoji} | ${voo.horario} | ${voo.terminal} | ${voo.classe.emoji} ${voo.classe.tipo} | [**${voo.preco}**](${link}) |\n`;
  });
  
  tabela += `\n📌 *Clique no valor para reservar com segurança e garantir o melhor preço!*`;
  
  return tabela;
}

// ===== FUNÇÃO: GERAR VOOS GENÉRICOS PARA DESTINOS NÃO CADASTRADOS =====
function gerarVoosGenericos(destino) {
  const companhias = [
    { cia: 'LATAM', emoji: '🇧🇷', link: 'latam' },
    { cia: 'Air France', emoji: '🇫🇷', link: 'airfrance' },
    { cia: 'KLM', emoji: '🇳🇱', link: 'klm' },
    { cia: 'Emirates', emoji: '🇦🇪', link: 'emirates' }
  ];
  
  const classes = [
    { tipo: 'Economy', emoji: '🧳' },
    { tipo: 'Premium Eco', emoji: '✨' },
    { tipo: 'Business', emoji: '💼' },
    { tipo: 'First', emoji: '👑' }
  ];
  
  return companhias.map((comp, index) => ({
    cia: comp.cia,
    emoji: comp.emoji,
    horario: `${8 + index * 3}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} – ${14 + index * 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')} (+1)`,
    terminal: `GRU T${index + 1} → ${destino.substring(0, 3).toUpperCase()}`,
    classe: classes[index % classes.length],
    preco: `USD ${Math.floor(Math.random() * 1000) + 500}`,
    link: comp.link,
    duracao: `${Math.floor(Math.random() * 10) + 8}h ${Math.floor(Math.random() * 60)}m`,
    destaque: ['Direto', 'Melhor preço', 'Conforto', 'Premium'][index % 4]
  }));
}

// ===== FUNÇÃO: RESPOSTA PARA CLIQUE DE CIDADE =====
function respostaCliqueCidade(cidade) {
  const emocoes = [
    `🎉 ${cidade}! Que escolha fantástica!`,
    `✨ ${cidade} é um destino dos sonhos!`,
    `🌟 Excelente gosto! ${cidade} é mágica!`,
    `💫 ${cidade} vai roubar seu coração!`,
    `🔥 ${cidade}! Você tem um gosto refinado!`
  ];
  
  const emocao = emocoes[Math.floor(Math.random() * emocoes.length)];
  
  return `${emocao}\n\n${gerarRespostaEncantadora(cidade)}`;
}

// ===== FUNÇÃO: RESPOSTA PARA HOTÉIS =====
function gerarRespostaHoteis(destino) {
  const abertura = `🏨 Hotéis incríveis em ${destino} esperando por você:`;
  
  const hoteis = [
    { nome: 'Hotel Boutique Premium', categoria: '5⭐', preco: 'USD 180/noite', link: 'booking' },
    { nome: 'Luxury Resort & Spa', categoria: '5⭐', preco: 'USD 320/noite', link: 'marriott' },
    { nome: 'Historic Palace Hotel', categoria: '4⭐', preco: 'USD 145/noite', link: 'hilton' },
    { nome: 'Modern Business Hotel', categoria: '4⭐', preco: 'USD 98/noite', link: 'booking' }
  ];
  
  let tabela = `\n\n| 🏨 Hotel | ⭐ Cat. | 💰 Preço | 🎯 Reservar |\n`;
  tabela += `|----------|---------|-----------|-------------|\n`;
  
  hoteis.forEach((hotel, index) => {
    const numero = ['🥇', '🥈', '🥉', '🏅'][index];
    const link = LINKS_AFILIADOS.hoteis[hotel.link] || '#';
    
    tabela += `| ${numero} ${hotel.nome} | ${hotel.categoria} | ${hotel.preco} | [**RESERVAR**](${link}) |\n`;
  });
  
  return `${abertura}${tabela}\n\n💎 *Clique para garantir sua estadia dos sonhos!*`;
}

// ===== FUNÇÃO: RESPOSTA PARA CARROS =====
function gerarRespostaCarros(destino) {
  const abertura = `🚗 Liberdade total para explorar ${destino}:`;
  
  const carros = [
    { tipo: 'Economy Compact', modelo: 'Fiat Argo ou similar', preco: 'USD 25/dia', link: 'localiza' },
    { tipo: 'SUV Premium', modelo: 'Toyota RAV4 ou similar', preco: 'USD 65/dia', link: 'hertz' },
    { tipo: 'Luxury Sedan', modelo: 'BMW Série 3 ou similar', preco: 'USD 95/dia', link: 'hertz' },
    { tipo: 'Convertible', modelo: 'Mercedes C-Class ou similar', preco: 'USD 120/dia', link: 'hertz' }
  ];
  
  let tabela = `\n\n| 🚗 Categoria | 🔑 Modelo | 💰 Preço | 🎯 Alugar |\n`;
  tabela += `|--------------|-----------|-----------|----------|\n`;
  
  carros.forEach((carro, index) => {
    const emoji = ['🚙', '🚐', '🚘', '🏎️'][index];
    const link = LINKS_AFILIADOS.carros[carro.link] || '#';
    
    tabela += `| ${emoji} ${carro.tipo} | ${carro.modelo} | ${carro.preco} | [**ALUGAR**](${link}) |\n`;
  });
  
  return `${abertura}${tabela}\n\n🗝️ *Clique e tenha a liberdade de explorar no seu ritmo!*`;
}

// ===== FUNÇÃO: PARSER INTELIGENTE DE CONSULTA =====
function analisarConsultaUsuario(mensagem) {
  const msgLower = mensagem.toLowerCase();
  
  // Detectar tipo de consulta
  if (msgLower.includes('hotel') || msgLower.includes('hospedagem') || msgLower.includes('acomodação')) {
    return { tipo: 'hotel', destino: extrairDestino(mensagem) };
  }
  
  if (msgLower.includes('carro') || msgLower.includes('aluguel') || msgLower.includes('rental')) {
    return { tipo: 'carro', destino: extrairDestino(mensagem) };
  }
  
  if (msgLower.includes('voo') || msgLower.includes('passagem') || msgLower.includes('voar')) {
    return { tipo: 'voo', destino: extrairDestino(mensagem) };
  }
  
  // Detectar destino direto (ex: "quero ir para Paris")
  const destino = extrairDestino(mensagem);
  if (destino) {
    return { tipo: 'voo', destino: destino };
  }
  
  return { tipo: 'geral', destino: null };
}

// ===== FUNÇÃO: EXTRAIR DESTINO DA MENSAGEM =====
function extrairDestino(mensagem) {
  const destinos = {
    'paris': ['paris', 'frança', 'france'],
    'londres': ['londres', 'london', 'inglaterra', 'reino unido', 'uk'],
    'nova-york': ['nova york', 'new york', 'nyc', 'nova iorque', 'manhattan'],
    'toquio': ['toquio', 'tokyo', 'japão', 'japan'],
    'roma': ['roma', 'rome', 'italia', 'italy'],
    'barcelona': ['barcelona', 'espanha', 'spain'],
    'amsterdam': ['amsterdam', 'holanda', 'netherlands'],
    'berlim': ['berlim', 'berlin', 'alemanha', 'germany'],
    'dubai': ['dubai', 'emirados', 'uae']
  };
  
  const msgLower = mensagem.toLowerCase();
  
  for (const [destino, aliases] of Object.entries(destinos)) {
    if (aliases.some(alias => msgLower.includes(alias))) {
      return destino;
    }
  }
  
  return null;
}

// ===== FUNÇÃO PRINCIPAL: RESPOSTA INTELIGENTE =====
function gerarRespostaTPS(mensagemUsuario) {
  const analise = analisarConsultaUsuario(mensagemUsuario);
  
  if (!analise.destino) {
    return "🌟 Olá! Sou seu assistente de viagens pessoal. Para onde você gostaria de viajar? Posso ajudar com voos, hotéis e aluguel de carros! ✈️🏨🚗";
  }
  
  switch (analise.tipo) {
    case 'hotel':
      return gerarRespostaHoteis(analise.destino);
    case 'carro':
      return gerarRespostaCarros(analise.destino);
    case 'voo':
    default:
      return gerarRespostaEncantadora(analise.destino);
  }
}

// ===== EXPORTAR FUNCÕES (ES6 MODULES) =====
export {
  gerarRespostaTPS,
  gerarRespostaEncantadora,
  respostaCliqueCidade,
  gerarRespostaHoteis,
  gerarRespostaCarros,
  renderVoosFormatados,
  analisarConsultaUsuario
};

// ===== EXEMPLO DE USO =====
/*
// Para voos
console.log(gerarRespostaTPS("quero ir para Paris"));

// Para hotéis
console.log(gerarRespostaTPS("preciso de hotel em Londres"));

// Para carros
console.log(gerarRespostaTPS("aluguel de carro em Nova York"));

// Resposta a clique de cidade
console.log(respostaCliqueCidade("Tóquio"));
*/