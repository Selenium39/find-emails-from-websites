import { NextRequest, NextResponse } from 'next/server';

// 从内容中提取邮箱的函数
function extractEmailsFromContent(content: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emailMatches = content.match(emailRegex) || [];
  
  // 去重并过滤无效邮箱
  const uniqueEmails = [...new Set(emailMatches)]
    .filter(email => {
      // 过滤一些常见的无效邮箱模式
      const invalidPatterns = [
        /\.(png|jpg|jpeg|gif|svg|css|js|pdf)$/i,
        /^(no-reply|noreply|donotreply)@/i,
        /example\.(com|org)/i
      ];
      return !invalidPatterns.some(pattern => pattern.test(email));
    })
    .sort();
    
  return uniqueEmails;
}

// 验证Turnstile token的函数
async function verifyTurnstileToken(token: string, ip: string, secretKey: string): Promise<boolean> {
  // 开发环境跳过验证
  if (process.env.NODE_ENV === 'development') {
    console.log('Development mode: Skipping Turnstile verification');
    return true;
  }

  if (!secretKey) {
    console.error('Missing Turnstile secret key');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
        remoteip: ip,
      }),
    });

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Failed to verify Turnstile token:', error);
    return false;
  }
}

// 使用 Firecrawl API 提取邮箱
async function extractEmailsWithFirecrawl(url: string, crawlMode: string, apiKey: string) {
  let allEmails: string[] = [];
  let pageTitle = 'Unknown Title';
  let pagesCrawled = 1;

  if (crawlMode === 'fast') {
    // 单页面抓取
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        timeout: 30000
      })
    });

    const scrapeResult = await response.json();

    if (!scrapeResult.success) {
      throw new Error(scrapeResult.error || 'Unable to scrape webpage content');
    }

    const markdownContent = scrapeResult.data?.markdown || '';
    const htmlContent = scrapeResult.data?.html || '';
    const allContent = markdownContent + ' ' + htmlContent;
    
    allEmails = extractEmailsFromContent(allContent);
    pageTitle = scrapeResult.data?.metadata?.title || 'Unknown Title';
    
  } else {
    // 深度模式：多页面爬取
    const response = await fetch('https://api.firecrawl.dev/v1/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        maxDepth: 2,
        limit: 10,
        scrapeOptions: {
          formats: ['markdown'],
          timeout: 60000
        }
      })
    });

    const crawlResult = await response.json();

    if (!crawlResult.success) {
      throw new Error(crawlResult.error || 'Unable to perform deep crawling');
    }

    // 处理爬取结果
    const crawledPages = crawlResult.data || [];
    pagesCrawled = crawledPages.length;
    
    // 从第一个页面获取标题
    if (crawledPages.length > 0) {
      pageTitle = crawledPages[0].metadata?.title || 'Unknown Title';
    }

    // 从所有页面中提取邮箱
    const allContent = crawledPages
      .map((page: { markdown?: string; html?: string }) => (page.markdown || '') + ' ' + (page.html || ''))
      .join(' ');
    
    allEmails = extractEmailsFromContent(allContent);
  }

  return {
    success: true,
    url,
    title: pageTitle,
    emails: allEmails,
    count: allEmails.length,
    pagesCrawled,
    crawlMode
  };
}

export async function POST(request: NextRequest) {
  try {
    const { url, crawlMode = 'fast', turnstileToken } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'Please provide a valid website URL' }, { status: 400 });
    }

    // 验证Turnstile token（开发环境会自动跳过）
    if (!turnstileToken && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Please complete the captcha verification' }, { status: 400 });
    }

    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Server configuration error: Missing Turnstile secret key' }, { status: 500 });
    }

    const isValidToken = await verifyTurnstileToken(turnstileToken, clientIP, secretKey || '');
    if (!isValidToken) {
      return NextResponse.json({ error: 'Captcha verification failed, please try again' }, { status: 400 });
    }

    // 验证URL格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Please provide a valid URL format' }, { status: 400 });
    }

    // 从环境变量获取Firecrawl API密钥
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Server configuration error: Missing API key' }, { status: 500 });
    }

    // 使用 Firecrawl API 提取邮箱
    const result = await extractEmailsWithFirecrawl(url, crawlMode, apiKey);
    console.log(result);

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error('Error extracting emails:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 