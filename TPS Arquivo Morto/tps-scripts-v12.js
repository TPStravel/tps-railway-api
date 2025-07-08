
// 🌍 TPS Scripts V12 – COMPLETO COM 12 IDIOMAS

const idiomaAtual = new URLSearchParams(window.location.search).get("lang") || "pt";

// Blocos multilíngues
const tpsScripts = {
  abertura: {
    pt: ["🌍 Se você pudesse acordar em qualquer lugar do mundo amanhã, onde seria... e o que faria primeiro ao chegar lá?"],
    en: ["🌍 If you could wake up anywhere in the world tomorrow, where would it be and what would you do first?"],
    es: ["🌍 Si pudieras despertar en cualquier lugar del mundo mañana, ¿dónde sería y qué harías primero?"],
    fr: ["🌍 Si vous pouviez vous réveiller n'importe où demain, où serait-ce et que feriez-vous en premier ?"],
    de: ["🌍 Wenn du morgen irgendwo aufwachen könntest, wo wäre das und was würdest du als Erstes tun?"],
    it: ["🌍 Se potessi svegliarti ovunque domani, dove sarebbe e cosa faresti per prima?"],
    ko: ["🌍 내일 세상 어디에서든 깨어날 수 있다면, 어디이고 무엇을 가장 먼저 하시겠어요?"],
    ja: ["🌍 明日世界のどこかで目覚められるとしたら、どこで何を最初にしますか？"],
    zh: ["🌍 如果你明天可以在世界任何地方醒来，你会选择哪里？你首先会做什么？"],
    ru: ["🌍 Если бы вы могли проснуться где угодно завтра, где бы это было и что бы вы сделали сначала?"],
    ar: ["🌍 إذا استطعت الاستيقاظ في أي مكان في العالم غدًا، فأين سيكون وماذا ستفعل أولاً؟"],
    hi: ["🌍 अगर आप कल दुनिया में कहीं भी जाग सकें, तो वह कहाँ होगा और आप सबसे पहले क्या करेंगे?"]
  },
  followupViagem: {
    pt: ["🔄 Essa viagem é só de ida ou você já tem data para voltar também?", "🛏️ Já pensou no tipo de hospedagem que prefere? Posso sugerir hotéis com base no seu estilo.", "🚘 Você vai precisar de aluguel de carro no destino?", "🛡️ Deseja incluir seguro com cobertura internacional? Posso buscar opções com bom custo-benefício."],
    en: ["🔄 Is this a one-way trip or do you already have a return date?", "🛏️ Have you thought about the type of accommodation you prefer?", "🚘 Will you need a rental car at your destination?", "🛡️ Would you like to include international travel insurance?"],
    es: ["🔄 ¿Este viaje es solo de ida o ya tienes fecha de regreso?", "🛏️ ¿Has pensado en el tipo de alojamiento que prefieres?", "🚘 ¿Necesitarás alquilar un coche en el destino?", "🛡️ ¿Quieres incluir un seguro de viaje internacional?"],
    fr: ["🔄 Ce voyage est-il aller simple ou avez-vous une date de retour ?", "🛏️ Avez-vous pensé au type d’hébergement que vous préférez ?", "🚘 Aurez-vous besoin d'une voiture de location ?", "🛡️ Voulez-vous inclure une assurance voyage ?"],
    de: ["🔄 Ist das eine einfache Reise oder haben Sie ein Rückreisedatum?", "🛏️ Haben Sie an die gewünschte Unterkunft gedacht?", "🚘 Benötigen Sie einen Mietwagen?", "🛡️ Möchten Sie eine Reiseversicherung hinzufügen?"],
    it: ["🔄 È un viaggio di sola andata o hai già una data di ritorno?", "🛏️ Hai pensato al tipo di alloggio che preferisci?", "🚘 Hai bisogno di un'auto a noleggio?", "🛡️ Vuoi includere un'assicurazione di viaggio?"],
    ko: ["🔄 편도 여행인가요, 아니면 귀국 날짜도 정해졌나요?", "🛏️ 어떤 숙박 유형을 원하시나요?", "🚘 렌터카가 필요하신가요?", "🛡️ 해외여행 보험도 포함할까요?"],
    ja: ["🔄 これは片道旅行ですか、それとも帰りの日付は決まっていますか？", "🛏️ 宿泊のタイプはお決まりですか？", "🚘 現地でレンタカーが必要ですか？", "🛡️ 海外旅行保険を追加しますか？"],
    zh: ["🔄 这是单程旅行还是已经有回程日期？", "🛏️ 你有考虑过住宿类型吗？", "🚘 你需要在目的地租车吗？", "🛡️ 要不要添加国际旅行保险？"],
    ru: ["🔄 Это путешествие в один конец или у вас есть дата возвращения?", "🛏️ Какой тип проживания вы предпочитаете?", "🚘 Вам понадобится арендованный автомобиль?", "🛡️ Хотите добавить туристическую страховку?"],
    ar: ["🔄 هل هذه رحلة باتجاه واحد أم أن لديك تاريخ عودة؟", "🛏️ هل فكرت في نوع الإقامة التي تفضلها؟", "🚘 هل ستحتاج إلى سيارة مستأجرة في وجهتك؟", "🛡️ هل ترغب في تضمين تأمين السفر الدولي؟"],
    hi: ["🔄 क्या यह केवल एक तरफ़ा यात्रा है या आपने वापसी की तारीख तय की है?", "🛏️ आपने किस प्रकार की आवास की योजना बनाई है?", "🚘 क्या आपको किराए की कार की आवश्यकता होगी?", "🛡️ क्या आप अंतर्राष्ट्रीय यात्रा बीमा शामिल करना चाहेंगे?"]
  }
};

// Função que retorna frases com base no idioma atual
function pegarFrase(categoria) {
  const blocos = tpsScripts[categoria];
  if (!blocos) return null;
  return blocos[idiomaAtual] || blocos["pt"];
}

// Função principal de engajamento multilíngue
function verificarEngajamento(msg) {
  const texto = msg.toLowerCase();

  if (texto.includes("não sei") || texto.includes("anywhere") || texto.includes("qualquer lugar")) {
    const frases = pegarFrase("abertura");
    return frases[Math.floor(Math.random() * frases.length)];
  }

  if (texto.includes("viajar") || texto.includes("plan") || texto.includes("planejar")) {
    const frases = pegarFrase("followupViagem");
    return frases[Math.floor(Math.random() * frases.length)];
  }

  return null;
}
