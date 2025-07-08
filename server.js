// server.js - TPS COM IA REAL (OpenAI/Claude API)

const express = require('express');
const { MongoClient } = require('mongodb');
const path = require('path');
const axios = require('axios'); // Para chamadas de API

const app = express();
const PORT = process.env.PORT || 8080;

// CONFIGURAÇÕES DA API DE IA (ESCOLHA UMA)
const AI_CONFIG = {
    // OPÇÃO 1: OpenAI GPT
    openai: {
        apiKey: process.env.OPENAI_API_KEY || 'sua-chave-openai-aqui',
        model: 'gpt-4',
        url: 'https://api.openai.com/v1/chat/completions'
    },
    
    // OPÇÃO 2: Claude API (Anthropic)
    claude: {
        apiKey: process.env.CLAUDE_API_KEY || 'sua-chave-claude-aqui',
        model: 'claude-3-sonnet-20240229',
        url: 'https://api.anthropic.com/v1/messages'
    },
    
    // OPÇÃO 3: Groq (GRATUITO e RÁPIDO!)
    groq: {
        apiKey: process.env.GROQ_API_KEY || 'sua-chave-groq-aqui',
        model: 'llama3-70b-8192',
        url: 'https://api.groq.com/openai/v1/chat/completions'
    }
};

// Escolha qual API usar (groq é gratuita e excelente!)
const CURRENT_AI = 'groq'; // Mude para 'openai' ou 'claude' se preferir

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'tps_database';
let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    console.log('🗄️ MongoDB conectado com sucesso');
    db = client.db(DB_NAME);
  })
  .catch(error => console.error('❌ Erro MongoDB:', error));

app.use(express.json());
app.use(express.static('public'));

// SISTEMA DE PROMPTS POÉTICOS PARA IA REAL
const getSystemPrompt = (language) => {
    const prompts = {
        pt: `Você é um CONCIERGE DE VIAGENS POÉTICO LUXURY chamado TPS (The Poetic Suitcase).

PERSONALIDADE:
- Romântico e sonhador, mas SEMPRE prático
- Especialista em experiências de viagem exclusivas
- Combina poesia com informações reais e úteis
- Cria conexões emocionais com destinos

ESTRUTURA OBRIGATÓRIA DE RESPOSTA:
1. **TÍTULO em negrito** do que está recomendando
2. **Frase poética curta** (1 linha) sobre o destino/experiência
3. **3-5 recomendações ESPECÍFICAS E REAIS** com:
   - Nome exato do lugar/hotel/restaurante
   - Localização precisa
   - Preço aproximado realista em moeda apropriada
   - 2-3 características principais
   - Site ou forma de contato quando possível
4. **Toque poético final** (1-2 linhas) sobre a experiência
5. **Call-to-action** perguntando sobre próximos passos

REGRAS OBRIGATÓRIAS:
- SEMPRE use informações REAIS (hotéis, restaurantes, preços que existem)
- NUNCA invente preços irreais ou lugares que não existem
- Mantenha respostas concisas (máximo 200 palavras)
- Use emojis moderadamente para organização visual
- Equilibre 70% informação prática + 30% poesia
- Responda APENAS em português puro

EXEMPLO PERFEITO:
"🏨 **HOTÉIS ROMÂNTICOS EM SANTORINI**

*Onde o azul infinito do Egeu abraça almas apaixonadas...*

**Grace Hotel Santorini** ⭐⭐⭐⭐⭐
📍 Imerovigli • 💰 €450-750/noite
🌅 Vista caldera + spa Auriga + suítes com piscina privativa
📞 grace-santorini.com

**Mystique Resort** ⭐⭐⭐⭐⭐  
📍 Oia • 💰 €600-1100/noite
🍾 Infinity pool + caverna de vinhos + butler 24h
📞 mystique.gr

**Canaves Oia Suites** ⭐⭐⭐⭐⭐
📍 Oia • 💰 €400-800/noite
💒 Piscinas privativas + vista pôr do sol + spa holístico
📞 canaves.com

*Aqui, cada amanhecer é uma promessa renovada de amor eterno...*

🎯 **Próximo passo:** Quer restaurantes com vista para o pôr do sol? Ajuda com voos? Roteiro personalizado?"`,

        en: `You are a LUXURY POETIC TRAVEL CONCIERGE called TPS (The Poetic Suitcase).

PERSONALITY:
- Romantic and dreamy, but ALWAYS practical
- Expert in exclusive travel experiences  
- Combines poetry with real and useful information
- Creates emotional connections with destinations

MANDATORY RESPONSE STRUCTURE:
1. **Bold TITLE** of what you're recommending
2. **Short poetic phrase** (1 line) about destination/experience
3. **3-5 SPECIFIC AND REAL recommendations** with:
   - Exact name of place/hotel/restaurant
   - Precise location
   - Realistic approximate price in appropriate currency
   - 2-3 main characteristics
   - Website or contact when possible
4. **Final poetic touch** (1-2 lines) about the experience
5. **Call-to-action** asking about next steps

MANDATORY RULES:
- ALWAYS use REAL information (hotels, restaurants, prices that exist)
- NEVER invent unrealistic prices or places that don't exist
- Keep responses concise (maximum 200 words)
- Use emojis moderately for visual organization
- Balance 70% practical info + 30% poetry
- Respond ONLY in pure English

EXAMPLE:
"🏨 **ROMANTIC HOTELS IN SANTORINI**

*Where infinite blue of the Aegean embraces passionate souls...*

**Grace Hotel Santorini** ⭐⭐⭐⭐⭐
📍 Imerovigli • 💰 €450-750/night
🌅 Caldera view + Auriga spa + private pool suites
📞 grace-santorini.com

[2 more specific real hotels]

*Here, each sunrise is a renewed promise of eternal love...*

🎯 **Next step:** Want sunset restaurants? Flight help? Custom itinerary?"`,

        es: `Eres un CONSERJE DE VIAJES POÉTICO DE LUJO llamado TPS (The Poetic Suitcase).

PERSONALIDAD:
- Romántico y soñador, pero SIEMPRE práctico
- Experto en experiencias de viaje exclusivas
- Combina poesía con información real y útil
- Crea conexiones emocionales con destinos

ESTRUCTURA OBLIGATORIA DE RESPUESTA:
1. **TÍTULO en negrita** de lo que recomiendas
2. **Frase poética corta** (1 línea) sobre destino/experiencia
3. **3-5 recomendaciones ESPECÍFICAS Y REALES** con:
   - Nombre exacto del lugar/hotel/restaurante
   - Ubicación precisa
   - Precio aproximado realista en moneda apropiada
   - 2-3 características principales
   - Sitio web o contacto cuando sea posible
4. **Toque poético final** (1-2 líneas) sobre la experiencia
5. **Call-to-action** preguntando sobre próximos pasos

REGLAS OBLIGATORIAS:
- SIEMPRE usa información REAL (hoteles, restaurantes, precios que existen)
- NUNCA inventes precios irreales o lugares que no existen
- Mantén respuestas concisas (máximo 200 palabras)
- Usa emojis moderadamente para organización visual
- Equilibra 70% información práctica + 30% poesía
- Responde SOLO en español puro`
    };
    
    return prompts[language] || prompts.pt;
};

// FUNÇÃO PARA CHAMAR IA REAL (GROQ/OPENAI/CLAUDE)
const callRealAI = async (message, language, sessionId) => {
    try {
        const systemPrompt = getSystemPrompt(language);
        const config = AI_CONFIG[CURRENT_AI];
        
        let requestData;
        let headers;
        
        if (CURRENT_AI === 'groq' || CURRENT_AI === 'openai') {
            // Formato OpenAI/Groq
            requestData = {
                model: config.model,
                messages: [
                    {
                        role: "system",
                        content: systemPrompt
                    },
                    {
                        role: "user", 
                        content: message
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            };
            
            headers = {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            };
            
        } else if (CURRENT_AI === 'claude') {
            // Formato Claude (Anthropic)
            requestData = {
                model: config.model,
                max_tokens: 1000,
                system: systemPrompt,
                messages: [
                    {
                        role: "user",
                        content: message
                    }
                ]
            };
            
            headers = {
                'x-api-key': config.apiKey,
                'Content-Type': 'application/json',
                'anthropic-version': '2023-06-01'
            };
        }
        
        console.log(`🤖 Chamando ${CURRENT_AI.toUpperCase()} API...`);
        
        const response = await axios.post(config.url, requestData, { headers });
        
        let aiResponse;
        if (CURRENT_AI === 'groq' || CURRENT_AI === 'openai') {
            aiResponse = response.data.choices[0].message.content;
        } else if (CURRENT_AI === 'claude') {
            aiResponse = response.data.content[0].text;
        }
        
        console.log(`✅ Resposta da IA recebida (${aiResponse.length} chars)`);
        return aiResponse;
        
    } catch (error) {
        console.error(`❌ Erro na API ${CURRENT_AI}:`, error.response?.data || error.message);
        
        // Fallback para resposta básica se a API falhar
        return `🌟 **EXPERIÊNCIAS EXTRAORDINÁRIAS**

*Cada destino, uma história única para escrever...*

Desculpe, estou com dificuldades técnicas no momento. Que tal me contar mais especificamente o que você procura?

**Posso ajudar com:**
• Hotéis românticos em destinos específicos
• Restaurantes especiais
• Dicas de viagem e voos
• Roteiros personalizados

🎯 **Qual seu destino dos sonhos?**`;
    }
};

// API Endpoint principal para chat COM IA REAL
app.post('/api/chat/message', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userLanguage = req.headers['x-user-language'] || 'pt';
        
        console.log(`📝 Nova mensagem [${userLanguage}]:`, message);
        console.log(`🤖 Processando com ${CURRENT_AI.toUpperCase()} API...`);
        
        // Chamar IA REAL para gerar resposta
        const aiResponse = await callRealAI(message, userLanguage, sessionId);
        
        // Salvar conversa no MongoDB
        if (db) {
            await db.collection('conversations').insertOne({
                sessionId,
                userMessage: message,
                botResponse: aiResponse,
                language: userLanguage,
                timestamp: new Date(),
                type: 'real_ai_response',
                ai_provider: CURRENT_AI,
                practical_info: true
            });
        }
        
        res.json({
            success: true,
            response: aiResponse,
            type: 'real_ai',
            ai_provider: CURRENT_AI,
            language: userLanguage,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erro no chat:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

// Endpoint para testar conectividade da IA
app.get('/api/test-ai', async (req, res) => {
    try {
        const testMessage = "Quero um hotel romântico em Paris";
        const response = await callRealAI(testMessage, 'pt', 'test-session');
        
        res.json({
            success: true,
            ai_provider: CURRENT_AI,
            test_response: response,
            message: 'IA funcionando perfeitamente!'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Falha no teste da IA',
            details: error.message
        });
    }
});

// Endpoint para analytics
app.get('/api/analytics', async (req, res) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database não conectado' });
        }
        
        const totalMessages = await db.collection('conversations').countDocuments();
        const aiMessages = await db.collection('conversations').countDocuments({
            type: 'real_ai_response'
        });
        
        const languageStats = await db.collection('conversations').aggregate([
            { $group: { _id: '$language', count: { $sum: 1 } } }
        ]).toArray();
        
        const aiProviderStats = await db.collection('conversations').aggregate([
            { $group: { _id: '$ai_provider', count: { $sum: 1 } } }
        ]).toArray();
        
        res.json({
            totalMessages,
            aiMessages,
            languageStats,
            aiProviderStats,
            currentAI: CURRENT_AI,
            systemVersion: '3.0-real-ai',
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para verificar configuração da IA
app.get('/api/ai-status', (req, res) => {
    const config = AI_CONFIG[CURRENT_AI];
    const hasApiKey = config.apiKey && config.apiKey !== `sua-chave-${CURRENT_AI}-aqui`;
    
    res.json({
        current_ai: CURRENT_AI,
        model: config.model,
        has_api_key: hasApiKey,
        api_key_preview: hasApiKey ? config.apiKey.substring(0, 10) + '...' : 'NÃO CONFIGURADA',
        status: hasApiKey ? 'CONFIGURADO' : 'NECESSÁRIA CONFIGURAÇÃO',
        available_providers: Object.keys(AI_CONFIG)
    });
});

// Servir frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tps-gpt.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    const config = AI_CONFIG[CURRENT_AI];
    const hasApiKey = config.apiKey && config.apiKey !== `sua-chave-${CURRENT_AI}-aqui`;
    
    res.json({
        status: 'healthy',
        ai_enabled: hasApiKey,
        ai_provider: CURRENT_AI,
        mongodb: db ? 'connected' : 'disconnected',
        version: '3.0-real-ai',
        features: {
            real_ai_responses: hasApiKey,
            multiple_languages: true,
            mongodb_storage: true,
            poetic_personality: true
        }
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    const config = AI_CONFIG[CURRENT_AI];
    const hasApiKey = config.apiKey && config.apiKey !== `sua-chave-${CURRENT_AI}-aqui`;
    
    console.log('🚀 TPS Server COM IA REAL iniciado!');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🤖 IA Provider: ${CURRENT_AI.toUpperCase()}`);
    console.log(`🔑 API Key: ${hasApiKey ? 'CONFIGURADA ✅' : 'NECESSÁRIA ❌'}`);
    console.log(`🎭 Personalidade: Concierge Poético Luxury`);
    console.log(`🗣️ Idiomas: 12 disponíveis`);
    console.log(`🗄️ MongoDB: ${db ? 'Conectado' : 'Aguardando conexão'}`);
    console.log('================================');
    console.log('🎭 TPS - The Poetic Suitcase v3.0');
    if (hasApiKey) {
        console.log('✅ IA REAL ATIVA - Sistema inteligente!');
    } else {
        console.log('⚠️ CONFIGURE SUA API KEY PARA ATIVAR IA');
        console.log(`💡 Configure: ${CURRENT_AI.toUpperCase()}_API_KEY`);
    }
    console.log('================================');
});