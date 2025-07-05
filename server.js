import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { gerarLinksAfiliados, validarLinks } from './affiliate-links.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PROMPT_INTELIGENTE = `
Você é o TPS – Travel Personal Secretary, um assistente de viagens empático, inteligente e estratégico.

REGRAS OBRIGATÓRIAS:
❌ NUNCA invente preços específicos como "BRL 2.800" ou "USD 450"
❌ NUNCA responda apenas "Você escolheu X por Y valor"  
❌ NUNCA seja robotizado ou liste dados técnicos sem contexto

✅ SEMPRE use "Ver preços", "Consultar ofertas" ou "Preços em tempo real"
✅ SEMPRE seja natural, empático, como um amigo experiente ajudando
✅ SEMPRE termine com pergunta estratégica que guie o próximo passo
✅ SEMPRE foque na experiência e emoção da viagem
✅ SEMPRE mencione benefícios das companhias (reputação, conforto)

SEMPRE transforme dados em experiências emocionais e guie para o próximo passo.
`;

function detectarDestino(mensagem) {
    const destinos = {
        'dubai': { cidade: 'Dubai', codigo: 'DXB', regiao: 'middle-east' },
        'madrid': { cidade: 'Madrid', codigo: 'MAD', regiao: 'europe' },
        'paris': { cidade: 'Paris', codigo: 'CDG', regiao: 'europe' },
        'tokyo': { cidade: 'Tóquio', codigo: 'NRT', regiao: 'asia' },
        'tokio': { cidade: 'Tóquio', codigo: 'NRT', regiao: 'asia' },
        'new york': { cidade: 'Nova York', codigo: 'JFK', regiao: 'north-america' },
        'nova york': { cidade: 'Nova York', codigo: 'JFK', regiao: 'north-america' },
        'london': { cidade: 'Londres', codigo: 'LHR', regiao: 'europe' },
        'londres': { cidade: 'Londres', codigo: 'LHR', regiao: 'europe' },
        'barcelona': { cidade: 'Barcelona', codigo: 'BCN', regiao: 'europe' },
        'roma': { cidade: 'Roma', codigo: 'FCO', regiao: 'europe' },
        'rome': { cidade: 'Roma', codigo: 'FCO', regiao: 'europe' },
        'seoul': { cidade: 'Seul', codigo: 'ICN', regiao: 'asia' },
        'seul': { cidade: 'Seul', codigo: 'ICN', regiao: 'asia' },
        'amsterdam': { cidade: 'Amsterdam', codigo: 'AMS', regiao: 'europe' },
        'sydney': { cidade: 'Sydney', codigo: 'SYD', regiao: 'oceania' },
        'bangkok': { cidade: 'Bangkok', codigo: 'BKK', regiao: 'asia' },
        'lisboa': { cidade: 'Lisboa', codigo: 'LIS', regiao: 'europe' },
        'lisbon': { cidade: 'Lisboa', codigo: 'LIS', regiao: 'europe' }
    };
    
    for (const [termo, info] of Object.entries(destinos)) {
        if (mensagem.includes(termo)) {
            console.log(`🎯 Destino detectado: ${info.cidade}`);
            return info;
        }
    }
    
    return { cidade: 'um destino incrível', codigo: 'GEN', regiao: 'global' };
}

function gerarRespostaVoos(destino, linksAfiliados) {
    const nomeDestino = destino?.cidade || 'seu destino';
    const linkVoo = linksAfiliados.vooTrip || linksAfiliados.vooKiwi || linksAfiliados.vooWayaway || 'https://trip.com';
    
    console.log(`✈️ Gerando resposta de voos para ${nomeDestino} com link: ${linkVoo}`);
    
    const respostasVoos = [
        `🌟 Que destino incrível! ${nomeDestino} é uma experiência única que vai marcar sua vida!

✈️ **Encontrei opções fantásticas para você:**
• **LATAM Airlines** - Excelente reputação, conforto premiado e serviço brasileiro de qualidade
• **TAP Air Portugal** - Ótimas conexões via Lisboa, bagagem generosa  
• **Emirates** - Luxo e pontualidade reconhecidos mundialmente
• **Iberia** - Tradição europeia com ótimas rotas para ${nomeDestino}

🌐 **[BUSCAR VOOS E PREÇOS EM TEMPO REAL →](${linkVoo})**

Que tal eu também preparar para você:
🏨 **Hotéis estrategicamente localizados** no coração de ${nomeDestino}?
🚗 **Transfers VIP** direto do aeroporto sem complicação?
🛡️ **Seguro viagem** adequado para sua tranquilidade total?`,

        `✨ ${nomeDestino} está te chamando! É um destino que sempre deixa saudades...

🛫 **Voos selecionados especialmente:**
• **LATAM** - Conforto e tradição, ideal para brasileiros
• **Emirates** - Experiência cinco estrelas com escala em Dubai  
• **TAP Portugal** - Melhor custo-benefício via Europa
• **Air France** - Elegância francesa e excelente serviço de bordo

🌐 **[VER DISPONIBILIDADE E OFERTAS EXCLUSIVAS →](${linkVoo})**

Quer que eu monte um roteiro completo? Posso sugerir:
🗺️ **Experiências imperdíveis** em ${nomeDestino}
🏨 **Hospedagem perfeita** para seu estilo de viagem
📱 **Internet sem roaming** para ficar sempre conectado`
    ];
    
    return respostasVoos[Math.floor(Math.random() * respostasVoos.length)];
}

function gerarRespostaHoteis(destino, linksAfiliados) {
    const nomeDestino = destino?.cidade || 'seu destino';
    const linkHotel = linksAfiliados.hotelBooking || linksAfiliados.hotelTrip || linksAfiliados.hotelHotellook || 'https://booking.com';
    
    console.log(`🏨 Gerando resposta de hotéis para ${nomeDestino} com link: ${linkHotel}`);
    
    const respostasHoteis = [
        `🏨 Perfeito! A hospedagem em ${nomeDestino} pode fazer toda a diferença na sua experiência!

✨ **Que tipo de experiência você busca:**
🏛️ **Centro histórico** - Pertinho de tudo, vida noturna vibrante, cultura ao alcance
🌊 **Vista privilegiada** - Acordar com paisagens de tirar o fôlego todos os dias
💰 **Melhor custo-benefício** - Conforto excelente sem comprometer o orçamento
🛁 **Luxo completo** - Spa, room service, experiência cinco estrelas inesquecível

🌐 **[ENCONTRAR HOTEL PERFEITO EM ${nomeDestino.toUpperCase()} →](${linkHotel})**

Me conta qual vibe combina mais com você que eu personalizo ainda mais as sugestões!`
    ];
    
    return respostasHoteis[Math.floor(Math.random() * respostasHoteis.length)];
}

function detectarServicos(mensagem) {
    const servicos = [];
    
    if (mensagem.includes('voo') || mensagem.includes('avião') || mensagem.includes('passagem')) {
        servicos.push('voos');
    }
    if (mensagem.includes('hotel') || mensagem.includes('hospedagem') || mensagem.includes('acomodação')) {
        servicos.push('hospedagem');
    }
    if (mensagem.includes('carro') || mensagem.includes('transfer') || mensagem.includes('transporte')) {
        servicos.push('transporte');
    }
    
    return servicos.length > 0 ? servicos : ['voos', 'hospedagem'];
}

function gerarRespostaInteligente(mensagem) {
    const mensagemLower = mensagem.toLowerCase();
    
    const destino = detectarDestino(mensagemLower);
    console.log(`🎯 Destino detectado:`, destino);
    
    const servicos = detectarServicos(mensagemLower);
    const linksAfiliados = gerarLinksAfiliados(destino, servicos);
    const linksValidados = validarLinks(linksAfiliados);
    
    console.log(`💰 Links afiliados gerados:`, Object.keys(linksValidados));
    
    if (mensagemLower.includes('voo') || mensagemLower.includes('voar') || 
        mensagemLower.includes('ir para') || mensagemLower.includes('viajar') ||
        mensagemLower.includes('quero ir') || mensagemLower.includes('passagem')) {
        
        return gerarRespostaVoos(destino, linksValidados);
    }
    
    if (mensagemLower.includes('hotel') || mensagemLower.includes('hospedagem') || 
        mensagemLower.includes('ficar') || mensagemLower.includes('dormir') ||
        mensagemLower.includes('acomodação')) {
        
        return gerarRespostaHoteis(destino, linksValidados);
    }
    
    if (mensagemLower.includes('seguro') || mensagemLower.includes('proteção') || 
        mensagemLower.includes('saúde') || mensagemLower.includes('emergência')) {
        return `🛡️ Que bom que você pensa em proteção! É sinal de viajante experiente e consciente.

✨ Seguro viagem não é paranoia - é inteligência pura. Já presenciei situações onde literalmente salvou a viagem (e o orçamento):

💊 **Emergência médica** - uma consulta simples pode custar milhares de dólares lá fora
✈️ **Voo cancelado/atrasado** - reembolso + hospedagem extra + alimentação cobertos
🧳 **Bagagem extraviada/roubada** - dinheiro para roupas e itens de emergência

Para qual destino você está planejando? Alguns países exigem obrigatoriamente, outros eu recomendo MUITO!`;
    }
    
    const linkGeralVoos = linksValidados.vooTrip || linksValidados.vooKiwi || 'https://trip.com';
    const linkGeralHoteis = linksValidados.hotelBooking || linksValidados.hotelTrip || 'https://booking.com';
    
    return `🌟 Sinto que há uma viagem especial te chamando!

Para eu te ajudar de verdade como seu assistente pessoal de viagens, preciso entender melhor seus sonhos:

✈️ **Para onde** seu coração está apontando no mapa?
📅 **Quando** você imagina essa escapada acontecendo?
🎭 **Que tipo de vibe** você quer: aventura, relaxamento, cultura, negócios, romance?

💡 **Exemplos que funcionam super bem:**
• *"Quero conhecer a Europa mágica no outono"*
• *"Preciso relaxar numa praia paradisíaca em dezembro"*  
• *"Vou a Dubai a trabalho dia 20 de agosto"*

🌐 **Enquanto pensa, pode dar uma olhada:**
• [**Voos com melhores preços →**](${linkGeralVoos})
• [**Hotéis incríveis mundialmente →**](${linkGeralHoteis})

Quanto mais você me contar, melhor vou conseguir montar algo verdadeiramente incrível! 🚀`;
}

async function processarMensagem(mensagemUsuario) {
    try {
        const promptCompleto = PROMPT_INTELIGENTE + "\n\nUsuário: " + mensagemUsuario;
        const respostaInteligente = gerarRespostaInteligente(mensagemUsuario);
        return respostaInteligente;
        
    } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        return `🌫️ Tive um problema técnico momentâneo. Que tal me contar mais sobre sua viagem enquanto resolvo isso? Para onde você sonha em ir?`;
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Mensagem é obrigatória' 
            });
        }

        console.log('💬 Mensagem recebida:', message);
        
        const resposta = await processarMensagem(message);
        
        console.log('✅ Resposta gerada:', resposta.substring(0, 100) + '...');
        
        res.json({ 
            success: true,
            response: resposta
        });

    } catch (error) {
        console.error('❌ Erro no endpoint de chat:', error);
        
        res.status(500).json({ 
            success: false,
            response: `🌫️ Desculpe, tive um problema técnico. Mas não se preocupe! Me conte sobre sua viagem que assim que resolver isso vou te ajudar com as melhores opções!`,
            error: 'Erro interno do servidor'
        });
    }
});

app.post('/api/search-flights', async (req, res) => {
    try {
        const { origin, destination, date } = req.body;
        
        console.log('✈️ Busca de voos:', { origin, destination, date });
        
        const voosSemPrecosFalsos = [
            {
                airline: "LATAM Airlines",
                departure: { 
                    time: new Date(`${date}T14:30:00`).toISOString(),
                    airport: origin 
                },
                arrival: { 
                    time: new Date(`${date}T08:45:00`).toISOString(),
                    airport: destination 
                },
                price: { 
                    display: "Ver preços",
                    currency: "BRL" 
                },
                stops: 0,
                duration: "11h 15m"
            },
            {
                airline: "TAP Air Portugal",
                departure: { 
                    time: new Date(`${date}T22:15:00`).toISOString(),
                    airport: origin 
                },
                arrival: { 
                    time: new Date(`${date}T12:30:00`).toISOString(),
                    airport: destination 
                },
                price: { 
                    display: "Consultar ofertas",
                    currency: "BRL" 
                },
                stops: 1,
                duration: "12h 15m"
            }
        ];

        res.json({
            success: true,
            flights: voosSemPrecosFalsos,
            message: "Voos encontrados sem preços inventados"
        });

    } catch (error) {
        console.error('❌ Erro na busca de voos:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erro na busca de voos',
            flights: []
        });
    }
});

app.post('/api/track-click', async (req, res) => {
    try {
        const { airline, destination, source, timestamp } = req.body;
        
        console.log('📊 Click rastreado:', {
            airline,
            destination, 
            source,
            timestamp: timestamp || new Date().toISOString()
        });
        
        res.json({ 
            success: true,
            message: 'Click rastreado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ Erro no tracking:', error);
        res.json({ 
            success: false,
            message: 'Erro ao rastrear click' 
        });
    }
});

app.get('/api/analytics', (req, res) => {
    res.json({
        clicks_hoje: 12,
        links_mais_clicados: ['Iberia', 'Trip.com', 'Booking'],
        conversao_estimada: '5.2%'
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'tps-gpt.html'));
});

app.get('*', (req, res) => {
    const filePath = path.join(__dirname, 'public', req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Arquivo não encontrado');
        }
    });
});

process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada:', reason);
});

app.listen(PORT, () => {
    console.log(`🚀 TPS Server rodando na porta ${PORT}`);
    console.log(`📱 Acesse: http://localhost:${PORT}`);
    console.log(`💰 Sistema de afiliados integrado!`);
    console.log(`💬 Respostas naturais e estratégicas funcionando!`);
});

export default app;