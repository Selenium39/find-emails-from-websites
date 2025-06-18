# Website Email Extractor

English | [中文](README.zh.md)

A website email address extraction tool based on Next.js and Firecrawl.

## Features

- 🌐 Enter any website URL to automatically extract email addresses
- 🔍 Intelligent filtering of invalid email formats
- 📊 **Dual extraction modes**: Fast mode and Deep mode for different needs
- 📋 One-click copy for individual or all email addresses
- 💾 Export email list as TXT file
- 📱 Responsive design with mobile support
- 🎨 Modern UI interface

## Tech Stack

- **Next.js 15** - React full-stack framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Modern styling
- **Firecrawl** - Web content scraping
- **React Icons** - Icon library

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file and add the necessary API keys:

```
# Firecrawl API Configuration
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Cloudflare Turnstile Configuration
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here
```

**Getting API Keys:**

**Firecrawl API Key:**
1. Visit [Firecrawl website](https://www.firecrawl.dev/)
2. Register an account and obtain API key

**Cloudflare Turnstile Keys:**
1. Visit [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to "Turnstile" section
3. Create a new site and get Site Key and Secret Key
4. Site Key is for frontend (NEXT_PUBLIC_TURNSTILE_SITE_KEY)
5. Secret Key is for backend verification (TURNSTILE_SECRET_KEY)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage

1. Enter the website URL you want to analyze in the input field
2. Select extraction mode:
   - **🚀 Fast Mode**: Analyze current page only, faster (recommended)
   - **🔍 Deep Mode**: Analyze current page and related linked pages for more comprehensive coverage
3. Click "Extract Email Addresses" button
4. Wait for analysis to complete and view the extracted email list
5. You can:
   - Click copy button to copy individual emails
   - Click "Copy All" button to copy all emails
   - Click "Download as TXT" button to download the email list

## API Reference

### POST /api/extract-emails

Extract email addresses from a website.

**Request Body:**
```json
{
  "url": "https://example.com",
  "crawlMode": "fast",
  "turnstileToken": "turnstile_response_token"
}
```

**Parameters:**
- `url` (required): Website URL to analyze
- `crawlMode` (optional): Extraction mode, defaults to "fast"
  - `"fast"`: Fast mode, analyze current page only
  - `"deep"`: Deep mode, analyze current page and related linked pages (max 10 pages, depth 2)
- `turnstileToken` (required): Cloudflare Turnstile verification token

**Response:**
```json
{
  "success": true,
  "url": "https://example.com",
  "emails": ["contact@example.com", "info@example.com"],
  "count": 2,
  "title": "Example Website",
  "crawlMode": "fast",
  "pagesCrawled": 1
}
```

## Email Extraction Algorithm

This tool uses the following methods to extract emails:

1. **Web Scraping**: Use Firecrawl to get HTML and Markdown content from web pages
2. **Regex Matching**: Use regex pattern `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g` to match email formats
3. **Smart Filtering**: Filter out image files, spam emails, and other invalid addresses
4. **Deduplication & Sorting**: Remove duplicate emails and sort alphabetically

## Deployment

### Docker Deployment (Recommended)

```bash
# 1. Create environment variables file
cp .env.example .env.local

# 2. Edit environment variables
nano .env.local

# 3. Start application
docker-compose up -d

# 4. View logs
docker-compose logs -f
```

### Vercel Deployment

1. Push your project to a GitHub repository
2. Visit [Vercel](https://vercel.com) and import your project
3. Add environment variables in project settings:
   - `FIRECRAWL_API_KEY`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
4. Click deploy

## License

MIT License

## Contributing

Issues and Pull Requests are welcome!

## Contact

For questions or suggestions, please contact us through GitHub Issues.
