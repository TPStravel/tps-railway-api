// ═══════════════════════════════════════════════════════════════════
// 🌍 TPS TRANSLATIONS CONFIG - 12 IDIOMAS AVANÇADO
// ═══════════════════════════════════════════════════════════════════
// Configurações culturais, formatos e validações por idioma
// ═══════════════════════════════════════════════════════════════════

const LANGUAGE_CONFIGS = {
    pt: {
        // Português (Brasil)
        locale: 'pt-BR',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        direction: 'ltr',
        flag: '🇧🇷',
        name: 'Português',
        nativeName: 'Português',
        region: 'BR',
        cultural: {
            formality: 'moderate',        // casual, moderate, formal
            greeting: 'warm',             // cold, neutral, warm
            timeFormat: '24h',            // 12h, 24h
            dateFormat: 'DD/MM/YYYY',
            numberFormat: '1.234.567,89',
            phoneFormat: '+55 (11) 99999-9999',
            addressFormat: 'street_number'
        },
        business: {
            workingHours: '09:00-18:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '04-21', '09-07', '10-12', '11-15', '12-25'],
            preferredContact: 'whatsapp',
            decisionMaking: 'relationship-based'
        },
        ai: {
            responseStyle: 'poetic',      // direct, poetic, narrative
            culturalNuances: ['warmth', 'family-oriented', 'personal-touch'],
            avoidTopics: [],
            preferredMetaphors: ['ocean', 'tropical', 'family', 'celebration']
        }
    },

    en: {
        // English (US)
        locale: 'en-US', 
        currency: 'USD',
        timezone: 'America/New_York',
        direction: 'ltr',
        flag: '🇺🇸',
        name: 'English',
        nativeName: 'English',
        region: 'US',
        cultural: {
            formality: 'moderate',
            greeting: 'professional',
            timeFormat: '12h',
            dateFormat: 'MM/DD/YYYY', 
            numberFormat: '1,234,567.89',
            phoneFormat: '+1 (555) 123-4567',
            addressFormat: 'number_street'
        },
        business: {
            workingHours: '09:00-17:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '07-04', '11-28', '12-25'],
            preferredContact: 'email',
            decisionMaking: 'efficiency-based'
        },
        ai: {
            responseStyle: 'direct',
            culturalNuances: ['efficiency', 'individual-focus', 'time-conscious'],
            avoidTopics: [],
            preferredMetaphors: ['journey', 'adventure', 'achievement', 'innovation']
        }
    },

    es: {
        // Español (España)
        locale: 'es-ES',
        currency: 'EUR', 
        timezone: 'Europe/Madrid',
        direction: 'ltr',
        flag: '🇪🇸',
        name: 'Español',
        nativeName: 'Español',
        region: 'ES',
        cultural: {
            formality: 'formal',
            greeting: 'warm',
            timeFormat: '24h',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: '1.234.567,89',
            phoneFormat: '+34 123 456 789',
            addressFormat: 'street_number'
        },
        business: {
            workingHours: '09:00-18:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '01-06', '05-01', '08-15', '10-12', '11-01', '12-06', '12-25'],
            preferredContact: 'phone',
            decisionMaking: 'relationship-based'
        },
        ai: {
            responseStyle: 'poetic',
            culturalNuances: ['passion', 'art-appreciation', 'life-enjoyment'],
            avoidTopics: [],
            preferredMetaphors: ['flamenco', 'passion', 'art', 'heritage']
        }
    },

    fr: {
        // Français (France)
        locale: 'fr-FR',
        currency: 'EUR',
        timezone: 'Europe/Paris', 
        direction: 'ltr',
        flag: '🇫🇷',
        name: 'Français',
        nativeName: 'Français',
        region: 'FR',
        cultural: {
            formality: 'formal',
            greeting: 'refined',
            timeFormat: '24h',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: '1 234 567,89',
            phoneFormat: '+33 1 23 45 67 89',
            addressFormat: 'number_street'
        },
        business: {
            workingHours: '09:00-18:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '05-01', '05-08', '07-14', '08-15', '11-01', '11-11', '12-25'],
            preferredContact: 'email',
            decisionMaking: 'analysis-based'
        },
        ai: {
            responseStyle: 'sophisticated',
            culturalNuances: ['elegance', 'sophistication', 'cultural-refinement'],
            avoidTopics: [],
            preferredMetaphors: ['wine', 'art', 'literature', 'elegance']
        }
    },

    de: {
        // Deutsch (Deutschland)
        locale: 'de-DE',
        currency: 'EUR',
        timezone: 'Europe/Berlin',
        direction: 'ltr', 
        flag: '🇩🇪',
        name: 'Deutsch',
        nativeName: 'Deutsch',
        region: 'DE',
        cultural: {
            formality: 'formal',
            greeting: 'professional',
            timeFormat: '24h',
            dateFormat: 'DD.MM.YYYY',
            numberFormat: '1.234.567,89',
            phoneFormat: '+49 123 456789',
            addressFormat: 'street_number'
        },
        business: {
            workingHours: '08:00-17:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '05-01', '10-03', '12-25', '12-26'],
            preferredContact: 'email',
            decisionMaking: 'process-based'
        },
        ai: {
            responseStyle: 'precise',
            culturalNuances: ['precision', 'quality-focused', 'systematic'],
            avoidTopics: [],
            preferredMetaphors: ['engineering', 'precision', 'mountains', 'tradition']
        }
    },

    it: {
        // Italiano (Italia)
        locale: 'it-IT',
        currency: 'EUR',
        timezone: 'Europe/Rome',
        direction: 'ltr',
        flag: '🇮🇹',
        name: 'Italiano', 
        nativeName: 'Italiano',
        region: 'IT',
        cultural: {
            formality: 'moderate',
            greeting: 'warm',
            timeFormat: '24h',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: '1.234.567,89',
            phoneFormat: '+39 123 456 7890',
            addressFormat: 'street_number'
        },
        business: {
            workingHours: '09:00-18:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '01-06', '04-25', '05-01', '06-02', '08-15', '11-01', '12-08', '12-25', '12-26'],
            preferredContact: 'phone',
            decisionMaking: 'relationship-based'
        },
        ai: {
            responseStyle: 'expressive',
            culturalNuances: ['passion', 'beauty-appreciation', 'family-values'],
            avoidTopics: [],
            preferredMetaphors: ['art', 'renaissance', 'cuisine', 'beauty']
        }
    },

    ja: {
        // 日本語 (Japan)
        locale: 'ja-JP',
        currency: 'JPY',
        timezone: 'Asia/Tokyo',
        direction: 'ltr',
        flag: '🇯🇵',
        name: '日本語',
        nativeName: '日本語',
        region: 'JP',
        cultural: {
            formality: 'formal',
            greeting: 'respectful',
            timeFormat: '24h',
            dateFormat: 'YYYY/MM/DD',
            numberFormat: '1,234,567',
            phoneFormat: '+81 90-1234-5678',
            addressFormat: 'reverse'  // Prefecture, City, District, Number
        },
        business: {
            workingHours: '09:00-18:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '01-02', '01-03', '02-11', '04-29', '05-03', '05-04', '05-05', '07-22', '08-11', '09-23', '10-14', '11-03', '11-23'],
            preferredContact: 'email',
            decisionMaking: 'consensus-based'
        },
        ai: {
            responseStyle: 'harmonious',
            culturalNuances: ['respect', 'harmony', 'attention-to-detail', 'indirectness'],
            avoidTopics: ['direct-confrontation'],
            preferredMetaphors: ['seasons', 'nature', 'tradition', 'zen']
        }
    },

    zh: {
        // 中文 (China)
        locale: 'zh-CN',
        currency: 'CNY',
        timezone: 'Asia/Shanghai',
        direction: 'ltr',
        flag: '🇨🇳', 
        name: '中文',
        nativeName: '中文',
        region: 'CN',
        cultural: {
            formality: 'formal',
            greeting: 'respectful',
            timeFormat: '24h',
            dateFormat: 'YYYY-MM-DD',
            numberFormat: '1,234,567.89',
            phoneFormat: '+86 138 0013 8000',
            addressFormat: 'reverse'
        },
        business: {
            workingHours: '09:00-18:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '02-11', '02-12', '02-13', '04-05', '05-01', '06-22', '09-29', '10-01'],
            preferredContact: 'wechat',
            decisionMaking: 'hierarchy-based'
        },
        ai: {
            responseStyle: 'respectful',
            culturalNuances: ['respect-for-age', 'collective-harmony', 'long-term-thinking'],
            avoidTopics: ['political-sensitive'],
            preferredMetaphors: ['dragons', 'mountains', 'wisdom', 'balance']
        }
    },

    ar: {
        // العربية (Saudi Arabia)
        locale: 'ar-SA',
        currency: 'SAR',
        timezone: 'Asia/Riyadh',
        direction: 'rtl',
        flag: '🇸🇦',
        name: 'العربية',
        nativeName: 'العربية',
        region: 'SA',
        cultural: {
            formality: 'formal',
            greeting: 'generous',
            timeFormat: '12h',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: '1,234,567.89',
            phoneFormat: '+966 50 123 4567',
            addressFormat: 'descriptive'
        },
        business: {
            workingHours: '08:00-16:00',
            workingDays: 'sun-thu',  // Different weekend
            holidays: ['09-23', '02-22'],  // Islamic calendar varies
            preferredContact: 'whatsapp',
            decisionMaking: 'relationship-based'
        },
        ai: {
            responseStyle: 'respectful',
            culturalNuances: ['hospitality', 'respect', 'family-honor', 'generosity'],
            avoidTopics: ['alcohol', 'pork', 'inappropriate-imagery'],
            preferredMetaphors: ['desert', 'hospitality', 'journey', 'heritage']
        }
    },

    ru: {
        // Русский (Russia)
        locale: 'ru-RU',
        currency: 'RUB',
        timezone: 'Europe/Moscow',
        direction: 'ltr',
        flag: '🇷🇺',
        name: 'Русский', 
        nativeName: 'Русский',
        region: 'RU',
        cultural: {
            formality: 'formal',
            greeting: 'reserved',
            timeFormat: '24h',
            dateFormat: 'DD.MM.YYYY',
            numberFormat: '1 234 567,89',
            phoneFormat: '+7 (495) 123-45-67',
            addressFormat: 'street_number'
        },
        business: {
            workingHours: '09:00-18:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '01-02', '01-03', '01-04', '01-05', '01-06', '01-07', '01-08', '02-23', '03-08', '05-01', '05-09', '06-12', '11-04'],
            preferredContact: 'telegram',
            decisionMaking: 'authority-based'
        },
        ai: {
            responseStyle: 'intellectual',
            culturalNuances: ['depth', 'literature-appreciation', 'endurance'],
            avoidTopics: [],
            preferredMetaphors: ['winter', 'literature', 'strength', 'depth']
        }
    },

    ko: {
        // 한국어 (South Korea)
        locale: 'ko-KR',
        currency: 'KRW',
        timezone: 'Asia/Seoul',
        direction: 'ltr',
        flag: '🇰🇷',
        name: '한국어',
        nativeName: '한국어',
        region: 'KR',
        cultural: {
            formality: 'formal',
            greeting: 'respectful',
            timeFormat: '12h',
            dateFormat: 'YYYY.MM.DD',
            numberFormat: '1,234,567',
            phoneFormat: '+82 10-1234-5678',
            addressFormat: 'reverse'
        },
        business: {
            workingHours: '09:00-18:00',
            workingDays: 'mon-fri',
            holidays: ['01-01', '02-11', '02-12', '02-13', '03-01', '05-05', '06-06', '08-15', '09-28', '09-29', '09-30', '10-03', '10-09', '12-25'],
            preferredContact: 'kakaotalk',
            decisionMaking: 'hierarchy-based'
        },
        ai: {
            responseStyle: 'respectful',
            culturalNuances: ['hierarchy-respect', 'innovation', 'hard-work', 'community'],
            avoidTopics: [],
            preferredMetaphors: ['technology', 'perseverance', 'harmony', 'progress']
        }
    },

    hi: {
        // हिन्दी (India) 
        locale: 'hi-IN',
        currency: 'INR',
        timezone: 'Asia/Kolkata',
        direction: 'ltr',
        flag: '🇮🇳',
        name: 'हिन्दी',
        nativeName: 'हिन्दी',
        region: 'IN',
        cultural: {
            formality: 'moderate',
            greeting: 'warm',
            timeFormat: '12h',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: '12,34,567.89',  // Indian numbering system
            phoneFormat: '+91 98765 43210',
            addressFormat: 'descriptive'
        },
        business: {
            workingHours: '09:30-18:30',
            workingDays: 'mon-sat',  // Saturday often half day
            holidays: ['01-26', '08-15', '10-02'],  // Many religious holidays vary
            preferredContact: 'whatsapp',
            decisionMaking: 'relationship-based'
        },
        ai: {
            responseStyle: 'warm',
            culturalNuances: ['spirituality', 'family-values', 'diversity-respect', 'wisdom'],
            avoidTopics: ['beef', 'sensitive-religious'],
            preferredMetaphors: ['rivers', 'spirituality', 'colors', 'festivals']
        }
    }
};

// ═══════════════════════════════════════════════════════════════════
// 🔧 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

const LanguageUtils = {
    // Get language config
    getConfig(languageCode) {
        return LANGUAGE_CONFIGS[languageCode] || LANGUAGE_CONFIGS['en'];
    },

    // Format number according to language
    formatNumber(number, languageCode) {
        const config = this.getConfig(languageCode);
        return new Intl.NumberFormat(config.locale).format(number);
    },

    // Format currency according to language
    formatCurrency(amount, languageCode) {
        const config = this.getConfig(languageCode);
        return new Intl.NumberFormat(config.locale, {
            style: 'currency',
            currency: config.currency
        }).format(amount);
    },

    // Format date according to language
    formatDate(date, languageCode) {
        const config = this.getConfig(languageCode);
        return new Intl.DateTimeFormat(config.locale).format(date);
    },

    // Format time according to language preferences
    formatTime(date, languageCode) {
        const config = this.getConfig(languageCode);
        return new Intl.DateTimeFormat(config.locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: config.cultural.timeFormat === '12h'
        }).format(date);
    },

    // Check if language supports RTL
    isRTL(languageCode) {
        const config = this.getConfig(languageCode);
        return config.direction === 'rtl';
    },

    // Get business hours for language region
    getBusinessHours(languageCode) {
        const config = this.getConfig(languageCode);
        return {
            hours: config.business.workingHours,
            days: config.business.workingDays,
            timezone: config.timezone
        };
    },

    // Check if it's currently business hours in the language region
    isBusinessHours(languageCode) {
        const config = this.getConfig(languageCode);
        const now = new Date();
        const localTime = new Intl.DateTimeFormat('en', {
            timeZone: config.timezone,
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(now);
        
        const [startHour] = config.business.workingHours.split('-')[0].split(':');
        const [endHour] = config.business.workingHours.split('-')[1].split(':');
        const [currentHour] = localTime.split(':');
        
        return currentHour >= startHour && currentHour < endHour;
    },

    // Get cultural-appropriate response style
    getResponseStyle(languageCode) {
        const config = this.getConfig(languageCode);
        return {
            style: config.ai.responseStyle,
            formality: config.cultural.formality,
            nuances: config.ai.culturalNuances,
            metaphors: config.ai.preferredMetaphors
        };
    },

    // Validate phone number format for language
    validatePhone(phone, languageCode) {
        const config = this.getConfig(languageCode);
        // Simplified validation - in production use proper regex
        return phone.includes('+') && phone.length > 10;
    },

    // Get supported languages list
    getSupportedLanguages() {
        return Object.keys(LANGUAGE_CONFIGS).map(code => ({
            code,
            name: LANGUAGE_CONFIGS[code].name,
            nativeName: LANGUAGE_CONFIGS[code].nativeName,
            flag: LANGUAGE_CONFIGS[code].flag,
            direction: LANGUAGE_CONFIGS[code].direction
        }));
    },

    // Get language by region
    getLanguageByRegion(region) {
        return Object.entries(LANGUAGE_CONFIGS)
            .find(([, config]) => config.region === region)?.[0] || 'en';
    }
};

// ═══════════════════════════════════════════════════════════════════
// 🎭 CULTURAL RESPONSE GENERATOR
// ═══════════════════════════════════════════════════════════════════

const CulturalResponseGenerator = {
    // Generate culturally appropriate greeting
    generateGreeting(languageCode, timeOfDay = 'day') {
        const config = LANGUAGE_CONFIGS[languageCode];
        const greetings = {
            pt: {
                morning: '🌅 Bom dia! Como posso tornar sua manhã mais inspiradora?',
                day: '☀️ Boa tarde! Que aventura podemos planejar juntos?',
                evening: '🌙 Boa noite! Vamos desenhar sonhos de viagem?'
            },
            en: {
                morning: '🌅 Good morning! How can I elevate your day with extraordinary experiences?',
                day: '☀️ Good afternoon! What adventure shall we craft together?',
                evening: '🌙 Good evening! Let\'s design your next journey under the stars.'
            },
            ja: {
                morning: '🌅 おはようございます。素晴らしい一日をどのようにお手伝いできましょうか？',
                day: '☀️ こんにちは。どのような特別な体験をお探しですか？',
                evening: '🌙 こんばんは。星空の下での旅を一緒に計画しませんか？'
            },
            ar: {
                morning: '🌅 صباح الخير! كيف يمكنني أن أجعل صباحك أكثر إلهاماً؟',
                day: '☀️ مساء الخير! أي مغامرة يمكننا التخطيط لها معاً؟',
                evening: '🌙 مساء الخير! دعنا نصمم أحلام السفر؟'
            }
            // Add other languages as needed
        };
        
        return greetings[languageCode]?.[timeOfDay] || greetings['en'][timeOfDay];
    },

    // Generate culturally appropriate farewell
    generateFarewell(languageCode) {
        const farewells = {
            pt: '✨ Até logo! Que sua jornada seja repleta de descobertas poéticas.',
            en: '✨ Until we meet again! May your journey be filled with poetic discoveries.',
            ja: '✨ また会いましょう！詩的な発見に満ちた旅でありますように。',
            ar: '✨ إلى اللقاء! عسى أن تكون رحلتك مليئة بالاكتشافات الشاعرية.',
            // Add other languages
        };
        
        return farewells[languageCode] || farewells['en'];
    },

    // Adapt response based on cultural context
    adaptResponse(response, languageCode, context = {}) {
        const config = LANGUAGE_CONFIGS[languageCode];
        
        // Apply cultural nuances
        if (config.ai.culturalNuances.includes('respect')) {
            response = this.addRespectMarkers(response, languageCode);
        }
        
        if (config.ai.culturalNuances.includes('warmth')) {
            response = this.addWarmthMarkers(response, languageCode);
        }
        
        return response;
    },

    addRespectMarkers(response, languageCode) {
        // Add language-specific respect markers
        const respectMarkers = {
            ja: '恐れ入りますが、', // "I'm terribly sorry, but..."
            ko: '죄송하지만, ',    // "I'm sorry, but..."
            hi: 'आपसे विनम्र निवेदन है कि ', // "Respectfully request that..."
        };
        
        const marker = respectMarkers[languageCode];
        return marker ? `${marker}${response}` : response;
    },

    addWarmthMarkers(response, languageCode) {
        // Add warmth expressions
        const warmthMarkers = {
            pt: 'com muito carinho',
            es: 'con mucho cariño', 
            it: 'con molto affetto',
        };
        
        const marker = warmthMarkers[languageCode];
        return marker ? `${response} ${marker}` : response;
    }
};

module.exports = {
    LANGUAGE_CONFIGS,
    LanguageUtils,
    CulturalResponseGenerator
};