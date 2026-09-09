/**
 * Контакты публичной версии без форм. Заполните только эти три поля перед
 * публикацией: номер в международном формате, ссылку WhatsApp и Telegram.
 */
export const contacts = Object.freeze({
  managerName: 'Отдел продаж',
  phone: '+7 985 550-76-79',
  whatsappUrl: 'https://wa.me/79855507679',
  telegramUrl: 'https://t.me/EKATERINAXAB',
  maxUrl: 'https://max.ru/u/f9LHodD0cOLg6I497RJAx7V9x3EbNCLPIIWQU6bF58Y8NrrA2v63La7wSqs',
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
    if (['wa.me', 't.me'].includes(link.hostname)) link.searchParams.set('text', message);
    return link.toString();
  } catch {
    return url;
  }
};
