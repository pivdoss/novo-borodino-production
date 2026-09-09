/**
 * Контакты публичной версии без форм. Заполните только эти три поля перед
 * публикацией: номер в международном формате и ссылки на мессенджеры.
 */
export const contacts = Object.freeze({
  managerName: 'Отдел продаж',
  phone: '+7 985 550-76-79',
  whatsappUrl: 'https://wa.me/qr/LJ2PJX2QVCAUF1',
  telegramUrl: 'https://t.me/EKATERINAXAB',
  maxUrl: 'https://max.ru/u/f9LHodD0cOIKyq_lGjltM2c8n8brktf8TcPF8ScEJBo2TlSHtoIMWxoL8Vc',
});

export const hasContact = (type) => Boolean(contacts[type]?.trim());

export const phoneHref = hasContact('phone') ? `tel:${contacts.phone.replace(/[^\d+]/g, '')}` : '';

export const offerMessage = (offer = '') => offer
  ? `Здравствуйте! Меня интересует: ${offer}.`
  : 'Здравствуйте! Меня интересует предложение «Новое Бородино».';

export const withOfferMessage = (url, offer = '') => {
  if (!url) return '';
  const message = offerMessage(offer);
  try {
    const link = new URL(url);
    // QR links are provided by WhatsApp as complete redirect URLs and must
    // stay unchanged. A prefilled message is supported only for direct phone
    // links; Telegram keeps its current prefilled-message behavior.
    if (link.hostname === 't.me' || (link.hostname === 'wa.me' && /^\/\d+$/.test(link.pathname))) {
      link.searchParams.set('text', message);
    }
    return link.toString();
  } catch {
    return url;
  }
};
