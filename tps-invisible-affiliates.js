// =========================================
// TPS-GPT: MÓDULO DE AFILIADOS INVISÍVEIS
// =========================================
// 🎯 OBJETIVO: Tornar preços clicáveis SEM mostrar links
// 🔧 INTEGRAÇÃO: Adicionar ao seu tps-gpt.html existente

// =========================================
// 1. SISTEMA DE EXTRAÇÃO INTELIGENTE
// =========================================

class TPSInvisibleAffiliates {
    constructor() {
        this.conversationHistory = [];
        this.webhookUrl = 'https://hook.us2.make.com/z54vh1xkyb9a3yj1wyjaew6dyrwb53wa';
        this.affiliateConfig = {
            marker: '639764',
            trs: '425649',
            campaign: '121'
        };
    }

    // =========================================
    // 2. EXTRAÇÃO AUTOMÁTICA DE DADOS DA CONVERSA
    // =========================================
    
    extractTravelDataFromConversation() {
        const fullText = this.conversationHistory.join(' ').toLowerCase();
        
        const travelData = {
            from: this.extractOrigin(fullText),
            to: this.extractDestination(fullText),
            date: this.extractDate(fullText),
            passengers: this.extractPassengers(fullText)
        };
        
        console.log('🧠 Dados extraídos da conversa:', travelData);
        return travelData;
    }
    
    extractOrigin(text) {
        // Padrões para detectar origem
        const patterns = [
            /(?:de|from|saindo de|partindo de|leaving from)\s+([a-z\sõáéíóúâêôà]+?)(?:\s+(?:para|to|até))/i,
            /([a-z\sõáéíóúâêôà]+)\s*(?:→|->|para|to)\s*[a-z\sõáéíóúâêôà]+/i,
            /origem[:\s]+([a-z\sõáéíóúâêôà]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return this.normalizeCityToIATA(match[1].trim());
            }
        }
        
        // Fallback para São Paulo (usuário brasileiro)
        return 'SAO';
    }
    
    extractDestination(text) {
        // Padrões para detectar destino
        const patterns = [
            /(?:para|to|até|going to|viajando para)\s+([a-z\sõáéíóúâêôà]+)/i,
            /(?:→|->)\s*([a-z\sõáéíóúâêôà]+)/i,
            /destino[:\s]+([a-z\sõáéíóúâêôà]+)/i,
            /quero ir (?:para|a)\s+([a-z\sõáéíóúâêôà]+)/i
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return this.normalizeCityToIATA(match[1].trim());
            }
        }
        
        return 'CDG'; // Fallback para Paris
    }
    
    extractDate(text) {
        // Detectar meses em português/inglês
        const monthPatterns = [
            /(?:janeiro|january)/i,
            /(?:fevereiro|february)/i,
            /(?:março|march)/i,
            /(?:abril|april)/i,
            /(?:maio|may)/i,
            /(?:junho|june)/i,
            /(?:julho|july)/i,
            /(?:agosto|august)/i,
            /(?:setembro|september)/i,
            /(?:outubro|october)/i,
            /(?:novembro|november)/i,
            /(?:dezembro|december)/i
        ];
        
        for (let i = 0; i < monthPatterns.length; i++) {
            if (monthPatterns[i].test(text)) {
                // Usar mês detectado + ano atual/próximo
                const date = new Date();
                date.setMonth(i);
                if (date < new Date()) {
                    date.setFullYear(date.getFullYear() + 1);
                }
                return date.toISOString().split('T')[0];
            }
        }
        
        // Fallback: 60 dias no futuro
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 60);
        return futureDate.toISOString().split('T')[0];
    }
    
    extractPassengers(text) {
        const passengerMatch = text.match(/(\d+)\s*(?:pessoa|pessoas|passenger|passengers|people)/i);
        return passengerMatch ? parseInt(passengerMatch[1]) : 1;
    }
    
    normalizeCityToIATA(cityName) {
        const cityMap = {
            // Brasil
            'são paulo': 'SAO',
            'rio de janeiro': 'RIO', 
            'brasília': 'BSB',
            'salvador': 'SSA',
            'fortaleza': 'FOR',
            'recife': 'REC',
            'belo horizonte': 'CNF',
            'curitiba': 'CWB',
            'porto alegre': 'POA',
            
            // Internacional
            'paris': 'CDG',
            'londres': 'LHR',
            'london': 'LHR',
            'nova york': 'JFK',
            'new york': 'JFK',
            'tóquio': 'NRT',
            'tokyo': 'NRT',
            'dubai': 'DXB',
            'madrid': 'MAD',
            'barcelona': 'BCN',
            'roma': 'FCO',
            'rome': 'FCO',
            'amsterdã': 'AMS',
            'amsterdam': 'AMS',
            'milão': 'MXP',
            'milan': 'MXP',
            'seul': 'ICN',
            'seoul': 'ICN',
            'bangkok': 'BKK',
            'sydney': 'SYD'
        };
        
        const normalized = cityName.toLowerCase().trim();
        return cityMap[normalized] || cityName.toUpperCase().substring(0, 3);
    }

    // =========================================
    // 3. GERAÇÃO DE LINKS DINÂMICOS
    // =========================================
    
    generateDynamicAffiliateLinks(travelData) {
        const { from, to, date, passengers = 1 } = travelData;
        const formattedDate = date || this.getDefaultDate();
        
        return {
            wayaway: this.buildWayAwayLink(from, to, formattedDate, passengers),
            trip: this.buildTripLink(from, to, formattedDate, passengers),
            kiwi: this.buildKiwiLink(from, to, formattedDate, passengers),
            skyscanner: this.buildSkyscannerLink(from, to, formattedDate),
            booking: this.buildBookingLink(to, formattedDate)
        };
    }
    
    buildWayAwayLink(from, to, date, passengers) {
        const params = new URLSearchParams({
            marker: this.affiliateConfig.marker,
            from: from,
            to: to,
            departure: date,
            adults: passengers,
            currency: 'USD'
        });
        
        return `https://wayaway.io/flights?${params.toString()}`;
    }
    
    buildTripLink(from, to, date, passengers) {
        const tripUrl = `https://trip.com/flights/${from}-${to}?date=${date}&adults=${passengers}`;
        const encodedUrl = encodeURIComponent(tripUrl);
        
        return `https://tp.media/r?marker=${this.affiliateConfig.marker}&trs=${this.affiliateConfig.trs}&p=8626&u=${encodedUrl}&campaign_id=${this.affiliateConfig.campaign}`;
    }
    
    buildKiwiLink(from, to, date, passengers) {
        return `https://www.kiwi.com/en/search/results/${from}/${to}/${date}?adults=${passengers}&affilid=${this.affiliateConfig.marker}`;
    }
    
    buildSkyscannerLink(from, to, date) {
        const skyscannerUrl = `https://www.skyscanner.com/transport/flights/${from}/${to}/${date}`;
        const encodedUrl = encodeURIComponent(skyscannerUrl);
        
        return `https://tp.media/r?marker=${this.affiliateConfig.marker}&trs=${this.affiliateConfig.trs}&p=5976&u=${encodedUrl}`;
    }
    
    buildBookingLink(destination, checkin) {
        const checkout = new Date(checkin);
        checkout.setDate(checkout.getDate() + 3);
        const checkoutFormatted = checkout.toISOString().split('T')[0];
        
        const bookingUrl = `https://booking.com/searchresults.html?ss=${destination}&checkin=${checkin}&checkout=${checkoutFormatted}`;
        const encodedUrl = encodeURIComponent(bookingUrl);
        
        return `https://tp.media/r?marker=${this.affiliateConfig.marker}&trs=${this.affiliateConfig.trs}&p=8626&u=${encodedUrl}`;
    }
    
    getDefaultDate() {
        const date = new Date();
        date.setDate(date.getDate() + 45); // 45 dias no futuro
        return date.toISOString().split('T')[0];
    }

    // =========================================
    // 4. SISTEMA DE REDIRECIONAMENTO INVISÍVEL
    // =========================================
    
    async handleInvisibleFlightClick(price, element) {
        // Extrair dados da conversa atual
        const travelData = this.extractTravelDataFromConversation();
        
        // Gerar links dinâmicos
        const links = this.generateDynamicAffiliateLinks(travelData);
        
        // Escolher melhor provedor
        const bestLink = this.selectBestProvider(links, travelData);
        
        // Tracking completo
        await this.trackAffiliateClick({
            price: price,
            from: travelData.from,
            to: travelData.to,
            date: travelData.date,
            provider: this.getProviderFromLink(bestLink),
            link: bestLink,
            timestamp: new Date().toISOString(),
            conversationSnapshot: this.conversationHistory.slice(-3) // Últimas 3 mensagens
        });
        
        // Feedback visual temporário
        if (element) {
            const originalText = element.innerHTML;
            element.innerHTML = '✈️ Redirecionando...';
            element.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
            
            setTimeout(() => {
                element.innerHTML = originalText;
                element.style.background = '';
            }, 2000);
        }
        
        // Redirecionamento invisível
        window.open(bestLink, '_blank');
        
        console.log('🚀 Redirecionamento realizado:', {
            travelData,
            bestLink,
            provider: this.getProviderFromLink(bestLink)
        });
        
        return bestLink;
    }
    
    selectBestProvider(links, travelData) {
        const { from, to } = travelData;
        
        // Lógica inteligente por rota
        if (this.isAsianRoute(to)) {
            return links.trip; // Trip.com melhor para Ásia
        }
        
        if (this.isEuropeanRoute(to)) {
            return links.kiwi; // Kiwi melhor para Europa
        }
        
        if (this.isLongHaulRoute(from, to)) {
            return links.skyscanner; // Skyscanner para voos longos
        }
        
        // Default: WayAway (melhor conversão geral)
        return links.wayaway;
    }
    
    isAsianRoute(destination) {
        const asianCodes = ['NRT', 'ICN', 'PVG', 'HKG', 'SIN', 'BKK', 'TPE', 'KUL'];
        return asianCodes.includes(destination);
    }
    
    isEuropeanRoute(destination) {
        const europeanCodes = ['CDG', 'LHR', 'MAD', 'BCN', 'FCO', 'AMS', 'FRA', 'MXP'];
        return europeanCodes.includes(destination);
    }
    
    isLongHaulRoute(from, to) {
        const longHaulPairs = [
            ['SAO', 'NRT'], ['RIO', 'ICN'], ['BSB', 'DXB'],
            ['SAO', 'LHR'], ['RIO', 'CDG'], ['FOR', 'JFK']
        ];
        
        return longHaulPairs.some(pair => 
            (pair[0] === from && pair[1] === to) ||
            (pair[1] === from && pair[0] === to)
        );
    }
    
    getProviderFromLink(link) {
        if (link.includes('wayaway.io')) return 'WayAway';
        if (link.includes('trip.com')) return 'Trip.com';
        if (link.includes('kiwi.com')) return 'Kiwi.com';
        if (link.includes('skyscanner.com')) return 'Skyscanner';
        if (link.includes('booking.com')) return 'Booking.com';
        return 'Unknown';
    }

    // =========================================
    // 5. TRACKING E WEBHOOK
    // =========================================
    
    async trackAffiliateClick(clickData) {
        // Google Analytics (se disponível)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'invisible_affiliate_click', {
                'destination': clickData.to,
                'origin': clickData.from,
                'price': clickData.price,
                'provider': clickData.provider,
                'value': parseFloat(clickData.price.replace(/[^\d.]/g, '')) || 0
            });
        }
        
        // Webhook Make.com
        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: 'invisible_affiliate_click',
                    data: clickData,
                    user_agent: navigator.userAgent,
                    language: window.currentLang || 'en',
                    referrer: document.referrer,
                    timestamp: clickData.timestamp
                })
            });
            
            console.log('📡 Tracking enviado para Make.com:', clickData);
        } catch (error) {
            console.error('❌ Erro no webhook:', error);
        }
    }

    // =========================================
    // 6. INTEGRAÇÃO COM SISTEMA EXISTENTE
    // =========================================
    
    // Intercepta quando uma nova mensagem é adicionada
    onMessageAdded(messageText, isUser) {
        this.conversationHistory.push(messageText);
        
        // Manter apenas últimas 10 mensagens para performance
        if (this.conversationHistory.length > 10) {
            this.conversationHistory = this.conversationHistory.slice(-10);
        }
        
        // Se for resposta da IA com preços, processar
        if (!isUser && this.hasFlightPrices(messageText)) {
            setTimeout(() => {
                this.makeFlightPricesClickable();
            }, 500);
        }
    }
    
    hasFlightPrices(text) {
        const pricePattern = /(?:USD|EUR|R\$)\s*[\d,]+/i;
        return pricePattern.test(text);
    }
    
    makeFlightPricesClickable() {
        // Encontrar todos os preços na página
        const chatContainer = document.getElementById('chatContainer');
        if (!chatContainer) return;
        
        const lastMessage = chatContainer.lastElementChild;
        if (!lastMessage) return;
        
        const messageText = lastMessage.querySelector('.message-text');
        if (!messageText) return;
        
        // Substituir preços por elementos clicáveis invisíveis
        const pricePattern = /(USD|EUR|R\$)\s*([\d,]+)/gi;
        
        messageText.innerHTML = messageText.innerHTML.replace(pricePattern, (match, currency, amount) => {
            const uniqueId = 'price-' + Math.random().toString(36).substr(2, 9);
            const cleanPrice = amount.replace(/,/g, '');
            
            return `<span id="${uniqueId}" 
                           class="tps-invisible-price" 
                           data-price="${cleanPrice}"
                           data-currency="${currency}"
                           style="cursor: pointer; 
                                  color: #00ff88; 
                                  font-weight: bold; 
                                  padding: 2px 6px; 
                                  border-radius: 6px;
                                  background: linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,255,136,0.2));
                                  transition: all 0.3s ease;
                                  display: inline-block;"
                           onmouseover="this.style.transform='scale(1.05)'; this.style.background='linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,255,136,0.3))';"
                           onmouseout="this.style.transform='scale(1)'; this.style.background='linear-gradient(135deg, rgba(0,255,136,0.1), rgba(0,255,136,0.2))';">
                      ${match} ✈️
                    </span>`;
        });
        
        // Anexar listeners aos novos elementos
        setTimeout(() => {
            this.attachPriceClickListeners();
        }, 100);
    }
    
    attachPriceClickListeners() {
        const priceElements = document.querySelectorAll('.tps-invisible-price:not([data-listener-attached])');
        
        priceElements.forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const price = element.getAttribute('data-price');
                this.handleInvisibleFlightClick(price, element);
            });
            
            element.setAttribute('data-listener-attached', 'true');
        });
        
        console.log(`✅ ${priceElements.length} preços tornados clicáveis invisíveis`);
    }
}

// =========================================
// 7. INICIALIZAÇÃO E INTEGRAÇÃO GLOBAL
// =========================================

// Instância global
window.TPSInvisible = new TPSInvisibleAffiliates();

// Integração com função addMessage existente
const originalAddMessage = window.addMessage;
if (originalAddMessage) {
    window.addMessage = function(text, isUser = false) {
        // Chamar função original
        originalAddMessage(text, isUser);
        
        // Processar com sistema invisível
        window.TPSInvisible.onMessageAdded(text, isUser);
    };
}

// Auto-teste e debug
console.log('🔧 TPS Sistema de Afiliados Invisíveis carregado');

// Função de teste (remover em produção)
window.testTPSInvisible = function() {
    window.TPSInvisible.conversationHistory = [
        'Olá, quero viajar',
        'Quero ir de São Paulo para Paris em julho',
        'Encontrei voos de USD 1,250 para Paris saindo de São Paulo'
    ];
    
    const testData = window.TPSInvisible.extractTravelDataFromConversation();
    const testLinks = window.TPSInvisible.generateDynamicAffiliateLinks(testData);
    
    console.log('🧪 Teste - Dados extraídos:', testData);
    console.log('🧪 Teste - Links gerados:', testLinks);
    
    return { testData, testLinks };
};

// =========================================
// 8. EXEMPLO DE USO NO HTML
// =========================================

/*
Para usar este sistema, adicione ao final do seu tps-gpt.html:

<script src="tps-invisible-affiliates.js"></script>

O sistema irá automaticamente:
1. Interceptar todas as mensagens
2. Identificar preços de voos
3. Torná-los clicáveis invisíveis
4. Extrair dados da conversa
5. Gerar links personalizados
6. Fazer tracking completo
7. Redirecionar automaticamente

Nenhuma modificação adicional é necessária!
*/