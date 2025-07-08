// affiliate-links.js
// 💰 Módulo de Links Afiliados e Monetização para TPS-GPT
// Sistema de geração de links reais com parceiros internacionais

// ===== CONFIGURAÇÃO DE AFILIADOS =====
const configAfiliados = {
  usuario_id: "639764",
  awin_id: "1949091",
  travelpayouts_marker: "639764",
  moeda: "BRL",
  idioma_padrao: "pt"
};

// ===== PARCEIROS E PLATAFORMAS =====
const parceirosAfiliados = {
  
  // 🛫 VOOS
  vooTrip: {
    nome: "Trip.com",
    categoria: "voos",
    descricao: "Voos internacionais com melhores preços",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "2965",
      l: "pt",
      currency: configAfiliados.moeda
    },
    prioridade: 10
  },
  
  vooKiwi: {
    nome: "Kiwi.com",
    categoria: "voos",
    descricao: "Busca inteligente de voos baratos",
    url_base: "https://tp.media/click",
    parametros: {
      shmarker: configAfiliados.travelpayouts_marker,
      promo_id: "3413",
      source_type: "link"
    },
    prioridade: 9
  },
  
  vooAviasales: {
    nome: "Aviasales",
    categoria: "voos", 
    descricao: "Compare preços de centenas de companhias",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "2917"
    },
    prioridade: 8
  },
  
  vooWayaway: {
    nome: "Wayaway",
    categoria: "voos",
    descricao: "Voos + Cashback de até 10%",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649", 
      p: "4679"
    },
    prioridade: 7
  },
  
  vooIberia: {
    nome: "Iberia",
    categoria: "voos", 
    descricao: "Iberia Brasil - voos para Europa",
    url_base: "https://www.anrdoezrs.net/click-101462880-12120173",
    parametros: {},
    prioridade: 8
  },
  // 🏨 HOSPEDAGEM
  hotelBooking: {
    nome: "Booking.com",
    categoria: "hospedagem",
    descricao: "Hotéis com cancelamento grátis",
    url_base: "https://www.awin1.com/cread.php",
    parametros: {
      awinmid: "18119",
      awinaffid: configAfiliados.awin_id,
      clickref: "tps-hotel"
    },
    prioridade: 10
  },
  
  hotelTrip: {
    nome: "Trip.com Hotéis",
    categoria: "hospedagem",
    descricao: "Hotéis com preços exclusivos Trip.com",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "2956"
    },
    prioridade: 9
  },
  
  hotelHotellook: {
    nome: "Hotellook",
    categoria: "hospedagem",
    descricao: "Compare preços de hotéis globalmente",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "2902"
    },
    prioridade: 8
  },

  // 🚗 TRANSPORTE
  carroLocalrent: {
    nome: "Localrent",
    categoria: "transporte",
    descricao: "Aluguel de carros locais e internacionais",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "2050"
    },
    prioridade: 9
  },
  
  transferPickups: {
    nome: "Pickups",
    categoria: "transporte",
    descricao: "Transfer aeroporto-hotel confiável",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "4680"
    },
    prioridade: 8
  },
  
  transferKiwitaxi: {
    nome: "Kiwitaxi",
    categoria: "transporte",
    descricao: "Táxi e transfer em 100+ países",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "4669"
    },
    prioridade: 7
  },

  // 🎫 ATIVIDADES E INGRESSOS
  tiqets: {
    nome: "Tiqets",
    categoria: "atividades",
    descricao: "Ingressos para atrações sem fila",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "2074"
    },
    prioridade: 10
  },
  
  wegotrip: {
    nome: "WeGoTrip",
    categoria: "atividades",
    descricao: "Tours culturais e experiências únicas",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "4682"
    },
    prioridade: 8
  },

  // 🛡️ SEGURO VIAGEM
  seguroEkta: {
    nome: "EKTA Seguros",
    categoria: "seguro",
    descricao: "Seguro viagem com cobertura mundial",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "4668"
    },
    prioridade: 9
  },

  // 💰 COMPENSAÇÃO
  compensacaoVoo: {
    nome: "Compensação Voo",
    categoria: "seguro",
    descricao: "Reembolso por voo atrasado ou cancelado",
    url_base: "https://tp.media/r",
    parametros: {
      marker: configAfiliados.travelpayouts_marker,
      trs: "425649",
      p: "4671"
    },
    prioridade: 6
  }
};

// ===== MAPEAMENTO POR DESTINO =====
const especialistasPorDestino = {
  'tokyo': ['hotelTrip', 'tiqets', 'vooTrip'],
  'seoul': ['hotelTrip', 'vooTrip', 'wegotrip'],
  'bangkok': ['hotelTrip', 'vooKiwi', 'transferKiwitaxi'],
  'paris': ['hotelBooking', 'tiqets', 'carroLocalrent'],
  'london': ['hotelBooking', 'wegotrip', 'tiqets'],
  'new york': ['hotelBooking', 'wegotrip', 'transferPickups'],
  'dubai': ['hotelBooking', 'vooTrip', 'wegotrip'],
  'barcelona': ['hotelBooking', 'tiqets', 'carroLocalrent'],
  'rome': ['hotelBooking', 'tiqets', 'wegotrip'],
  'amsterdam': ['hotelBooking', 'carroLocalrent', 'tiqets']
};

// ===== FUNÇÃO PRINCIPAL: GERAR LINKS AFILIADOS =====
function gerarLinksAfiliados(destino, servicos = ['voos', 'hospedagem']) {
  console.log(`💰 Gerando links afiliados para: ${destino?.cidade || 'genérico'}`);
  
  const links = {};
  const parceirosUsados = new Set();
  
  // 1️⃣ LINKS ESPECÍFICOS POR DESTINO
  if (destino && destino.cidade) {
    const cidadeKey = destino.cidade.toLowerCase();
    const especialistas = especialistasPorDestino[cidadeKey] || [];
    
    especialistas.forEach(parceiroId => {
      const parceiro = parceirosAfiliados[parceiroId];
      if (parceiro && !parceirosUsados.has(parceiroId)) {
        links[parceiroId] = gerarLinkIndividual(parceiro, destino);
        parceirosUsados.add(parceiroId);
      }
    });
  }
  
  // 2️⃣ LINKS POR CATEGORIA DE SERVIÇO
  servicos.forEach(servico => {
    const categoria = mapearServico(servico);
    const parceirosDaCategoria = obterParceirosPorCategoria(categoria);
    
    parceirosDaCategoria.slice(0, 2).forEach(parceiroId => {
      const parceiro = parceirosAfiliados[parceiroId];
      if (parceiro && !parceirosUsados.has(parceiroId)) {
        links[parceiroId] = gerarLinkIndividual(parceiro, destino);
        parceirosUsados.add(parceiroId);
      }
    });
  });
  
  // 3️⃣ GARANTIR LINKS ESSENCIAIS
  const essenciais = ['vooTrip', 'hotelBooking', 'seguroEkta'];
  essenciais.forEach(parceiroId => {
    const parceiro = parceirosAfiliados[parceiroId];
    if (parceiro && !parceirosUsados.has(parceiroId) && Object.keys(links).length < 8) {
      links[parceiroId] = gerarLinkIndividual(parceiro, destino);
      parceirosUsados.add(parceiroId);
    }
  });
  
  console.log(`✅ ${Object.keys(links).length} links afiliados gerados`);
  return links;
}

// ===== FUNÇÃO: GERAR LINKS PROTEGIDOS (VIA FIREBASE) =====
function gerarLinksProtegidos(destino, servicos = ['voos', 'hospedagem']) {
  console.log(`🔐 Gerando links protegidos para: ${destino?.cidade || 'genérico'}`);
  
  // Links protegidos via Firebase Functions (implementação futura)
  const linksProtegidos = {};
  
  // Por enquanto, retorna links diretos como fallback
  const linksBase = gerarLinksAfiliados(destino, servicos);
  
  Object.entries(linksBase).forEach(([parceiroId, link]) => {
    // Futuramente: https://us-central1-tps-travel.cloudfunctions.net/redirect?partner=X&dest=Y
    linksProtegidos[`${parceiroId}_protected`] = link;
  });
  
  return linksProtegidos;
}

// ===== FUNÇÃO: VALIDAR LINKS =====
function validarLinks(links) {
  console.log(`🔍 Validando ${Object.keys(links).length} links...`);
  
  const linksValidados = {};
  
  Object.entries(links).forEach(([parceiroId, link]) => {
    try {
      // Validação básica de URL
      const url = new URL(link);
      
      // Verificar se o domínio é confiável
      const dominiosConfiáveis = [
        'tp.media',
        'awin1.com', 
        'booking.com',
        'trip.com',
        'tiqets.com'
      ];
      
      const domínioConfiável = dominiosConfiáveis.some(dominio => 
        url.hostname.includes(dominio)
      );
      
      if (domínioConfiável) {
        linksValidados[parceiroId] = link;
      } else {
        console.log(`⚠️ Link rejeitado (domínio não confiável): ${parceiroId}`);
      }
      
    } catch (error) {
      console.log(`❌ Link inválido rejeitado: ${parceiroId} - ${error.message}`);
    }
  });
  
  console.log(`✅ ${Object.keys(linksValidados).length} links validados`);
  return linksValidados;
}

// ===== FUNÇÃO: GERAR LINK INDIVIDUAL =====
function gerarLinkIndividual(parceiro, destino) {
  try {
    const url = new URL(parceiro.url_base);
    
    // Adicionar parâmetros do parceiro
    Object.entries(parceiro.parametros).forEach(([chave, valor]) => {
      url.searchParams.append(chave, valor);
    });
    
    // Adicionar destino se aplicável
    if (destino && destino.cidade && !parceiro.categoria.includes('seguro')) {
      url.searchParams.append('destination', destino.cidade);
    }
    
    // Adicionar tracking único
    url.searchParams.append('tps_ref', `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`);
    
    return url.toString();
    
  } catch (error) {
    console.error(`❌ Erro ao gerar link para ${parceiro.nome}:`, error);
    return parceiro.url_base;
  }
}

// ===== FUNÇÕES AUXILIARES =====
function mapearServico(servico) {
  const mapeamento = {
    'voos': 'voos',
    'hospedagem': 'hospedagem', 
    'transporte': 'transporte',
    'atividades': 'atividades',
    'seguro': 'seguro',
    'pacotes': 'hospedagem' // Pacotes incluem hotel
  };
  
  return mapeamento[servico] || 'voos';
}

function obterParceirosPorCategoria(categoria) {
  const parceiros = [];
  
  Object.entries(parceirosAfiliados).forEach(([id, parceiro]) => {
    if (parceiro.categoria === categoria) {
      parceiros.push({ id, prioridade: parceiro.prioridade });
    }
  });
  
  // Ordenar por prioridade (maior primeiro)
  return parceiros
    .sort((a, b) => b.prioridade - a.prioridade)
    .map(p => p.id);
}

// ===== FUNÇÃO: ESTATÍSTICAS =====
function obterEstatisticasAfiliados() {
  const stats = {
    total_parceiros: Object.keys(parceirosAfiliados).length,
    categorias: {},
    destinos_especializados: Object.keys(especialistasPorDestino).length
  };
  
  // Contar por categoria
  Object.values(parceirosAfiliados).forEach(parceiro => {
    stats.categorias[parceiro.categoria] = (stats.categorias[parceiro.categoria] || 0) + 1;
  });
  
  return stats;
}

// ===== FUNÇÃO: ADICIONAR NOVO PARCEIRO =====
function adicionarParceiro(id, dadosParceiro) {
  parceirosAfiliados[id] = dadosParceiro;
  console.log(`✅ Novo parceiro adicionado: ${dadosParceiro.nome}`);
  return true;
}

// ===== EXPORTAÇÕES =====
export { 
  gerarLinksAfiliados,
  gerarLinksProtegidos,
  validarLinks,
  obterEstatisticasAfiliados,
  adicionarParceiro
};

// Para CommonJS (compatibilidade)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    gerarLinksAfiliados,
    gerarLinksProtegidos,
    validarLinks,
    obterEstatisticasAfiliados,
    adicionarParceiro
  };
}