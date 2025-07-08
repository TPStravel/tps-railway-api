// resposta-simbolica.js
// 🎨 Módulo de Respostas Simbólicas e Poéticas para TPS-GPT
// Mensagens emocionais únicas para cada destino em múltiplos idiomas

// ===== BANCO DE MENSAGENS SIMBÓLICAS POR DESTINO =====
const mensagensSimbolicas = {
  
  // 🇫🇷 PARIS - Cidade do Amor e Arte
  paris: {
    pt: `🗼 **Paris te chama com a voz dos poetas...**

Não é apenas uma cidade — é um espelho onde sua alma encontra arte, história e paixão. Cada rua sussurra segredos de amor eterno, cada café guarda conversas que mudaram o mundo.

✨ **Sua jornada parisiense será:**
• Uma dança entre o Louvre e seu coração
• Pôr do sol na Torre Eiffel que tocará sua alma  
• Croissants que são pequenos milagres matinais
• Caminhadas pela Montmartre onde Picasso sonhou

💫 *"Paris não é um lugar, é um sentimento que você leva para sempre."*`,

    en: `🗼 **Paris calls you with the voice of poets...**

It's not just a city — it's a mirror where your soul meets art, history and passion. Every street whispers secrets of eternal love, every café holds conversations that changed the world.

✨ **Your Parisian journey will be:**
• A dance between the Louvre and your heart
• Sunset at the Eiffel Tower that will touch your soul
• Croissants that are small morning miracles  
• Walks through Montmartre where Picasso dreamed

💫 *"Paris is not a place, it's a feeling you carry forever."*`,

    es: `🗼 **París te llama con la voz de los poetas...**

No es solo una ciudad — es un espejo donde tu alma encuentra arte, historia y pasión. Cada calle susurra secretos de amor eterno.

✨ **Tu viaje parisino será:**
• Una danza entre el Louvre y tu corazón
• Atardecer en la Torre Eiffel que tocará tu alma
• Croissants que son pequeños milagros matutinos

💫 *"París no es un lugar, es un sentimiento que llevas para siempre."*`,

    fr: `🗼 **Paris vous appelle avec la voix des poètes...**

Ce n'est pas seulement une ville — c'est un miroir où votre âme rencontre l'art, l'histoire et la passion. Chaque rue murmure des secrets d'amour éternel.

✨ **Votre voyage parisien sera:**
• Une danse entre le Louvre et votre cœur
• Coucher de soleil à la Tour Eiffel qui touchera votre âme

💫 *"Paris n'est pas un lieu, c'est un sentiment que vous portez pour toujours."*`
  },

  // 🇯🇵 TOKYO - Tradição e Futuro
  tokyo: {
    pt: `🌸 **Tóquio é onde tradição dança com o futuro...**

Entre templos milenares e luzes de neon, você descobrirá que a verdadeira viagem é interior. Cada bairro é um universo novo, cada estação uma porta para dimensões paralelas.

✨ **Sua aventura nipônica será:**
• Serenidade no templo Senso-ji ao amanhecer
• Luzes hipnóticas de Shibuya à noite
• Sushi que é arte comestível no Tsukiji  
• Cerejeiras que sussurram haicais ao vento

🎋 *"Em Tóquio, o antigo e o novo não competem — eles dançam."*`,

    en: `🌸 **Tokyo is where tradition dances with the future...**

Between millennial temples and neon lights, you'll discover that the true journey is within. Every neighborhood is a new universe, every station a door to parallel dimensions.

✨ **Your Japanese adventure will be:**
• Serenity at Senso-ji temple at dawn
• Hypnotic lights of Shibuya at night
• Sushi that is edible art at Tsukiji
• Cherry blossoms whispering haikus to the wind

🎋 *"In Tokyo, the ancient and new don't compete — they dance."*`,

    ja: `🌸 **東京は伝統と未来が踊る場所...**

千年の寺院とネオンライトの間で、真の旅は内なる旅だと気づくでしょう。

✨ **あなたの日本の冒険:**
• 浅草寺での夜明けの静寂
• 夜の渋谷の魅惑的な光
• 築地での食べられる芸術のような寿司

🎋 *"東京では、古いものと新しいものは競わない—踊るのです。"*`
  },

  // 🇺🇸 NEW YORK - Cidade dos Sonhos
  'new york': {
    pt: `🗽 **Nova York não dorme, e nem seus sonhos deveriam...**

É uma sinfonia urbana onde cada esquina esconde uma oportunidade. A cidade que transforma visitantes em visionários, turistas em nova-iorquinos de coração.

✨ **Sua odisseia nova-iorquina será:**
• Central Park como oásis no concreto urbano
• Broadway iluminando seus sonhos mais selvagens
• Brooklyn Bridge conectando passado e futuro
• Times Square onde o mundo inteiro se encontra

🌆 *"Nova York não é apenas uma cidade — é um estado de espírito."*`,

    en: `🗽 **New York never sleeps, and neither should your dreams...**

It's an urban symphony where every corner hides an opportunity. The city that transforms visitors into visionaries, tourists into New Yorkers at heart.

✨ **Your New York odyssey will be:**
• Central Park as an oasis in urban concrete
• Broadway illuminating your wildest dreams
• Brooklyn Bridge connecting past and future
• Times Square where the whole world meets

🌆 *"New York is not just a city — it's a state of mind."*`
  },

  // 🇬🇧 LONDON - História Viva
  london: {
    pt: `🎭 **Londres é história viva respirando através da névoa...**

Entre palácios reais e pubs centenários, você caminhará pelos mesmos pavimentos que Shakespeare e Beatles. Cada ponte conta uma história, cada distrito guarda segredos do império.

✨ **Sua saga londrina será:**
• Tower Bridge refletindo séculos de histórias
• Hyde Park onde pensadores mudaram o mundo
• Camden Market pulando com criatividade punk
• Big Ben marcando momentos eternos

👑 *"Em Londres, você não visita a história — você a vive."*`,

    en: `🎭 **London is living history breathing through the mist...**

Between royal palaces and century-old pubs, you'll walk the same pavements as Shakespeare and The Beatles. Every bridge tells a story, every district keeps secrets of the empire.

✨ **Your London saga will be:**
• Tower Bridge reflecting centuries of stories
• Hyde Park where thinkers changed the world
• Camden Market pulsing with punk creativity
• Big Ben marking eternal moments

👑 *"In London, you don't visit history — you live it."*`
  },

  // 🇰🇷 SEOUL - K-Culture e Tradição
  seoul: {
    pt: `🏮 **Seul é onde K-pop encontra tradição milenar...**

Uma metrópole que respira tecnologia, mas seu coração bate com ritmos ancestrais. Entre palácios Joseon e distritos de Gangnam, você descobrirá a Coreia que conquistou o mundo.

✨ **Sua aventura coreana será:**
• Palácio Gyeongbokgung sussurrando histórias reais
• Hongdae vibrando com energia jovem infinita
• Myeongdong brilhando com K-beauty e K-fashion
• Hanbok transformando você em protagonista histórico

🎶 *"Seul não é apenas uma cidade — é um fenômeno cultural global."*`,

    en: `🏮 **Seoul is where K-pop meets millennial tradition...**

A metropolis that breathes technology, but its heart beats with ancestral rhythms. Between Joseon palaces and Gangnam districts, you'll discover the Korea that conquered the world.

✨ **Your Korean adventure will be:**
• Gyeongbokgung Palace whispering royal stories
• Hongdae vibrating with infinite young energy
• Myeongdong shining with K-beauty and K-fashion
• Hanbok transforming you into a historical protagonist

🎶 *"Seoul is not just a city — it's a global cultural phenomenon."*`,

    ko: `🏮 **서울은 K-pop이 천년 전통과 만나는 곳...**

기술을 숨 쉬는 메트로폴리스이지만, 그 심장은 조상의 리듬으로 뛰고 있습니다.

✨ **당신의 한국 모험:**
• 왕실 이야기를 속삭이는 경복궁
• 무한한 젊은 에너지로 진동하는 홍대
• K-뷰티와 K-패션으로 빛나는 명동

🎶 *"서울은 단순한 도시가 아니라 글로벌 문화 현상입니다."*`
  },

  // 🇹🇭 BANGKOK - Caos Organizado
  bangkok: {
    pt: `🛺 **Bangkok é um caos organizado que hipnotiza...**

Entre templos dourados e mercados flutuantes, você mergulhará na Tailândia que sorri com a alma. Cada tuk-tuk é uma aventura, cada prato de rua uma revelação.

✨ **Sua jornada tailandesa será:**
• Wat Pho meditando em dourado ancestral
• Chatuchak explorando tesouros escondidos
• Khao San Road pulsando com energia backpacker
• Rio Chao Phraya navegando pela história viva

🙏 *"Bangkok não se visita — se experimenta com todos os sentidos."*`,

    en: `🛺 **Bangkok is organized chaos that mesmerizes...**

Between golden temples and floating markets, you'll dive into the Thailand that smiles with its soul. Every tuk-tuk is an adventure, every street food a revelation.

✨ **Your Thai journey will be:**
• Wat Pho meditating in ancestral gold
• Chatuchak exploring hidden treasures
• Khao San Road pulsing with backpacker energy
• Chao Phraya River navigating through living history

🙏 *"Bangkok is not visited — it's experienced with all senses."*`
  }
};

// ===== MENSAGENS GENÉRICAS (FALLBACK) =====
const mensagensGenericas = {
  pt: `✈️ **O mundo inteiro é seu destino...**

Cada viagem é uma história esperando para ser escrita. Deixe-me ajudar você a criar memórias que durarão para sempre, transformando simples deslocamentos em jornadas transformadoras.

🌍 **Vamos planejar sua próxima aventura:**
• Destinos que tocam a alma, não apenas os olhos
• Experiências que conectam você com culturas autênticas  
• Momentos que se tornam histórias para contar
• Viagens que transformam quem você é

✨ *"Não coletamos destinos, coletamos versões melhores de nós mesmos."*`,

  en: `✈️ **The whole world is your destination...**

Every trip is a story waiting to be written. Let me help you create memories that will last forever, transforming simple travels into transformative journeys.

🌍 **Let's plan your next adventure:**
• Destinations that touch the soul, not just the eyes
• Experiences that connect you with authentic cultures
• Moments that become stories to tell
• Travels that transform who you are

✨ *"We don't collect destinations, we collect better versions of ourselves."*`,

  es: `✈️ **El mundo entero es tu destino...**

Cada viaje es una historia esperando ser escrita. Déjame ayudarte a crear memorias que durarán para siempre.

🌍 **Planifiquemos tu próxima aventura:**
• Destinos que tocan el alma, no solo los ojos
• Experiencias que te conectan con culturas auténticas

✨ *"No coleccionamos destinos, coleccionamos mejores versiones de nosotros mismos."*`,

  fr: `✈️ **Le monde entier est votre destination...**

Chaque voyage est une histoire qui attend d'être écrite. Laissez-moi vous aider à créer des souvenirs qui dureront pour toujours.

🌍 **Planifions votre prochaine aventure:**
• Des destinations qui touchent l'âme, pas seulement les yeux

✨ *"Nous ne collectionnons pas les destinations, nous collectionnons de meilleures versions de nous-mêmes."*`,

  de: `✈️ **Die ganze Welt ist Ihr Reiseziel...**

Jede Reise ist eine Geschichte, die darauf wartet, geschrieben zu werden. Lassen Sie mich Ihnen helfen, Erinnerungen zu schaffen, die für immer halten.

🌍 **Lassen Sie uns Ihr nächstes Abenteuer planen:**

✨ *"Wir sammeln nicht Reiseziele, wir sammeln bessere Versionen von uns selbst."*`,

  it: `✈️ **Il mondo intero è la tua destinazione...**

Ogni viaggio è una storia che aspetta di essere scritta. Lascia che ti aiuti a creare ricordi che dureranno per sempre.

🌍 **Pianifichiamo la tua prossima avventura:**

✨ *"Non colleziniamo destinazioni, colleziniamo versioni migliori di noi stessi."*`,

  ja: `✈️ **全世界があなたの目的地...**

すべての旅は書かれるのを待っている物語です。永遠に続く思い出を作るお手伝いをします。

🌍 **次の冒険を計画しましょう:**

✨ *"私たちは目的地を集めるのではなく、より良い自分を集めるのです。"*`,

  ko: `✈️ **온 세상이 당신의 목적지...**

모든 여행은 쓰여지기를 기다리는 이야기입니다. 영원히 지속될 추억을 만드는 것을 도와드리겠습니다.

🌍 **다음 모험을 계획해봅시다:**

✨ *"우리는 목적지를 수집하는 것이 아니라, 더 나은 자신을 수집합니다."*`,

  zh: `✈️ **整个世界都是你的目的地...**

每一次旅行都是等待被书写的故事。让我帮助你创造永远持续的回忆。

🌍 **让我们规划你的下一次冒险:**

✨ *"我们不收集目的地，我们收集更好的自己。"*`,

  ru: `✈️ **Весь мир — ваше назначение...**

Каждое путешествие — это история, ожидающая написания. Позвольте мне помочь вам создать воспоминания, которые останутся навсегда.

🌍 **Давайте спланируем ваше следующее приключение:**

✨ *"Мы собираем не направления, а лучшие версии себя."*`,

  ar: `✈️ **العالم كله وجهتك...**

كل رحلة هي قصة تنتظر أن تُكتب. دعني أساعدك في خلق ذكريات ستدوم إلى الأبد.

🌍 **لنخطط لمغامرتك القادمة:**

✨ *"نحن لا نجمع الوجهات، نجمع نسخًا أفضل من أنفسنا."*`,

  hi: `✈️ **पूरी दुनिया आपकी मंजिल है...**

हर यात्रा एक कहानी है जो लिखे जाने की प्रतीक्षा में है। मुझे आपकी यादें बनाने में मदद करने दें जो हमेशा के लिए रहेंगी।

🌍 **आइए अपना अगला रोमांच प्लान करें:**

✨ *"हम गंतव्य नहीं, अपने बेहतर संस्करण इकट्ठे करते हैं।"*`
};

// ===== FUNÇÃO PRINCIPAL: OBTER MENSAGEM SIMBÓLICA =====
function getMensagemSimbolica(destino, lang = 'pt') {
  console.log(`🎨 Gerando mensagem simbólica para: ${destino?.cidade || 'genérico'} (${lang})`);
  
  // Se não há destino específico, retorna mensagem genérica
  if (!destino || !destino.cidade) {
    return getMensagemGenerica(lang);
  }
  
  const cidadeKey = destino.cidade.toLowerCase();
  const mensagemDestino = mensagensSimbolicas[cidadeKey];
  
  // Se não tem mensagem específica para a cidade, usa genérica
  if (!mensagemDestino) {
    console.log(`⚠️ Cidade ${cidadeKey} não encontrada, usando mensagem genérica`);
    return getMensagemGenerica(lang);
  }
  
  // Tenta idioma específico, senão usa português como fallback
  const mensagem = mensagemDestino[lang] || mensagemDestino['pt'] || getMensagemGenerica(lang);
  
  console.log(`✅ Mensagem simbólica gerada para ${cidadeKey} em ${lang}`);
  return mensagem;
}

// ===== FUNÇÃO: OBTER MENSAGEM GENÉRICA =====
function getMensagemGenerica(lang = 'pt') {
  return mensagensGenericas[lang] || mensagensGenericas['pt'];
}

// ===== FUNÇÃO: LISTAR DESTINOS DISPONÍVEIS =====
function getDestinosDisponiveis() {
  return Object.keys(mensagensSimbolicas);
}

// ===== FUNÇÃO: LISTAR IDIOMAS SUPORTADOS =====
function getIdiomasSuportados() {
  return Object.keys(mensagensGenericas);
}

// ===== FUNÇÃO: ADICIONAR NOVA CIDADE (DINÂMICA) =====
function adicionarCidade(cidade, mensagens) {
  const cidadeKey = cidade.toLowerCase();
  mensagensSimbolicas[cidadeKey] = mensagens;
  console.log(`✅ Nova cidade adicionada: ${cidade}`);
  return true;
}

// ===== EXPORTAÇÕES =====
export { 
  getMensagemSimbolica,
  getMensagemGenerica,
  getDestinosDisponiveis,
  getIdiomasSuportados,
  adicionarCidade
};

// Para CommonJS (se necessário)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    getMensagemSimbolica,
    getMensagemGenerica,
    getDestinosDisponiveis,
    getIdiomasSuportados,
    adicionarCidade
  };
}