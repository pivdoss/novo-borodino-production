/**
 * Контакты публичной версии без форм. Заполните только эти три поля перед
 * публикацией: номер в международном формате и ссылки на мессенджеры.
 */
export const contacts = Object.freeze({
  managerName: 'Отдел продаж',
  phone: '+7 903 777-17-26',
  whatsappUrl: 'https://wa.me/79037771726',
  telegramUrl: 'https://t.me/KPNovoeborodino',
  maxUrl: 'https://max.ru/u/f9LHodD0cOIKyq_lGjltM2c8n8brktf8TcPF8ScEJBo2TlSHtoIMWxoL8Vc',
});

export const hasContact = (type) => Boolean(contacts[type]?.trim());

export const phoneHref = hasContact('phone') ? `tel:${contacts.phone.replace(/[^\d+]/g, '')}` : '';

export const offerMessage = (offer = '') => offer
  ? `Здравствуйте! Меня интересует: ${offer}.`
  : 'Здравствуйте! Меня интересует предложение «Новое Бородино».';

export const withMessage = (url, message = '') => {
  if (!url) return '';
  try {
    const link = new URL(url);
    // Prefilled messages are supported for direct WhatsApp phone links and
    // Telegram links.
    if (link.hostname === 't.me' || (link.hostname === 'wa.me' && /^\/\d+$/.test(link.pathname))) {
      link.searchParams.set('text', message);
    }
    return link.toString();
  } catch {
    return url;
  }
};

export const withOfferMessage = (url, offer = '') => withMessage(url, offerMessage(offer));
