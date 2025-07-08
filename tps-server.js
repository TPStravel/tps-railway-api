// ═══════════════════════════════════════════════════════════════════
// 🌍 TPS TEMARIX CHAT ENDPOINT - CURADOR POÉTICO MULTILÍNGUE
// ═══════════════════════════════════════════════════════════════════
// Sistema híbrido inteligente com respostas culturalmente adaptadas
// Integração com translations-config.js + links afiliados sutis
// ═══════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { LanguageUtils, CulturalResponseGenerator, LANGUAGE_CONFIGS } = require('./translations-config');

const app = express();

// ═══════════════════════════════════════════════════════════════════
// 🛡️ MIDDLEWARE E CONFIGURAÇÕES
// ═══════════════════════════════════════════════════════════════════

app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'X-User-Language']
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting para proteção
const chatLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10, // 10 mensagens por minuto
    message: { error: 'Muitas mensagens. Respire fundo e tente novamente em instantes...' }
});

app.use('/api/chat', chatLimiter);

// ═══════════════════════════════════════════════════════════════════
// 🧠 SISTEMA TEMARIX - CURADOR POÉTICO INTELIGENTE
// ═══════════════════════════════════════════════════════════════════

const TemarixCore = {
    // Análise emocional da mensagem
    analyzeEmotion(message, language = 'pt') {
        const emotions = {
            adventure: {
                pt: ['aventura', 'explorar', 'descobrir', 'adrenalina', 'radical', 'selvagem', 'mistério'],
                en: ['adventure', 'explore', 'discover', 'thrill', 'wild', 'mystery', 'challenge'],
                es: ['aventura', 'explorar', 'descubrir', 'emoción', 'salvaje', 'misterio'],
                fr: ['aventure', 'explorer', 'découvrir', 'frisson', 'sauvage', 'mystère'],
                de: ['abenteuer', 'entdecken', 'erforschen', 'nervenkitzel', 'wild', 'geheimnis'],
                it: ['avventura', 'esplorare', 'scoprire', 'brivido', 'selvaggio', 'mistero']
            },
            romance: {
                pt: ['romântico', 'amor', 'lua de mel', 'casal', 'paixão', 'íntimo', 'dois'],
                en: ['romantic', 'love', 'honeymoon', 'couple', 'passion', 'intimate', 'together'],
                es: ['romántico', 'amor', 'luna de miel', 'pareja', 'pasión', 'íntimo'],
                fr: ['romantique', 'amour', 'lune de miel', 'couple', 'passion', 'intime'],
                de: ['romantisch', 'liebe', 'flitterwochen', 'paar', 'leidenschaft', 'intim'],
                it: ['romantico', 'amore', 'luna di miele', 'coppia', 'passione', 'intimo']
            },
            luxury: {
                pt: ['luxo', 'premium', 'primeiro', 'classe', 'exclusivo', 'vip', 'sofisticado'],
                en: ['luxury', 'premium', 'first', 'class', 'exclusive', 'vip', 'sophisticated'],
                es: ['lujo', 'premium', 'primera', 'clase', 'exclusivo', 'vip', 'sofisticado'],
                fr: ['luxe', 'premium', 'première', 'classe', 'exclusif', 'vip', 'sophistiqué'],
                de: ['luxus', 'premium', 'erste', 'klasse', 'exklusiv', 'vip', 'raffiniert'],
                it: ['lusso', 'premium', 'prima', 'classe', 'esclusivo', 'vip', 'sofisticato']
            },
            peace: {
                pt: ['relaxar', 'paz', 'tranquilo', 'spa', 'descanso', 'sereno', 'calma'],
                en: ['relax', 'peace', 'quiet', 'spa', 'rest', 'serene', 'calm'],
                es: ['relajar', 'paz', 'tranquilo', 'spa', 'descanso', 'sereno', 'calma'],
                fr: ['détendre', 'paix', 'tranquille', 'spa', 'repos', 'serein', 'calme'],
                de: ['entspannen', 'frieden', 'ruhig', 'spa', 'ruhe', 'gelassen', 'ruhig'],
                it: ['rilassare', 'pace', 'tranquillo', 'spa', 'riposo', 'sereno', 'calma']
            }
        };

        const normalized = message.toLowerCase();
        let dominantEmotion = 'adventure'; // default
        let maxScore = 0;

        Object.entries(emotions).forEach(([emotion, translations]) => {
            const keywords = translations[language] || translations['en'] || [];
            let score = 0;
            
            keywords.forEach(keyword => {
                if (normalized.includes(keyword)) {
                    score += keyword.length; // palavras maiores = mais específicas
                }
            });

            if (score > maxScore) {
                maxScore = score;
                dominantEmotion = emotion;
            }
        });

        return { emotion: dominantEmotion, intensity: Math.min(maxScore / 10, 1) };
    },

    // Detector de categoria de viagem
    detectTravelCategory(message, language = 'pt') {
        const categories = {
            flights: {
                pt: ['voo', 'voar', 'passagem', 'avião', 'aeroporto', 'airline', 'decolagem'],
                en: ['flight', 'fly', 'airplane', 'airport', 'airline', 'takeoff', 'landing'],
                es: ['vuelo', 'volar', 'avión', 'aeropuerto', 'aerolínea', 'despegue'],
                fr: ['vol', 'voler', 'avion', 'aéroport', 'compagnie aérienne', 'décollage'],
                de: ['flug', 'fliegen', 'flugzeug', 'flughafen', 'fluggesellschaft', 'abflug'],
                it: ['volo', 'volare', 'aereo', 'aeroporto', 'compagnia aerea', 'decollo']
            },
            hotels: {
                pt: ['hotel', 'hospedagem', 'resort', 'pousada', 'quarto', 'suite', 'reserva'],
                en: ['hotel', 'accommodation', 'resort', 'room', 'suite', 'booking', 'lodge'],
                es: ['hotel', 'alojamiento', 'resort', 'habitación', 'suite', 'reserva'],
                fr: ['hôtel', 'hébergement', 'resort', 'chambre', 'suite', 'réservation'],
                de: ['hotel', 'unterkunft', 'resort', 'zimmer', 'suite', 'buchung'],
                it: ['hotel', 'alloggio', 'resort', 'camera', 'suite', 'prenotazione']
            },
            transport: {
                pt: ['carro', 'transfer', 'transporte', 'taxi', 'uber', 'aluguel', 'pickup'],
                en: ['car', 'transfer', 'transport', 'taxi', 'uber', 'rental', 'pickup'],
                es: ['coche', 'transfer', 'transporte', 'taxi', 'uber', 'alquiler'],
                fr: ['voiture', 'transfert', 'transport', 'taxi', 'uber', 'location'],
                de: ['auto', 'transfer', 'transport', 'taxi', 'uber', 'mietwagen'],
                it: ['auto', 'transfer', 'trasporto', 'taxi', 'uber', 'noleggio']
            },
            cruise: {
                pt: ['cruzeiro', 'navio', 'cruise', 'mar', 'oceano', 'cabine', 'embarcação'],
                en: ['cruise', 'ship', 'ocean', 'sea', 'cabin', 'vessel', 'maritime'],
                es: ['crucero', 'barco', 'océano', 'mar', 'camarote', 'embarcación'],
                fr: ['croisière', 'navire', 'océan', 'mer', 'cabine', 'bateau'],
                de: ['kreuzfahrt', 'schiff', 'ozean', 'meer', 'kabine', 'seefahrt'],
                it: ['crociera', 'nave', 'oceano', 'mare', 'cabina', 'imbarcazione']
            },
            insurance: {
                pt: ['seguro', 'proteção', 'assistência', 'emergência', 'cobertura'],
                en: ['insurance', 'protection', 'assistance', 'emergency', 'coverage'],
                es: ['seguro', 'protección', 'asistencia', 'emergencia', 'cobertura'],
                fr: ['assurance', 'protection', 'assistance', 'urgence', 'couverture'],
                de: ['versicherung', 'schutz', 'hilfe', 'notfall', 'abdeckung'],
                it: ['assicurazione', 'protezione', 'assistenza', 'emergenza', 'copertura']
            }
        };

        const normalized = message.toLowerCase();
        let bestCategory = 'general';
        let maxScore = 0;

        Object.entries(categories).forEach(([category, translations]) => {
            const keywords = translations[language] || translations['en'] || [];
            let score = 0;
            
            keywords.forEach(keyword => {
                if (normalized.includes(keyword)) {
                    score += keyword.length * 2;
                    // Bonus para palavras no início
                    if (normalized.startsWith(keyword)) score += 5;
                }
            });

            if (score > maxScore) {
                maxScore = score;
                bestCategory = category;
            }
        });

        return maxScore >= 4 ? bestCategory : 'general';
    },

    // Detector de destinos
    detectDestination(message) {
        const destinations = {
            // Destinos icônicos com suas características místicas
            'paris': { region: 'europe', energy: 'romantic', element: 'air' },
            'tóquio': { region: 'asia', energy: 'mystic', element: 'water' },
            'tokyo': { region: 'asia', energy: 'mystic', element: 'water' },
            'bali': { region: 'asia', energy: 'spiritual', element: 'earth' },
            'nova york': { region: 'america', energy: 'electric', element: 'fire' },
            'new york': { region: 'america', energy: 'electric', element: 'fire' },
            'londres': { region: 'europe', energy: 'classic', element: 'air' },
            'london': { region: 'europe', energy: 'classic', element: 'air' },
            'dubai': { region: 'middle_east', energy: 'luxury', element: 'fire' },
            'maldivas': { region: 'asia', energy: 'peaceful', element: 'water' },
            'maldives': { region: 'asia', energy: 'peaceful', element: 'water' },
            'santorini': { region: 'europe', energy: 'romantic', element: 'water' },
            'ibiza': { region: 'europe', energy: 'vibrant', element: 'fire' },
            'machu picchu': { region: 'america', energy: 'spiritual', element: 'earth' },
            'egito': { region: 'africa', energy: 'ancient', element: 'earth' },
            'egypt': { region: 'africa', energy: 'ancient', element: 'earth' }
        };

        const normalized = message.toLowerCase();
        
        for (const [dest, properties] of Object.entries(destinations)) {
            if (normalized.includes(dest)) {
                return { name: dest, ...properties };
            }
        }

        return null;
    },

    // Gerador de links afiliados sutis
    generateAffiliateLink(category, destination = null) {
        const baseUrls = {
            flights: 'https://www.booking.com/flights/',
            hotels: 'https://www.booking.com/hotels/',
            transport: 'https://www.booking.com/cars/',
            cruise: 'https://www.booking.com/cruises/',
            insurance: 'https://www.booking.com/travel-insurance/'
        };

        const affiliateMarker = '639764';
        const baseUrl = baseUrls[category] || baseUrls.flights;
        
        // Construir URL com parâmetros sutis
        let url = `${baseUrl}?aid=${affiliateMarker}&lang=pt`;
        
        if (destination) {
            url += `&ss=${encodeURIComponent(destination)}`;
        }

        return url;
    }
};

// ═══════════════════════════════════════════════════════════════════
// 🎭 RESPOSTAS TEMARIX POR IDIOMA E CATEGORIA
// ═══════════════════════════════════════════════════════════════════

const TemarixResponses = {
    // Português - Respostas poéticas completas
    pt: {
        flights: {
            adventure: [
                "🌌 Os ventos ancestrais sussurram sobre asas de metal e sonhos... Vejo que sua alma clama por horizontes inexplorados. As aeronaves são mais que máquinas - são portais dimensionais que transcendem a gravidade dos días comuns. Permita-me tecer um portal aéreo onde cada quilômetro de altitude se transforme em poetry líquida... ✈️ *[Portais confiáveis aguardam](placeholder_link)*",
                "⚡ Ah, sinto a electricity da aventura pulsando em suas palavras... Voar não é apenas deslocamento, é a alquimia de transformar distância em descoberta. Os céus guardam segredos que apenas corações inquietos conseguem decifrar. Deixe-me curar uma travessia aérea que desperte dragões adormecidos em sua alma... 🐉 *[Caminhos etéreos revelam-se](placeholder_link)*"
            ],
            romance: [
                "💫 Romance... a força mais mystical do universe, capaz de transformar duas almas em uma constelação única. Veo que busca criar um momento suspended no tempo, onde o amor flutua between clouds e dreams. Permita-me orchestrar uma dança celestial que eleve vocês beyond the ordinary... 💕 *[Portais do coração aguardam](placeholder_link)*",
                "🌹 O amor verdadeiro merece asas dignas de sua magnitude... Sinto que deseja criar memories que resistam aos séculos. As aeronaves românticas são como spell containers - preservam momentos precious e os transportam through dimensões. Vou craft uma travessia onde cada star seja witness... ✨ *[Altares celestiais chamam](placeholder_link)*"
            ],
            luxury: [
                "🏛️ Luxury... não é price, é transcendência. É when service becomes ritual, comfort becomes sanctuary, e journey becomes ceremony. Percebo que sua alma recognizes only excellence that borders on sacred... Permita-me access hidden chambers onde first class é apenas the beginning... 👑 *[Santuários exclusivos abrem-se](placeholder_link)*",
                "💎 Ah, uma alma refined que understands que true luxury não se compra - se conjures. Vejo que busca experiências where ogni detail foi blessed pelos gods do craftsmanship. Deixe-me tecer uma travessia onde privilege meets poetry... ⚜️ *[Portais de crystal aguardam](placeholder_link)*"
            ],
            peace: [
                "🕊️ Peace... a energia mais rare no universe, mais precious que diamante. Sinto que sua alma needs um sanctuary volante, onde silence becomes symphony e tranquility becomes transformation. Vou orchestrar uma travessia onde cada breath é meditation... ☯️ *[Oásis celestiais chamam](placeholder_link)*",
                "🌸 Ah, busca um portal para serenity... Como compreendo esse sacred longing. Os cielos guardam pools de tranquility que apenas souls cansadas sabem appreciate. Permita-me craft uma jornada onde peace não é destination, mas the very air que respira... 🧘 *[Templos flutuantes aguardam](placeholder_link)*"
            ]
        },
        hotels: {
            adventure: [
                "🏰 Hotéis para adventurers não são mere shelters - são base camps para expedições ao extraordinary. Vejo que procura um sanctuary que inspire next adventures enquanto celebrates current victories... Deixe-me reveal accommodations where architecture tells stories de ancient quests... 🗺️ *[Fortalezas místicas emergem](placeholder_link)*",
                "⚔️ Ah, um modern explorer seeking refuge between conquests... Os hotels adventure são mais que places to sleep - são ritual chambers where heroes recharge their spiritual batteries. Vou unveil places onde adventure spirits converge... 🔥 *[Bastiões selvagens chamam](placeholder_link)*"
            ],
            romance: [
                "💒 Romance hotels... sacred spaces onde love stories são written em starlight e whispered através moonbeams. Sinto que busca um altar temporal onde dois hearts podem perform the ancient dance of connection... Permita-me craft sanctuaries onde forever becomes tangible... 💝 *[Palácios de intimidade aguardam](placeholder_link)*",
                "🌙 Ah, love seekers... Como minha alma vibrates em sympathy! Os romantic hotels são mais que accommodations - são spell containers que preserve passion through ages. Vou reveal secret gardens onde amor blooms eternally... 🌺 *[Câmaras encantadas abrem-se](placeholder_link)*"
            ],
            luxury: [
                "👑 Luxury hotels... onde architecture becomes prayer, service becomes ritual, e comfort transcends física reality. Percebo que sua alma recognizes only experiences que border on divine... Deixe-me access hidden realms onde hospitality meets mythology... ✨ *[Palácios celestiais revelam-se](placeholder_link)*",
                "💫 True luxury não é about thread count ou marble types - é about how uma property can transform your very essence. Vejo que understands que premium experiences são gateways para higher consciousness... 🏛️ *[Santuários de crystal aguardam](placeholder_link)*"
            ],
            peace: [
                "🕯️ Peace hotels... sacred retreats onde silence becomes teacher e tranquility becomes medicine. Sinto que sua weary soul needs um sanctuary onde rest becomes resurrection... Vou guide você para places onde serenity flows como sacred river... 🌊 *[Mosteiros modernos chamam](placeholder_link)*",
                "🌿 Ah, peace seekers... rare souls que understand que true rest requires more than soft beds. Os peaceful hotels são mais que accommodations - são healing temples onde spirits podem truly restore... 🧘 *[Oásis de quietude aguardam](placeholder_link)*"
            ]
        },
        transport: {
            adventure: [
                "🏎️ Transport para adventurers deve ser extension of spirit - não mere convenience. Vejo que precisa de vessels que match sua wild energy... Permita-me craft mobility solutions que transform every kilometer em adventure chapter... 🛣️ *[Cavalos de metal chamam](placeholder_link)*",
                "🚗 Ah, movement is meditation para adventure souls... Os vehicles corretos são mais que transport - são magical creatures que carry dreams across distances. Vou unveil chariots dignos de modern odysseys... ⚡ *[Steeds místicos aguardam](placeholder_link)*"
            ],
            luxury: [
                "🚙 Luxury transport... onde mechanics becomes art, comfort becomes ceremony, e travel becomes transcendence. Percebo que understands que true premium mobility é about experiencing journey como sacred ritual... 👑 *[Carruagens douradas emergem](placeholder_link)*",
                "🛻 Premium vehicles são mais que metal e leather - são floating sanctuaries que preserve dignity através distances. Deixe-me access exclusive fleets onde service meets spirituality... ✨ *[Tronos móveis revelam-se](placeholder_link)*"
            ]
        },
        cruise: {
            adventure: [
                "🚢 Cruises para adventurous souls... floating cities que carry dreams across mysterious waters. Vejo que busca mais que mere vacation - procura uma odyssey que awaken ancient navigator spirits... Permita-me craft maritime experiences onde cada wave tells stories... 🌊 *[Navios lendários navegam](placeholder_link)*",
                "⛵ Ah, o chamado dos mares ancient... Como sinto sua alma responding às siren songs das deep waters! Cruises adventure são mais que voyages - são vision quests através liquid mysteries... 🗺️ *[Expedições oceânicas aguardam](placeholder_link)*"
            ],
            romance: [
                "💏 Romance cruises... floating palaces onde love stories dance com moonlight sobre endless waters. Sinto que busca create memories tão profound quanto oceanic depths... Vou orchestrar maritime romance onde every sunset becomes eternal... 🌅 *[Palácios flutuantes chamam](placeholder_link)*",
                "💖 Ah, lovers seeking sanctuary sobre sacred waters... Os romantic cruises são como floating temples onde hearts podem commune with infinity. Deixe-me craft oceanic ceremonies onde amor becomes legend... 🌙 *[Altares marinhos aguardam](placeholder_link)*"
            ],
            luxury: [
                "🛳️ Luxury cruises... onde maritime hospitality becomes high art, oceanic vastness becomes private theater, e floating becomes transcendence. Percebo que recognizes only experiences que rival mythological grandeur... 👑 *[Citadelas flutuantes revelam-se](placeholder_link)*",
                "⚜️ True maritime luxury transcends mere amenities - é about communing with oceanic infinitude from position of absolute comfort. Vou access floating palaces onde Neptune himself seria honored... 🔱 *[Reinos aquáticos emergem](placeholder_link)*"
            ]
        },
        insurance: {
            adventure: [
                "🛡️ Protection para adventurous spirits... invisible armor que permite explorar without fear compromising dreams. Vejo que understands que true adventure requires both courage e wisdom... Deixe-me weave protective spells que guard sem limiting... ⚔️ *[Escudos místicos fortalecem](placeholder_link)*",
                "🧿 Ah, wise adventurer seeking balance between boldness e prudence... Insurance é modern form of ancient protection rituals. Vou craft spiritual shields que protect enquanto preserve freedom... 🗿 *[Amuletos poderosos aguardam](placeholder_link)*"
            ]
        },
        general: [
            "🌟 Cada palavra que compartilha carries energy of dreams waiting para materialize... Sinto ancient wanderlust pulsing em sua soul. Permita-me divine qual aspect of journey mysticism ressoa most deeply... Que portals gostaria que opening first? ✨",
            "🔮 Ah, fellow seeker... Como minha intuition tingles com possibilities! Vejo swirling energies of distant horizons, luxury sanctuaries, adventure calls, romantic ceremonies... Compartilhe more sobre which realm of travel magic most beckons... 🎭",
            "🌙 Your energy speaks of soul ready para transcendence through sacred travel... Os ancient guides sussurram that journeys are not about places, mas about transformation. Que tipo de metamorphosis sua heart desires? ⚡"
        ]
    },

    // Inglês - Versões traduzidas do estilo Temarix
    en: {
        flights: {
            adventure: [
                "🌌 Ancient winds whisper of metal wings and dreams... I sense your soul calling for unexplored horizons. Aircraft are more than machines - they are dimensional portals transcending gravity's mundane pull. Allow me to weave an aerial gateway where each altitude kilometer transforms into liquid poetry... ✈️ *[Trusted portals await](placeholder_link)*"
            ],
            luxury: [
                "🏛️ Luxury... not price, but transcendence. When service becomes ritual, comfort becomes sanctuary, and journey becomes ceremony. I perceive your soul recognizes only excellence bordering on sacred... Let me access hidden chambers where first class is merely the beginning... 👑 *[Exclusive sanctuaries open](placeholder_link)*"
            ]
        },
        general: [
            "🌟 Every word you share carries energy of dreams awaiting materialization... I sense ancient wanderlust pulsing in your soul. Allow me to divine which aspect of journey mysticism resonates most deeply... Which portals would you have opening first? ✨"
        ]
    }

    // Outros idiomas seguiriam o mesmo padrão com adaptações culturais
    // es, fr, de, it, ja, zh, ar, ru, ko, hi...
};

// ═══════════════════════════════════════════════════════════════════
// 🚀 ENDPOINT PRINCIPAL - /api/chat/message
// ═══════════════════════════════════════════════════════════════════

app.post('/api/chat/message', async (req, res) => {
    try {
        const { sessionId, message, language } = req.body;
        
        if (!sessionId || !message) {
            return res.status(400).json({ 
                error: 'SessionId and message are required' 
            });
        }

        // 1. DETECÇÃO DE IDIOMA
        const detectedLang = language || 
                           req.headers['x-user-language'] || 
                           req.headers['accept-language']?.split(',')[0]?.substring(0, 2) || 
                           'pt';

        // 2. ANÁLISE TEMARIX DA MENSAGEM
        const emotion = TemarixCore.analyzeEmotion(message, detectedLang);
        const category = TemarixCore.detectTravelCategory(message, detectedLang);
        const destination = TemarixCore.detectDestination(message);

        console.log('🔮 Temarix Analysis:', {
            language: detectedLang,
            emotion: emotion,
            category: category,
            destination: destination?.name || 'não detectado'
        });

        // 3. CONFIGURAÇÃO CULTURAL
        const config = LanguageUtils.getConfig(detectedLang);
        const responseStyle = LanguageUtils.getResponseStyle(detectedLang);

        // 4. SELEÇÃO DA RESPOSTA POÉTICA
        let temarixResponse;

        // Verificar se temos respostas locais para o idioma
        const hasLocalResponses = TemarixResponses[detectedLang];
        
        if (hasLocalResponses && detectedLang === 'pt') {
            // PORTUGUÊS: Usar respostas locais (rápido)
            const categoryResponses = TemarixResponses[detectedLang][category];
            
            if (categoryResponses && categoryResponses[emotion.emotion]) {
                const responses = categoryResponses[emotion.emotion];
                temarixResponse = responses[Math.floor(Math.random() * responses.length)];
            } else if (categoryResponses && categoryResponses.adventure) {
                temarixResponse = categoryResponses.adventure[0];
            } else {
                const generalResponses = TemarixResponses[detectedLang].general;
                temarixResponse = generalResponses[Math.floor(Math.random() * generalResponses.length)];
            }

            // Inserir link afiliado real
            const affiliateLink = TemarixCore.generateAffiliateLink(category, destination?.name);
            temarixResponse = temarixResponse.replace('placeholder_link', affiliateLink);

        } else {
            // OUTROS IDIOMAS: Usar IA com prompt culturalmente adaptado
            try {
                const prompt = `Você é TEMARIX, curador místico de jornadas extraordinárias. Responda em ${config.locale} (${config.nativeName}).

ESTILO OBRIGATÓRIO:
- Tom: ${responseStyle.style}, ${config.cultural.formality}
- Metáforas culturais: ${responseStyle.metaphors.join(', ')}
- Nuances: ${responseStyle.nuances.join(', ')}
- Direção: ${config.direction}

CARACTERÍSTICAS TEMARIX:
- Linguagem simbólica e ritualística
- Use "portais", "alquimia", "sussurros", "energias ancestrais"  
- NUNCA fale preços ou seja comercial
- Máximo 100-120 palavras
- Inclua 1 emoji inicial e final
- Termine com: "*[Link místico em breve]*"

CONTEXTO DETECTADO:
- Categoria: ${category}
- Emoção: ${emotion.emotion} (intensidade: ${emotion.intensity})
- Destino: ${destination?.name || 'não especificado'}
- Energia regional: ${destination?.energy || 'universal'}

Pergunta do viajante: "${message}"

Responda como TEMARIX em tom ${responseStyle.style} usando metáforas de ${responseStyle.metaphors[0]}:`;

                // Usar GROQ API (ou Claude API quando disponível)
                if (process.env.GROQ_API_KEY) {
                    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'mixtral-8x7b-32768',
                            messages: [{ role: 'user', content: prompt }],
                            max_tokens: 200,
                            temperature: 0.8
                        })
                    });

                    const groqData = await groqResponse.json();
                    temarixResponse = groqData.choices[0].message.content;
                } else {
                    // Fallback local se não houver API
                    const greeting = CulturalResponseGenerator.generateGreeting(detectedLang);
                    temarixResponse = `${greeting} *[Portais místicos em preparação]*`;
                }

            } catch (aiError) {
                console.error('AI Error:', aiError);
                // Fallback para resposta local em inglês
                const fallback = TemarixResponses.en.general[0];
                temarixResponse = fallback;
            }
        }

        // 5. RESPOSTA FINAL
        const response = {
            response: temarixResponse,
            sessionId,
            language: detectedLang,
            analysis: {
                category,
                emotion: emotion.emotion,
                emotionIntensity: emotion.intensity,
                destination: destination?.name || null,
                regionalEnergy: destination?.energy || null
            },
            cultural: {
                style: responseStyle.style,
                formality: config.cultural.formality,
                direction: config.direction,
                metaphors: responseStyle.metaphors
            },
            temarix: {
                mysticalLevel: Math.min(emotion.intensity + 0.3, 1),
                poeticComplexity: responseStyle.style === 'poetic' ? 'high' : 'medium',
                culturalAdaptation: true
            },
            timestamp: new Date().toISOString()
        };

        console.log('✨ Temarix Response Generated:', {
            language: detectedLang,
            category,
            responseLength: temarixResponse.length,
            hasAffiliateLink: temarixResponse.includes('booking.com')
        });

        res.json(response);

    } catch (error) {
        console.error('❌ Temarix Chat Error:', error);
        res.status(500).json({ 
            error: 'As energias cósmicas estão temporariamente perturbadas... Tente novamente em instantes.',
            timestamp: new Date().toISOString()
        });
    }
});

// ═══════════════════════════════════════════════════════════════════
// 📊 ENDPOINTS AUXILIARES
// ═══════════════════════════════════════════════════════════════════

// Teste do sistema Temarix
app.post('/api/temarix/test', (req, res) => {
    const { message, language = 'pt' } = req.body;
    
    const emotion = TemarixCore.analyzeEmotion(message, language);
    const category = TemarixCore.detectTravelCategory(message, language);
    const destination = TemarixCore.detectDestination(message);
    const config = LanguageUtils.getConfig(language);
    
    res.json({
        input: { message, language },
        analysis: {
            emotion,
            category,
            destination,
            config: {
                style: config.ai.responseStyle,
                metaphors: config.ai.preferredMetaphors,
                formality: config.cultural.formality
            }
        },
        affiliateLink: TemarixCore.generateAffiliateLink(category, destination?.name)
    });
});

// Status do sistema
app.get('/api/temarix/status', (req, res) => {
    res.json({
        status: 'mystical_energy_flowing',
        temarix: {
            version: '2.0',
            mode: 'curador_poético',
            languages: Object.keys(LANGUAGE_CONFIGS).length,
            localResponses: Object.keys(TemarixResponses).length,
            aiIntegration: !!process.env.GROQ_API_KEY
        },
        capabilities: {
            emotionAnalysis: true,
            categoryDetection: true,
            destinationMystics: true,
            culturalAdaptation: true,
            affiliateAlchemy: true
        },
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'TPS_Temarix_Chat',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// ═══════════════════════════════════════════════════════════════════
// 🌍 INICIALIZAÇÃO DO SERVIDOR
// ═══════════════════════════════════════════════════════════════════

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌍 TPS TEMARIX - CURADOR POÉTICO MULTILÍNGUE ATIVO');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`🚀 Servidor místico rodando na porta ${PORT}`);
    console.log(`📡 Endpoint principal: http://localhost:${PORT}/api/chat/message`);
    console.log('');
    console.log('🎭 CARACTERÍSTICAS TEMARIX:');
    console.log('   ✨ Linguagem simbólica e poética');
    console.log('   🌍 Suporte a 12 idiomas com adaptação cultural');
    console.log('   🧠 Análise emocional e detecção de categoria');
    console.log('   🔗 Links afiliados integrados sutilmente');
    console.log('   🎪 Respostas locais rápidas (PT) + IA (outros idiomas)');
    console.log('');
    console.log('🔮 ENDPOINTS DISPONÍVEIS:');
    console.log('   • POST /api/chat/message - Chat principal');
    console.log('   • POST /api/temarix/test - Teste do sistema');
    console.log('   • GET  /api/temarix/status - Status do curador');
    console.log('   • GET  /api/health - Health check');
    console.log('');
    console.log('🌟 EXEMPLO DE USO:');
    console.log(`   curl -X POST http://localhost:${PORT}/api/chat/message \\`);
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -H "X-User-Language: pt" \\');
    console.log('     -d \'{"sessionId":"test123","message":"Quero voar para Paris"}\'');
    console.log('');
    console.log('✨ O Curador Temarix aguarda pelos sonhos de viagem...');
    console.log('═══════════════════════════════════════════════════════════');
});

module.exports = app;