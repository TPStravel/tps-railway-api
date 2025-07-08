// ==========================================
// TPS AFFILIATES SYSTEM
// Sistema completo de links de afiliados
// Conecta com Firebase Functions para redirects seguros
// ==========================================

// ===== CONFIGURAÇÃO PRINCIPAL =====
const FIREBASE_REDIRECT_BASE = 'https://us-central1-canal-vivo-chat.cloudfunctions.net/redirect';

// ===== MAPEAMENTO COMPLETO DE AFILIADOS =====
const AFFILIATE_KEYS = {
    // ✈️ VOOS
    'trip': 'Trip.com - Voos e Hotéis',
    'aviasales': 'Aviasales - Comparador de Voos', 
    'wayaway': 'WayAway - Cashback em Viagens',
    'kiwi': 'Kiwi.com - Busca Inteligente de Voos',
    
    // 🏨 HOTÉIS
    'hotel': 'Trip.com - Reserva de Hotéis',
    'hotellook': 'Hotellook - Comparador de Hotéis',
    'booking': 'Booking.com - Hospedagem Global',
    
    // 🚗 TRANSPORTE
    'car': 'Localrent - Aluguel de Carros',
    'localrent': 'Localrent - Carros Locais',
    'discovercar': 'DiscoverCars - Comparador de Carros',
    'kiwitaxi': 'Kiwitaxi - Transfer Aeroporto',
    'transfer': 'Kiwitaxi - Transfers Privados',
    
    // 🛡️ SEGUROS
    'seguro': 'EKTA - Seguro Viagem',
    'ekta': 'EKTA - Proteção Internacional',
    'compareyourtravel': 'Compare Your Travel Insurance',
    'explorer': 'Explorer Travel Insurance',
    'traveltime': 'TravelTime Insurance',
    
    // 🎫 INGRESSOS E TOURS
    'ingressos': 'Tiqets - Ingressos para Atrações',
    'tiqets': 'Tiqets - Tours e Experiências',
    'wegotrip': 'WeGoTrip - Tours Guiados',
    'getyourguide': 'GetYourGuide - Atividades Locais',
    
    // 🔄 COMPARADORES
    'comparador': 'Aviasales - Compare Preços',
    
    // 💸 REEMBOLSOS
    'reembolso': 'Compensair - Reembolso de Voos',
    'compensair': 'Compensair - Compensação Aérea'
};

// ===== CATEGORIAS PARA DETECÇÃO AUTOMÁTICA =====
const INTENT_CATEGORIES = {
    'flight': ['trip', 'aviasales', 'kiwi'],
    'hotel': ['hotel', 'hotellook', 'booking'], 
    'car': ['localrent', 'car', 'discovercar'],
    'insurance': ['ekta', 'seguro', 'compareyourtravel'],
    'tickets': ['tiqets', 'ingressos', 'wegotrip'],
    'transfer': ['kiwitaxi', 'transfer'],
    'claim': ['compensair', 'reembolso']
};

// ===== FUNÇÃO PRINCIPAL =====
/**
 * Gera link de afiliado seguro via Firebase Functions
 * @param {string} key - Chave do afiliado (ex: 'trip', 'booking')
 * @returns {string} URL completa para redirect
 */
function getAffiliateLink(key) {
    if (!key || typeof key !== 'string') {
        console.warn('TPS Affiliates: Chave inválida:', key);
        return null;
    }
    
    // Validar se a chave existe
    if (!AFFILIATE_KEYS[key.toLowerCase()]) {
        console.warn('TPS Affiliates: Chave não encontrada:', key);
        return null;
    }
    
    const finalKey = key.toLowerCase();
    const redirectUrl = `${FIREBASE_REDIRECT_BASE}?key=${finalKey}`;
    
    // Log para analytics (opcional)
    logAffiliateClick(finalKey);
    
    return redirectUrl;
}

// ===== REDIRECIONAMENTO DIRETO =====
/**
 * Detecta clique e abre link de afiliado em nova aba
 * @param {string} key - Chave do afiliado
 * @param {Object} options - Opções adicionais
 */
function detectClickAndRedirect(key, options = {}) {
    const link = getAffiliateLink(key);
    
    if (!link) {
        console.error('TPS Affiliates: Não foi possível gerar link para:', key);
        return false;
    }
    
    // Configurações padrão
    const config = {
        target: '_blank',
        trackClick: true,
        showNotification: false,
        ...options
    };
    
    try {
        // Abrir link
        const newWindow = window.open(link, config.target);
        
        if (!newWindow) {
            // Fallback se popup foi bloqueado
            console.warn('TPS Affiliates: Popup bloqueado, tentando redirect direto');
            window.location.href = link;
        }
        
        // Notificação opcional
        if (config.showNotification) {
            showAffiliateNotification(key);
        }
        
        console.log(`✅ TPS Affiliates: Redirecionando para ${AFFILIATE_KEYS[key]}`);
        return true;
        
    } catch (error) {
        console.error('TPS Affiliates: Erro no redirecionamento:', error);
        return false;
    }
}

// ===== DETECÇÃO AUTOMÁTICA POR INTENÇÃO =====
/**
 * Detecta intenção do usuário e sugere afiliado apropriado
 * @param {string} userMessage - Mensagem do usuário
 * @returns {string|null} Chave do afiliado sugerido
 */
function detectIntentAndSuggestAffiliate(userMessage) {
    if (!userMessage || typeof userMessage !== 'string') {
        return null;
    }
    
    const message = userMessage.toLowerCase();
    
    // Detecção por palavras-chave
    const detectionRules = {
        // Voos
        'flight': ['voo', 'flight', 'voar', 'avião', 'airplane', 'passagem aérea', 'bilhete aéreo'],
        'hotel': ['hotel', 'hospedagem', 'acomodação', 'pousada', 'resort', 'hostel'],
        'car': ['carro', 'car', 'aluguel', 'rental', 'aluguer', 'veículo'],
        'insurance': ['seguro', 'insurance', 'proteção', 'cobertura', 'assistência'],
        'tickets': ['ingresso', 'ticket', 'entrada', 'passeio', 'tour', 'atração'],
        'transfer': ['transfer', 'transporte', 'aeroporto', 'taxi', 'uber'],
        'claim': ['reembolso', 'compensação', 'cancelado', 'atrasado', 'claim']
    };
    
    // Buscar correspondências
    for (const [intent, keywords] of Object.entries(detectionRules)) {
        for (const keyword of keywords) {
            if (message.includes(keyword)) {
                const affiliates = INTENT_CATEGORIES[intent];
                if (affiliates && affiliates.length > 0) {
                    // Retornar primeiro afiliado da categoria
                    return affiliates[0];
                }
            }
        }
    }
    
    return null;
}

// ===== INTEGRAÇÃO COM TPS GPT =====
/**
 * Integra sistema de afiliados com o TPS GPT
 * @param {string} userMessage - Mensagem do usuário
 * @param {Object} options - Opções de integração
 */
function integrateWithTPS(userMessage, options = {}) {
    const suggestedAffiliate = detectIntentAndSuggestAffiliate(userMessage);
    
    if (suggestedAffiliate && options.autoRedirect) {
        // Redirecionamento automático após delay
        setTimeout(() => {
            detectClickAndRedirect(suggestedAffiliate, {
                showNotification: true
            });
        }, options.delay || 2000);
    }
    
    return {
        hasAffiliate: !!suggestedAffiliate,
        suggestedKey: suggestedAffiliate,
        suggestedName: suggestedAffiliate ? AFFILIATE_KEYS[suggestedAffiliate] : null,
        link: suggestedAffiliate ? getAffiliateLink(suggestedAffiliate) : null
    };
}

// ===== INTEGRAÇÃO COM BOTÕES DO HTML =====
/**
 * Conecta botões do TPS HTML com sistema de afiliados
 */
function connectToPSButtons() {
    // Mapeamento botões → afiliados
    const buttonMapping = {
        'btn-voos': 'trip',
        'btn-hospedagem': 'hotel', 
        'btn-transporte': 'car',
        'btn-seguro': 'seguro',
        'btn-ingressos': 'tiqets',
        'btn-pacotes': 'trip'
    };
    
    // Adicionar event listeners
    Object.entries(buttonMapping).forEach(([buttonId, affiliateKey]) => {
        const button = document.getElementById(buttonId);
        if (button) {
            // Adicionar clique de afiliado após ação original
            button.addEventListener('click', function() {
                setTimeout(() => {
                    detectClickAndRedirect(affiliateKey, {
                        showNotification: false
                    });
                }, 1500); // Delay para não interferir com a ação principal
            });
        }
    });
    
    console.log('✅ TPS Affiliates: Conectado aos botões do TPS');
}

// ===== INTEGRAÇÃO COM DESTINOS =====
/**
 * Conecta cliques em destinos com afiliados de hotel/voo
 */
function connectToDestinations() {
    const destinationItems = document.querySelectorAll('.destination-item');
    
    destinationItems.forEach(item => {
        item.addEventListener('click', function() {
            const destination = this.getAttribute('data-destination');
            
            if (destination) {
                // Abrir Trip.com para buscar voos+hotel para o destino
                setTimeout(() => {
                    detectClickAndRedirect('trip', {
                        showNotification: false
                    });
                }, 2000);
            }
        });
    });
    
    console.log('✅ TPS Affiliates: Conectado aos destinos');
}

// ===== SISTEMA DE ANALYTICS =====
function logAffiliateClick(key) {
    // Analytics simples (pode integrar com Google Analytics)
    const timestamp = new Date().toISOString();
    const logData = {
        affiliate: key,
        name: AFFILIATE_KEYS[key],
        timestamp: timestamp,
        userAgent: navigator.userAgent,
        referrer: document.referrer
    };
    
    // Salvar no localStorage para analytics
    const existingLogs = JSON.parse(localStorage.getItem('tps-affiliate-clicks') || '[]');
    existingLogs.push(logData);
    
    // Manter apenas últimos 100 cliques
    if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('tps-affiliate-clicks', JSON.stringify(existingLogs));
    
    console.log('📊 TPS Affiliates Analytics:', logData);
}

// ===== NOTIFICAÇÕES =====
function showAffiliateNotification(key) {
    const affiliateName = AFFILIATE_KEYS[key];
    
    // Criar notificação discreta
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4f46e5;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        🔗 Abrindo ${affiliateName}
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            margin-left: 10px;
            cursor: pointer;
        ">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover após 3 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// ===== RELATÓRIO DE ANALYTICS =====
function getAffiliateAnalytics() {
    const logs = JSON.parse(localStorage.getItem('tps-affiliate-clicks') || '[]');
    
    // Estatísticas básicas
    const stats = {
        totalClicks: logs.length,
        topAffiliates: {},
        recentClicks: logs.slice(-10),
        clicksByDate: {}
    };
    
    // Contar cliques por afiliado
    logs.forEach(log => {
        stats.topAffiliates[log.affiliate] = (stats.topAffiliates[log.affiliate] || 0) + 1;
        
        const date = log.timestamp.split('T')[0];
        stats.clicksByDate[date] = (stats.clicksByDate[date] || 0) + 1;
    });
    
    return stats;
}

// ===== UTILITÁRIOS =====
function listAvailableAffiliates() {
    console.table(AFFILIATE_KEYS);
}

function testAffiliateLink(key) {
    const link = getAffiliateLink(key);
    if (link) {
        console.log(`✅ Link gerado: ${link}`);
        return link;
    } else {
        console.error(`❌ Erro ao gerar link para: ${key}`);
        return null;
    }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Conectar automaticamente com o TPS se elementos existirem
    if (document.getElementById('btn-voos')) {
        connectToPSButtons();
    }
    
    if (document.querySelector('.destination-item')) {
        connectToDestinations();
    }
    
    console.log('🔗 TPS Affiliates System: Inicializado com sucesso');
    console.log(`📊 Afiliados disponíveis: ${Object.keys(AFFILIATE_KEYS).length}`);
});

// ===== EXPORTAR FUNÇÕES PRINCIPAIS =====
// Para uso global no HTML
window.getAffiliateLink = getAffiliateLink;
window.detectClickAndRedirect = detectClickAndRedirect;
window.integrateWithTPS = integrateWithTPS;
window.detectIntentAndSuggestAffiliate = detectIntentAndSuggestAffiliate;
window.getAffiliateAnalytics = getAffiliateAnalytics;
window.listAvailableAffiliates = listAvailableAffiliates;
window.testAffiliateLink = testAffiliateLink;

// ===== EXEMPLO DE USO =====
/*

// 1. USO BÁSICO
const link = getAffiliateLink('trip');
window.open(link, '_blank');

// 2. REDIRECIONAMENTO DIRETO
detectClickAndRedirect('booking');

// 3. DETECÇÃO AUTOMÁTICA
const suggestion = detectIntentAndSuggestAffiliate('Quero um hotel em Paris');
// Retorna: 'hotel'

// 4. INTEGRAÇÃO COM GPT
const result = integrateWithTPS('Preciso de seguro viagem', {
    autoRedirect: true,
    delay: 3000
});

// 5. NO HTML
<button onclick="detectClickAndRedirect('trip')">Ver Voos</button>

// 6. ANALYTICS
console.log(getAffiliateAnalytics());

// 7. TESTE
testAffiliateLink('kiwi');

*/