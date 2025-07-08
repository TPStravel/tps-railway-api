// TPS-GPT Cultural Templates System
// Módulo de templates simbólicos multilíngues para respostas rituais
// Compatível com lang.js e sistema de fallback automático

const TPSCulturalTemplates = {
  
  // 🌟 Templates base organizados por tipo e idioma
  templates: {
    
    // 🎭 Template 1: Saudação inicial ao detectar desejo de viagem
    greeting: {
      pt: {
        icon: "🌟",
        opening: "Seu coração sussurrou um destino. Estou aqui para ouvi-lo.",
        continuation: "A alma viajante desperta quando sente o chamado. Para onde ela aponta hoje?"
      },
      ja: {
        icon: "🌸",
        opening: "あなたの心が旅路を囁いています。静寂の中で、その声に耳を傾けましょう。",
        continuation: "魂が求める道があります。どちらへ向かいたいとお感じですか？"
      },
      fr: {
        icon: "✨",
        opening: "Votre âme murmure une destination. Je suis là pour écouter ses secrets.",
        continuation: "L'esprit voyageur s'éveille quand il ressent l'appel de l'ailleurs. Vers où vous porte-t-il aujourd'hui?"
      },
      en: {
        icon: "🗽",
        opening: "Your spirit is calling for adventure. I'm here to help you answer that call.",
        continuation: "Every great journey begins with a whisper from within. Where is yours leading you today?"
      },
      ko: {
        icon: "🌙",
        opening: "마음속 깊은 곳에서 여행을 부르고 있습니다. 그 목소리를 함께 들어보겠습니다.",
        continuation: "영혼이 찾는 길이 있습니다. 오늘은 어디로 향하고 싶으신가요?"
      }
    },

    // ✈️ Template 2: Resposta com voos encontrados
    flightResults: {
      pt: {
        icon: "🌟",
        opening: "Eis os caminhos possíveis para sua jornada:",
        flightPrefix: "✈️",
        hotelPrefix: "🏛️",
        hotelLabel: "Hospedagem sugerida:",
        closing: "A travessia está revelada. Qual caminho chama sua alma?"
      },
      ja: {
        icon: "🌸",
        opening: "ご旅路への道筋が見えました：",
        flightPrefix: "✈️",
        hotelPrefix: "🏮",
        hotelLabel: "宿泊のご提案:",
        closing: "道は示されました。どちらがあなたの心に響きますか？"
      },
      fr: {
        icon: "✨",
        opening: "Voici les chemins qui s'ouvrent vers votre destination:",
        flightPrefix: "✈️",
        hotelPrefix: "🏛️",
        hotelLabel: "Hébergement suggéré:",
        closing: "Le destin vous propose ses routes. Laquelle résonne avec votre être?"
      },
      en: {
        icon: "🗽",
        opening: "Here are the paths to your adventure:",
        flightPrefix: "✈️",
        hotelPrefix: "🏨",
        hotelLabel: "Recommended stay:",
        closing: "Your journey awaits. Which path speaks to your heart?"
      },
      ko: {
        icon: "🌙",
        opening: "여행길로 향하는 길들이 보입니다：",
        flightPrefix: "✈️",
        hotelPrefix: "🏯",
        hotelLabel: "숙소 제안:",
        closing: "길이 열렸습니다. 어떤 길이 마음에 와 닿으시나요?"
      }
    },

    // 🔮 Template 3: Fallback simbólico (sem resultados)
    fallback: {
      pt: {
        icon: "🌫️",
        opening: "Ainda não enxergo claramente o seu destino.",
        explanation: "As névoas do tempo cobrem os caminhos, mas isso não significa que eles não existam. Poderia me contar com mais detalhes para onde sua alma deseja ir? Talvez uma data, uma cidade, ou mesmo apenas um sentimento?",
        suggestion: "✨ Enquanto isso, posso sugerir destinos que costumam chamar corações inquietos..."
      },
      ja: {
        icon: "🌫️",
        opening: "まだあなたの目的地がはっきりと見えません。",
        explanation: "霧が道筋を覆っていますが、道が存在しないわけではありません。もう少し詳しく教えていただけませんか？日付、都市、あるいはお気持ちだけでも構いません。",
        suggestion: "🌸 その間、落ち着かない心を呼ぶ場所をご提案できます..."
      },
      fr: {
        icon: "🌫️",
        opening: "Je ne distingue pas encore clairement votre destination.",
        explanation: "Les brumes du temps voilent les chemins, mais cela ne signifie pas qu'ils n'existent pas. Pourriez-vous me confier plus de détails sur l'endroit où votre âme souhaite aller? Peut-être une date, une ville, ou même simplement un sentiment?",
        suggestion: "✨ En attendant, je peux suggérer des destinations qui appellent les cœurs en quête..."
      },
      en: {
        icon: "🌫️",
        opening: "I can't quite see your destination clearly yet.",
        explanation: "The mists of possibility are still settling, but that doesn't mean your path isn't there. Could you share more details about where your spirit wants to go? Maybe a date, a city, or even just a feeling you're chasing?",
        suggestion: "🗽 Meanwhile, I can suggest destinations that call to restless hearts..."
      },
      ko: {
        icon: "🌫️",
        opening: "아직 목적지가 명확하게 보이지 않습니다.",
        explanation: "시간의 안개가 길을 가리고 있지만, 길이 없는 것은 아닙니다. 마음이 향하고자 하는 곳에 대해 좀 더 자세히 말씀해 주실 수 있나요? 날짜, 도시, 또는 단순한 감정이라도 괜찮습니다.",
        suggestion: "🌙 그동안 불안한 마음을 부르는 곳들을 제안해 드릴 수 있습니다..."
      }
    }
  },

  // 🎯 Função principal: Obter template por tipo e idioma
  getTemplate(type, lang = 'pt') {
    // Fallback para inglês se idioma não existir
    const fallbackLang = this.templates[type][lang] ? lang : 'en';
    const template = this.templates[type][fallbackLang];
    
    if (!template) {
      console.warn(`Template '${type}' não encontrado para idioma '${lang}'. Usando português como fallback.`);
      return this.templates[type]['pt'] || {};
    }
    
    return template;
  },

  // ✈️ Função especializada: Renderizar lista de voos com simbolismo
  renderFlights(flightArray, lang = 'pt', hotelSuggestion = null) {
    const template = this.getTemplate('flightResults', lang);
    
    let result = `${template.icon} ${template.opening}\n\n`;
    
    // Renderizar voos
    flightArray.forEach(flight => {
      const flightLine = `${template.flightPrefix} ${flight.airline} | ${flight.route} | ${flight.time} | ${flight.class} | [${flight.price}](${flight.link})`;
      result += flightLine + '\n';
    });
    
    // Adicionar hotel se fornecido
    if (hotelSuggestion) {
      result += `\n${template.hotelPrefix} ${template.hotelLabel} ${hotelSuggestion.name} – ${hotelSuggestion.price}\n`;
    }
    
    // Fechamento simbólico
    result += `\n${template.closing}`;
    
    return result;
  },

  // 🌫️ Função especializada: Resposta de fallback
  renderFallback(lang = 'pt') {
    const template = this.getTemplate('fallback', lang);
    
    return `${template.icon} ${template.opening}\n\n${template.explanation}\n\n${template.suggestion}`;
  },

  // 🌟 Função especializada: Saudação inicial
  renderGreeting(lang = 'pt') {
    const template = this.getTemplate('greeting', lang);
    
    return `${template.icon} ${template.opening}\n\n${template.continuation}`;
  },

  // 🔧 Função utilitária: Verificar idiomas disponíveis
  getAvailableLanguages() {
    return Object.keys(this.templates.greeting);
  },

  // 🎨 Função utilitária: Aplicar tom simbólico adicional
  applySymbolicTone(text, culturalContext = {}) {
    // Pode ser expandida no futuro para modificações tonais específicas
    // por cultura (ex: mais reverência no japonês, mais paixão no francês)
    return text;
  },

  // 🧪 Função de teste: Validar integridade dos templates
  validateTemplates() {
    const languages = this.getAvailableLanguages();
    const templateTypes = Object.keys(this.templates);
    
    const results = {
      valid: true,
      errors: [],
      languages,
      templateTypes
    };
    
    templateTypes.forEach(type => {
      languages.forEach(lang => {
        if (!this.templates[type][lang]) {
          results.valid = false;
          results.errors.push(`Template '${type}' ausente para idioma '${lang}'`);
        }
      });
    });
    
    return results;
  }
};

// 🌍 Exemplo de uso prático:
/*
// Saudação inicial
const greeting = TPSCulturalTemplates.renderGreeting('ko');

// Voos encontrados
const flights = [
  {
    airline: 'LATAM',
    route: 'GRU → CDG',
    time: '22:10 → 12:00',
    class: 'Executiva',
    price: 'USD 1.430',
    link: 'https://tp.media/r?marker=639764...'
  }
];
const hotel = { name: 'Hotel Alma Parisiense', price: 'USD 180/noite' };
const flightResults = TPSCulturalTemplates.renderFlights(flights, 'fr', hotel);

// Fallback
const fallback = TPSCulturalTemplates.renderFallback('ja');

// Validação
const validation = TPSCulturalTemplates.validateTemplates();
console.log('Templates válidos:', validation.valid);
*/

// Export para uso em módulos ou Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TPSCulturalTemplates;
}

// Disponibilizar globalmente no browser
if (typeof window !== 'undefined') {
  window.TPSCulturalTemplates = TPSCulturalTemplates;
}