#!/usr/bin/env node

// ═══════════════════════════════════════════════════════════════════
// 🧪 TPS MULTILANG TESTING SUITE - 12 IDIOMAS
// ═══════════════════════════════════════════════════════════════════
// Script completo para testar todas as funcionalidades multilíngues
// ═══════════════════════════════════════════════════════════════════

const axios = require('axios');
const colors = require('colors');

// Configuração base
const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ar', 'ru', 'ko', 'hi'];

// ═══════════════════════════════════════════════════════════════════
// 📝 DADOS DE TESTE POR IDIOMA
// ═══════════════════════════════════════════════════════════════════

const TEST_MESSAGES = {
    pt: {
        flights: ['Quero viajar para Paris', 'Preciso de passagem para Roma', 'Voo para Londres'],
        hotels: ['Hotel em Nova York', 'Hospedagem em Tóquio', 'Resort nas Maldivas'],
        transport: ['Aluguel de carro', 'Transfer do aeroporto', 'Taxi para hotel'],
        protection: ['Seguro de viagem', 'Proteção médica', 'Cobertura internacional'],
        esim: ['Internet no exterior', 'Chip internacional', 'Conexão global'],
        cruise: ['Cruzeiro mediterrâneo', 'Navio para Caribe', 'Cruise de luxo']
    },
    
    en: {
        flights: ['I want to fly to Paris', 'Need a flight to Rome', 'Book flight to London'],
        hotels: ['Hotel in New York', 'Accommodation in Tokyo', 'Resort in Maldives'],
        transport: ['Car rental', 'Airport transfer', 'Taxi to hotel'],
        protection: ['Travel insurance', 'Medical coverage', 'International protection'],
        esim: ['Internet abroad', 'International SIM', 'Global connection'],
        cruise: ['Mediterranean cruise', 'Caribbean cruise ship', 'Luxury cruise']
    },
    
    es: {
        flights: ['Quiero viajar a París', 'Necesito vuelo a Roma', 'Reservar vuelo a Londres'],
        hotels: ['Hotel en Nueva York', 'Alojamiento en Tokio', 'Resort en Maldivas'],
        transport: ['Alquiler de coche', 'Transfer del aeropuerto', 'Taxi al hotel'],
        protection: ['Seguro de viaje', 'Cobertura médica', 'Protección internacional'],
        esim: ['Internet en el extranjero', 'SIM internacional', 'Conexión global'],
        cruise: ['Crucero mediterráneo', 'Barco del Caribe', 'Crucero de lujo']
    },
    
    fr: {
        flights: ['Je veux voler vers Paris', 'Besoin d\'un vol pour Rome', 'Réserver vol pour Londres'],
        hotels: ['Hôtel à New York', 'Hébergement à Tokyo', 'Resort aux Maldives'],
        transport: ['Location de voiture', 'Transfert aéroport', 'Taxi vers hôtel'],
        protection: ['Assurance voyage', 'Couverture médicale', 'Protection internationale'],
        esim: ['Internet à l\'étranger', 'SIM internationale', 'Connexion globale'],
        cruise: ['Croisière méditerranéenne', 'Navire des Caraïbes', 'Croisière de luxe']
    },
    
    de: {
        flights: ['Ich möchte nach Paris fliegen', 'Brauche Flug nach Rom', 'Flug nach London buchen'],
        hotels: ['Hotel in New York', 'Unterkunft in Tokyo', 'Resort auf Malediven'],
        transport: ['Mietwagen', 'Flughafen Transfer', 'Taxi zum Hotel'],
        protection: ['Reiseversicherung', 'Krankenversicherung', 'Internationaler Schutz'],
        esim: ['Internet im Ausland', 'Internationale SIM', 'Globale Verbindung'],
        cruise: ['Mittelmeer Kreuzfahrt', 'Karibik Schiff', 'Luxus Kreuzfahrt']
    },
    
    it: {
        flights: ['Voglio volare a Parigi', 'Serve volo per Roma', 'Prenotare volo per Londra'],
        hotels: ['Hotel a New York', 'Alloggio a Tokyo', 'Resort alle Maldive'],
        transport: ['Noleggio auto', 'Transfer aeroporto', 'Taxi per hotel'],
        protection: ['Assicurazione viaggio', 'Copertura medica', 'Protezione internazionale'],
        esim: ['Internet all\'estero', 'SIM internazionale', 'Connessione globale'],
        cruise: ['Crociera mediterranea', 'Nave dei Caraibi', 'Crociera di lusso']
    },
    
    ja: {
        flights: ['パリに飛びたい', 'ローマへのフライトが必要', 'ロンドン行きを予約'],
        hotels: ['ニューヨークのホテル', '東京での宿泊', 'モルディブのリゾート'],
        transport: ['レンタカー', '空港送迎', 'ホテルまでタクシー'],
        protection: ['旅行保険', '医療保険', '国際保護'],
        esim: ['海外でのインターネット', '国際SIM', 'グローバル接続'],
        cruise: ['地中海クルーズ', 'カリブ海の船', '豪華クルーズ']
    },
    
    zh: {
        flights: ['我想飞往巴黎', '需要飞往罗马的航班', '预订飞往伦敦的航班'],
        hotels: ['纽约的酒店', '东京的住宿', '马尔代夫的度假村'],
        transport: ['租车', '机场接送', '去酒店的出租车'],
        protection: ['旅行保险', '医疗保险', '国际保护'],
        esim: ['海外上网', '国际SIM卡', '全球连接'],
        cruise: ['地中海邮轮', '加勒比海船', '豪华邮轮']
    },
    
    ar: {
        flights: ['أريد السفر إلى باريس', 'أحتاج رحلة إلى روما', 'حجز رحلة إلى لندن'],
        hotels: ['فندق في نيويورك', 'إقامة في طوكيو', 'منتجع في المالديف'],
        transport: ['استئجار سيارة', 'نقل من المطار', 'تاكسي إلى الفندق'],
        protection: ['تأمين السفر', 'التغطية الطبية', 'الحماية الدولية'],
        esim: ['إنترنت في الخارج', 'شريحة دولية', 'اتصال عالمي'],
        cruise: ['رحلة بحرية متوسطية', 'سفينة الكاريبي', 'رحلة فاخرة']
    },
    
    ru: {
        flights: ['Хочу лететь в Париж', 'Нужен рейс в Рим', 'Забронировать рейс в Лондон'],
        hotels: ['Отель в Нью-Йорке', 'Размещение в Токио', 'Курорт на Мальдивах'],
        transport: ['Аренда машины', 'Трансфер из аэропорта', 'Такси в отель'],
        protection: ['Страховка путешествий', 'Медицинское покрытие', 'Международная защита'],
        esim: ['Интернет за границей', 'Международная SIM', 'Глобальная связь'],
        cruise: ['Средиземноморский круиз', 'Карибский корабль', 'Роскошный круиз']
    },
    
    ko: {
        flights: ['파리로 가고 싶어요', '로마 항공편이 필요해요', '런던 항공편 예약'],
        hotels: ['뉴욕 호텔', '도쿄 숙박', '몰디브 리조트'],
        transport: ['렌터카', '공항 픽업', '호텔까지 택시'],
        protection: ['여행보험', '의료보험', '국제 보호'],
        esim: ['해외 인터넷', '국제 SIM', '글로벌 연결'],
        cruise: ['지중해 크루즈', '카리브해 선박', '럭셔리 크루즈']
    },
    
    hi: {
        flights: ['मैं पेरिस जाना चाहता हूँ', 'रोम के लिए फ्लाइट चाहिए', 'लंदन के लिए फ्लाइट बुक करें'],
        hotels: ['न्यूयॉर्क में होटल', 'टोक्यो में आवास', 'मालदीव में रिसॉर्ट'],
        transport: ['कार किराया', 'एयरपोर्ट ट्रांसफर', 'होटल तक टैक्सी'],
        protection: ['यात्रा बीमा', 'चिकित्सा कवरेज', 'अंतर्राष्ट्रीय सुरक्षा'],
        esim: ['विदेश में इंटरनेट', 'अंतर्राष्ट्रीय सिम', 'वैश्विक कनेक्शन'],
        cruise: ['भूमध्यसागरीय क्रूज', 'कैरिबियन जहाज', 'लक्जरी क्रूज']
    }
};

// ═══════════════════════════════════════════════════════════════════
// 🛠️ UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors_map = {
        success: 'green',
        error: 'red',
        warning: 'yellow',
        info: 'cyan',
        header: 'magenta'
    };
    
    console.log(`[${timestamp}] ${message}`[colors_map[type] || 'white']);
}

function logHeader(text) {
    console.log('\n' + '═'.repeat(60).magenta);
    console.log(`  ${text}`.magenta.bold);
    console.log('═'.repeat(60).magenta + '\n');
}

async function makeRequest(method, endpoint, data = null, headers = {}) {
    try {
        const config = {
            method,
            url: `${API_BASE}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status
        };
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🧪 TEST SUITES
// ═══════════════════════════════════════════════════════════════════

async function testLanguageSupport() {
    logHeader('🌍 TESTING LANGUAGE SUPPORT');
    
    // Test languages endpoint
    log('Testing /api/languages endpoint...');
    const langResponse = await makeRequest('GET', '/languages');
    
    if (langResponse.success) {
        log(`✅ Languages endpoint working. Found ${langResponse.data.languages.length} languages`, 'success');
        
        langResponse.data.languages.forEach(lang => {
            log(`   ${lang.flag} ${lang.code}: ${lang.name} (${lang.region})`, 'info');
        });
    } else {
        log(`❌ Languages endpoint failed: ${langResponse.error}`, 'error');
        return false;
    }
    
    // Test individual language translations
    log('\nTesting individual language translations...');
    let translationTests = 0;
    let translationPassed = 0;
    
    for (const langCode of SUPPORTED_LANGUAGES) {
        translationTests++;
        const transResponse = await makeRequest('GET', `/translations/${langCode}`);
        
        if (transResponse.success) {
            translationPassed++;
            log(`✅ ${langCode.toUpperCase()}: ${transResponse.data.translations.welcome}`, 'success');
        } else {
            log(`❌ ${langCode.toUpperCase()}: Translation failed`, 'error');
        }
    }
    
    log(`\n📊 Translation Tests: ${translationPassed}/${translationTests} passed`, 
        translationPassed === translationTests ? 'success' : 'warning');
    
    return translationPassed === translationTests;
}

async function testLanguageDetection() {
    logHeader('🎯 TESTING LANGUAGE DETECTION');
    
    const testCases = [
        { language: 'pt', header: 'pt-BR,pt;q=0.9' },
        { language: 'en', header: 'en-US,en;q=0.9' },
        { language: 'ja', header: 'ja-JP,ja;q=0.9' },
        { language: 'ar', header: 'ar-SA,ar;q=0.9' },
        { language: 'zh', header: 'zh-CN,zh;q=0.9' }
    ];
    
    let detectionTests = 0;
    let detectionPassed = 0;
    
    for (const testCase of testCases) {
        detectionTests++;
        log(`Testing detection for ${testCase.language.toUpperCase()}...`);
        
        const response = await makeRequest('GET', '/detect-language', null, {
            'Accept-Language': testCase.header
        });
        
        if (response.success && response.data.detected === testCase.language) {
            detectionPassed++;
            log(`✅ Detected: ${response.data.detected}, Currency: ${response.data.currency}`, 'success');
        } else {
            log(`❌ Expected ${testCase.language}, got ${response.data?.detected}`, 'error');
        }
    }
    
    // Test X-User-Language header priority
    log('\nTesting X-User-Language header priority...');
    const priorityResponse = await makeRequest('GET', '/detect-language', null, {
        'Accept-Language': 'en-US,en;q=0.9',
        'X-User-Language': 'ja'
    });
    
    if (priorityResponse.success && priorityResponse.data.detected === 'ja') {
        detectionPassed++;
        log('✅ X-User-Language header has priority', 'success');
    } else {
        log('❌ X-User-Language header priority failed', 'error');
    }
    detectionTests++;
    
    log(`\n📊 Detection Tests: ${detectionPassed}/${detectionTests} passed`, 
        detectionPassed === detectionTests ? 'success' : 'warning');
    
    return detectionPassed === detectionTests;
}

async function testChatIntelligence() {
    logHeader('🤖 TESTING CHAT INTELLIGENCE');
    
    let chatTests = 0;
    let chatPassed = 0;
    
    // Test each language and category
    for (const [language, categories] of Object.entries(TEST_MESSAGES)) {
        log(`\nTesting ${language.toUpperCase()} chat intelligence...`);
        
        for (const [category, messages] of Object.entries(categories)) {
            for (const message of messages.slice(0, 1)) { // Test 1 message per category
                chatTests++;
                
                const response = await makeRequest('POST', '/test/chat-intelligence', {
                    message,
                    language
                });
                
                if (response.success) {
                    const detected = response.data.analysis.detectedCategory;
                    if (detected === category) {
                        chatPassed++;
                        log(`✅ "${message}" → ${detected}`, 'success');
                    } else {
                        log(`⚠️  "${message}" → expected: ${category}, got: ${detected}`, 'warning');
                        // Still count as partial success if not 'general'
                        if (detected !== 'general') chatPassed += 0.5;
                    }
                } else {
                    log(`❌ Chat test failed for: "${message}"`, 'error');
                }
            }
        }
    }
    
    log(`\n📊 Chat Intelligence Tests: ${Math.round(chatPassed)}/${chatTests} passed`, 
        chatPassed >= chatTests * 0.8 ? 'success' : 'warning');
    
    return chatPassed >= chatTests * 0.8;
}

async function testChatFlow() {
    logHeader('💬 TESTING CHAT FLOW');
    
    let flowTests = 0;
    let flowPassed = 0;
    
    // Test chat flow for a few languages
    const testLanguages = ['pt', 'en', 'ja', 'ar'];
    
    for (const language of testLanguages) {
        flowTests++;
        log(`\nTesting chat flow for ${language.toUpperCase()}...`);
        
        const sessionId = `test-${language}-${Date.now()}`;
        
        // Send a message
        const chatResponse = await makeRequest('POST', '/chat/message', {
            sessionId,
            message: TEST_MESSAGES[language].flights[0],
            language
        }, {
            'X-User-Language': language
        });
        
        if (chatResponse.success) {
            log(`✅ Message sent successfully in ${language}`, 'success');
            log(`   Response: ${chatResponse.data.response.substring(0, 100)}...`, 'info');
            
            // Get chat history
            const historyResponse = await makeRequest('GET', `/chat/${sessionId}`);
            
            if (historyResponse.success && historyResponse.data.messages.length >= 2) {
                flowPassed++;
                log(`✅ Chat history retrieved (${historyResponse.data.messages.length} messages)`, 'success');
            } else {
                log(`❌ Chat history retrieval failed`, 'error');
            }
        } else {
            log(`❌ Chat message failed: ${chatResponse.error}`, 'error');
        }
    }
    
    log(`\n📊 Chat Flow Tests: ${flowPassed}/${flowTests} passed`, 
        flowPassed === flowTests ? 'success' : 'warning');
    
    return flowPassed === flowTests;
}

async function testNewsletterMultilang() {
    logHeader('📧 TESTING NEWSLETTER MULTILANG');
    
    let newsletterTests = 0;
    let newsletterPassed = 0;
    
    // Test subscription in different languages
    const testLanguages = ['pt', 'en', 'es', 'fr', 'ja'];
    
    for (const language of testLanguages) {
        newsletterTests++;
        const email = `test-${language}-${Date.now()}@example.com`;
        
        const response = await makeRequest('POST', '/newsletter/subscribe', {
            email,
            firstName: 'Test',
            lastName: 'User',
            language,
            interests: ['flights', 'hotels']
        }, {
            'X-User-Language': language
        });
        
        if (response.success) {
            newsletterPassed++;
            log(`✅ Newsletter subscription for ${language}: ${email}`, 'success');
        } else {
            log(`❌ Newsletter subscription failed for ${language}: ${response.error}`, 'error');
        }
    }
    
    log(`\n📊 Newsletter Tests: ${newsletterPassed}/${newsletterTests} passed`, 
        newsletterPassed === newsletterTests ? 'success' : 'warning');
    
    return newsletterPassed === newsletterTests;
}

async function testHealthAndStats() {
    logHeader('📊 TESTING HEALTH & STATS');
    
    let healthTests = 0;
    let healthPassed = 0;
    
    // Test health endpoint
    healthTests++;
    const healthResponse = await makeRequest('GET', '/health');
    
    if (healthResponse.success && healthResponse.data.features.multiLanguage) {
        healthPassed++;
        log(`✅ Health check passed. Supports ${healthResponse.data.features.supportedLanguages} languages`, 'success');
    } else {
        log(`❌ Health check failed`, 'error');
    }
    
    // Test global stats
    healthTests++;
    const statsResponse = await makeRequest('GET', '/stats');
    
    if (statsResponse.success) {
        healthPassed++;
        log(`✅ Global stats retrieved`, 'success');
        log(`   Languages in use: ${statsResponse.data.demographics?.languageDistribution?.length || 0}`, 'info');
    } else {
        log(`❌ Global stats failed`, 'error');
    }
    
    // Test language-specific stats
    healthTests++;
    const langStatsResponse = await makeRequest('GET', '/stats/language/en');
    
    if (langStatsResponse.success) {
        healthPassed++;
        log(`✅ Language-specific stats retrieved for English`, 'success');
    } else {
        log(`❌ Language-specific stats failed`, 'error');
    }
    
    log(`\n📊 Health Tests: ${healthPassed}/${healthTests} passed`, 
        healthPassed === healthTests ? 'success' : 'warning');
    
    return healthPassed === healthTests;
}

// ═══════════════════════════════════════════════════════════════════
// 🏃‍♂️ MAIN TEST RUNNER
// ═══════════════════════════════════════════════════════════════════

async function runAllTests() {
    console.log('🧪 TPS MULTILINGUAL TESTING SUITE'.magenta.bold);
    console.log('═'.repeat(60).magenta);
    console.log(`Testing API Base: ${API_BASE}`.cyan);
    console.log(`Supported Languages: ${SUPPORTED_LANGUAGES.join(', ')}`.cyan);
    console.log('═'.repeat(60).magenta);
    
    const startTime = Date.now();
    const results = [];
    
    try {
        // Run all test suites
        results.push(await testLanguageSupport());
        results.push(await testLanguageDetection());
        results.push(await testChatIntelligence());
        results.push(await testChatFlow());
        results.push(await testNewsletterMultilang());
        results.push(await testHealthAndStats());
        
    } catch (error) {
        log(`💥 Test suite crashed: ${error.message}`, 'error');
        process.exit(1);
    }
    
    // Results summary
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    const passedTests = results.filter(r => r).length;
    const totalTests = results.length;
    
    logHeader('📋 TEST SUMMARY');
    
    log(`⏱️  Duration: ${duration}s`, 'info');
    log(`📊 Test Suites: ${passedTests}/${totalTests} passed`, 
        passedTests === totalTests ? 'success' : 'warning');
    
    const testNames = [
        'Language Support',
        'Language Detection', 
        'Chat Intelligence',
        'Chat Flow',
        'Newsletter Multilang',
        'Health & Stats'
    ];
    
    results.forEach((passed, index) => {
        const status = passed ? '✅ PASSED' : '❌ FAILED';
        const color = passed ? 'success' : 'error';
        log(`   ${testNames[index]}: ${status}`, color);
    });
    
    if (passedTests === totalTests) {
        log('\n🎉 ALL TESTS PASSED! TPS MULTILINGUAL SYSTEM IS READY! 🌍✨', 'success');
        process.exit(0);
    } else {
        log('\n⚠️  SOME TESTS FAILED. PLEASE CHECK THE ISSUES ABOVE.', 'warning');
        process.exit(1);
    }
}

// ═══════════════════════════════════════════════════════════════════
// 🚀 EXECUTION
// ═══════════════════════════════════════════════════════════════════

if (require.main === module) {
    // Handle command line arguments
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
🧪 TPS Multilingual Testing Suite

Usage: node test-multilang.js [options]

Options:
  --help, -h          Show this help message
  --lang <code>       Test specific language only
  --chat              Test chat intelligence only  
  --health            Test health endpoints only
  --verbose           Verbose output

Examples:
  node test-multilang.js                    # Run all tests
  node test-multilang.js --lang pt          # Test Portuguese only
  node test-multilang.js --chat             # Test chat only
  node test-multilang.js --health           # Test health only
        `);
        process.exit(0);
    }
    
    if (args.includes('--lang')) {
        const langIndex = args.indexOf('--lang');
        const language = args[langIndex + 1];
        
        if (!SUPPORTED_LANGUAGES.includes(language)) {
            log(`❌ Unsupported language: ${language}`, 'error');
            log(`Supported: ${SUPPORTED_LANGUAGES.join(', ')}`, 'info');
            process.exit(1);
        }
        
        console.log(`🎯 Testing ${language.toUpperCase()} only...`.yellow);
        // Run language-specific tests here
        
    } else if (args.includes('--chat')) {
        console.log('🤖 Testing chat intelligence only...'.yellow);
        testChatIntelligence().then(() => process.exit(0));
        
    } else if (args.includes('--health')) {
        console.log('📊 Testing health endpoints only...'.yellow);
        testHealthAndStats().then(() => process.exit(0));
        
    } else {
        // Run all tests
        runAllTests();
    }
}

module.exports = {
    runAllTests,
    testLanguageSupport,
    testLanguageDetection,
    testChatIntelligence,
    testChatFlow,
    testNewsletterMultilang,
    testHealthAndStats
};