import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de'];

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !locales.includes(locale)) {
    locale = 'en'; // fallback to default
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
}); 