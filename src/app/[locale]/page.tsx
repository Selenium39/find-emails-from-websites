'use client';

import { useState } from 'react';
import { HiMail, HiGlobeAlt, HiSearch, HiClipboard, HiDownload, HiChevronDown, HiLightBulb } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { Turnstile } from '@marsidev/react-turnstile';
import { useTranslations } from 'next-intl';

interface ExtractedEmail {
  success: boolean;
  url: string;
  emails: string[];
  count: number;
  title: string;
  crawlMode?: 'fast' | 'deep';
  pagesCrawled?: number;
}

export default function Home() {
  const t = useTranslations();
  const [url, setUrl] = useState('https://chat-tempmail.com/contact');
  const [crawlMode, setCrawlMode] = useState<'fast' | 'deep'>('fast');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExtractedEmail | null>(null);
  const [error, setError] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  
  // Development mode check
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    // Check captcha (skip in development)
    if (!isDevelopment && !turnstileToken) {
      toast.error(t('errors.captchaRequired'));
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/extract-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, crawlMode, turnstileToken: turnstileToken || 'dev-bypass' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('errors.requestFailed'));
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknownError'));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success(t('results.emailsCopied', { email }));
    } catch (err) {
      console.error('Failed to copy email:', err);
      toast.error(t('results.copyFailed'));
    }
  };

  const copyAllEmails = async () => {
    if (result?.emails) {
      try {
        const emailText = result.emails.join('\n');
        await navigator.clipboard.writeText(emailText);
        toast.success(t('results.allEmailsCopied', { count: result.emails.length }));
      } catch (err) {
        console.error('Failed to copy all emails:', err);
        toast.error(t('results.copyFailed'));
      }
    }
  };

  const downloadEmails = () => {
    if (result?.emails) {
      const emailText = result.emails.join('\n');
      const blob = new Blob([emailText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'emails.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-4">
            <HiMail className="text-5xl text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-800">
              {t('header.title')}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            {t('header.subtitle')}
          </p>
          <div className="flex justify-center">
            <a
              href="https://github.com/Selenium39/find-emails-from-websites"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <FaGithub className="mr-2 text-lg" />
              {t('header.github')}
            </a>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HiGlobeAlt className="text-2xl" />
                {t('form.title')}
              </CardTitle>
              <CardDescription>
                {t('form.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="url" className="text-sm font-medium">
                    {t('form.urlLabel')}
                  </label>
                  <div className="relative">
                    <HiGlobeAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="url"
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder={t('form.urlPlaceholder')}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    {t('form.modeLabel')}
                  </label>
                  <RadioGroup 
                    value={crawlMode} 
                    onValueChange={(value: 'fast' | 'deep') => setCrawlMode(value)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="fast" id="fast" />
                      <div className="flex-1">
                        <label htmlFor="fast" className="flex items-center gap-2 cursor-pointer">
                          <span className="text-lg">🚀</span>
                          <div>
                            <div className="font-medium">{t('form.fastMode.title')}</div>
                            <div className="text-sm text-muted-foreground">{t('form.fastMode.description')}</div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                      <RadioGroupItem value="deep" id="deep" />
                      <div className="flex-1">
                        <label htmlFor="deep" className="flex items-center gap-2 cursor-pointer">
                          <span className="text-lg">🔍</span>
                          <div>
                            <div className="font-medium">{t('form.deepMode.title')}</div>
                            <div className="text-sm text-muted-foreground">{t('form.deepMode.description')}</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Turnstile Captcha */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t('form.captchaLabel')}
                  </label>
                  <div className="flex justify-center">
                    {isDevelopment ? (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                        <p className="text-sm text-yellow-800">
                          🚧 开发模式：验证码已跳过
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                          Development mode: Captcha bypassed
                        </p>
                      </div>
                    ) : (
                      <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                        onSuccess={(token) => setTurnstileToken(token)}
                        onError={() => {
                          setTurnstileToken('');
                          toast.error(t('errors.captchaLoadFailed'));
                        }}
                        onExpire={() => {
                          setTurnstileToken('');
                          toast.warning(t('errors.captchaLoadFailed'));
                        }}
                        options={{
                          theme: 'light',
                          size: 'normal'
                        }}
                      />
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || (!isDevelopment && !turnstileToken)}
                  className="w-full"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('form.extracting')}
                    </>
                  ) : (
                    <>
                      <HiSearch className="mr-2" />
                      {t('form.submitButton')}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('results.title')}</h2>
                  <p className="text-gray-600">{result.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{result.url}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{result.count}</p>
                  <p className="text-sm text-gray-500">{t('results.foundEmails', { count: result.count })}</p>
                  {result.pagesCrawled && result.pagesCrawled > 1 && (
                    <p className="text-xs text-gray-400 mt-1">{t('results.crawlInfo', { mode: result.crawlMode || 'fast', pages: result.pagesCrawled })}</p>
                  )}
                </div>
              </div>

              {result.count > 0 && (
                <>
                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={copyAllEmails}
                      className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition duration-200"
                    >
                      <HiClipboard className="mr-2" />
                      {t('results.copyAll')}
                    </button>
                    <button
                      onClick={downloadEmails}
                      className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition duration-200"
                    >
                      <HiDownload className="mr-2" />
                      {t('results.download')}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {result.emails.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200"
                      >
                        <span className="font-mono text-gray-800">{email}</span>
                        <button
                          onClick={() => copyToClipboard(email)}
                          className="text-blue-600 hover:text-blue-800 transition duration-200"
                          title={t('results.copyEmail')}
                        >
                          <HiClipboard className="text-xl" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {result.count === 0 && (
                <div className="text-center py-8">
                  <HiMail className="text-6xl text-gray-300 mx-auto mb-4" />
                  <p className="text-xl text-gray-500">{t('results.noEmails')}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Use Cases Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HiLightBulb className="text-2xl" />
                {t('useCases.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">{t('useCases.case1.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('useCases.case1.description')}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{t('useCases.case2.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('useCases.case2.description')}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{t('useCases.case3.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('useCases.case3.description')}</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">{t('useCases.case4.title')}</h3>
                  <p className="text-sm text-muted-foreground">{t('useCases.case4.description')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HiMail className="text-2xl" />
                {t('faq.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-accent/50 transition-colors">
                  <span className="font-medium">{t('faq.q1.question')}</span>
                  <HiChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pt-2">
                  <div className="text-sm text-muted-foreground">
                    <p>{t('faq.q1.answer')}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-accent/50 transition-colors">
                  <span className="font-medium">{t('faq.q2.question')}</span>
                  <HiChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pt-2">
                  <div className="text-sm text-muted-foreground">
                    <p>{t('faq.q2.answer')}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-accent/50 transition-colors">
                  <span className="font-medium">{t('faq.q3.question')}</span>
                  <HiChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pt-2">
                  <div className="text-sm text-muted-foreground">
                    <p>{t('faq.q3.answer')}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border p-4 text-left hover:bg-accent/50 transition-colors">
                  <span className="font-medium">{t('faq.q4.question')}</span>
                  <HiChevronDown className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 pt-2">
                  <div className="text-sm text-muted-foreground">
                    <p>{t('faq.q4.answer')}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 py-8 border-t">
          <div className="space-y-3">
            <p className="text-gray-600">
              {t('footer.tempmail')} <a href="https://chat-tempmail.com" className="text-blue-600 hover:underline font-medium ml-1">{t('footer.visit')}</a>
            </p>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} <a href="https://chat-tempmail.com" className="hover:text-blue-600 transition-colors">ChatTempMail</a>. {t('footer.copyright')}.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
