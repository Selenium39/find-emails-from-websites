'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HiGlobeAlt } from 'react-icons/hi';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('language');

  const switchLanguage = (newLocale: string) => {
    // Remove the current locale from the pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    // Add the new locale
    const newPath = `/${newLocale}${pathWithoutLocale}`;
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
      <HiGlobeAlt className="text-gray-600" />
      <Select value={locale} onValueChange={switchLanguage}>
        <SelectTrigger className="w-32 border-none bg-transparent">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t('english')}</SelectItem>
          <SelectItem value="zh">{t('chinese')}</SelectItem>
          <SelectItem value="ja">{t('japanese')}</SelectItem>
          <SelectItem value="ko">{t('korean')}</SelectItem>
          <SelectItem value="es">{t('spanish')}</SelectItem>
          <SelectItem value="fr">{t('french')}</SelectItem>
          <SelectItem value="de">{t('german')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
} 