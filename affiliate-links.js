// affiliate-links.js
// 💰 Módulo de Links Afiliados - Melhor das 4 IAs

const AFFILIATE_CONFIG = {
  marker: "639764",
  trs: "425649", 
  currency: "BRL",
  language: "pt"
};

const PARTNER_CONFIGS = {
  tripcom: {
    name: "Trip.com",
    url: "https://tp.media/r",
    params: { marker: AFFILIATE_CONFIG.marker, p: "2965" },
    generateDeepLink: (origin, destination, date) => 
      `https://trip.com/flights/${origin.toLowerCase()}-${destination.toLowerCase()}-${date.replace(/-/g, '')}/?dcity=${origin}&acity=${destination}&date=${date}`
  },
  booking: {
    name: "Booking.com", 
    url: "https://www.awin1.com/cread.php",
    params: { awinmid: "18119", awinaffid: "1949091" },
    generateDeepLink: (city, checkin, checkout) =>
      `https://booking.com/searchresults.pt-br.html?ss=${encodeURIComponent(city)}&checkin=${checkin}&checkout=${checkout}`
  }
};

// Função principal para gerar links afiliados
export function generateAffiliateLinks(intent, params) {
  const links = [];
  
  try {
    // Gerar link para voos
    if (intent.service === 'flight' && params.origin && params.destination && params.date) {
      const partner = PARTNER_CONFIGS.tripcom;
      const deepLink = partner.generateDeepLink(params.origin, params.destination, params.date);
      
      const finalUrl = new URL(partner.url);
      Object.entries(partner.params).forEach(([key, value]) => {
        finalUrl.searchParams.append(key, value);
      });
      finalUrl.searchParams.append('u', encodeURIComponent(deepLink));
      
      links.push({
        name: partner.name,
        url: finalUrl.toString(),
        description: `Voo ${params.origin} → ${params.destination}`
      });
    }
    
    // Gerar link para hotéis
    if (intent.service === 'hotel' && params.city && params.checkin && params.checkout) {
      const partner = PARTNER_CONFIGS.booking;
      const deepLink = partner.generateDeepLink(params.city, params.checkin, params.checkout);
      
      const finalUrl = new URL(partner.url);
      Object.entries(partner.params).forEach(([key, value]) => {
        finalUrl.searchParams.append(key, value);
      });
      finalUrl.searchParams.append('p', encodeURIComponent(deepLink));
      
      links.push({
        name: partner.name,
        url: finalUrl.toString(),
        description: `Hotel em ${params.city}`
      });
    }
    
    // Fallback garantido se nenhum link for gerado
    if (links.length === 0) {
      links.push({
        name: "Trip.com",
        url: "https://trip.com",
        description: "Explore opções de viagem"
      });
    }
    
  } catch (error) {
    console.error('Error generating affiliate links:', error);
    // Fallback de emergência
    links.push({
      name: "Trip.com",
      url: "https://trip.com",
      description: "Busque sua viagem ideal"
    });
  }
  
  return links;
}

// Para CommonJS (compatibilidade)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateAffiliateLinks };
}