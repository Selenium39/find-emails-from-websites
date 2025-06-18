# 网站邮箱提取器

[English](README.md) | 中文

一个基于 Next.js 和 Firecrawl 的网站邮箱地址提取工具。

## 功能特点

- 🌐 输入任何网站URL，自动提取其中的邮箱地址
- 🔍 智能过滤无效邮箱格式
- 📊 **双模式提取**：快速模式和深度模式，满足不同需求
- 📋 一键复制单个或全部邮箱地址
- 💾 导出邮箱列表为TXT文件
- 📱 响应式设计，支持移动端
- 🎨 现代化UI界面

## 技术栈

- **Next.js 15** - React全栈框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 现代化样式
- **Firecrawl** - 网页内容抓取
- **React Icons** - 图标库

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件并添加必要的API密钥：

```
# Firecrawl API配置
FIRECRAWL_API_KEY=your_firecrawl_api_key_here

# Cloudflare Turnstile配置
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key_here
TURNSTILE_SECRET_KEY=your_turnstile_secret_key_here
```

**获取API密钥：**

**Firecrawl API 密钥：**
1. 访问 [Firecrawl官网](https://www.firecrawl.dev/)
2. 注册账号并获取API密钥

**Cloudflare Turnstile 密钥：**
1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Turnstile" 部分
3. 创建新的站点，获取 Site Key 和 Secret Key
4. Site Key 用于前端（NEXT_PUBLIC_TURNSTILE_SITE_KEY）
5. Secret Key 用于后端验证（TURNSTILE_SECRET_KEY）

### 3. 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用方法

1. 在输入框中输入要分析的网站URL
2. 选择提取模式：
   - **🚀 快速模式**：只分析当前页面，速度快（推荐）
   - **🔍 深度模式**：分析当前页面及相关链接页面，覆盖更全面
3. 点击"提取邮箱地址"按钮
4. 等待分析完成，查看提取的邮箱列表
5. 可以：
   - 点击复制按钮复制单个邮箱
   - 点击"复制全部"按钮复制所有邮箱
   - 点击"下载为TXT"按钮下载邮箱列表

## API 接口

### POST /api/extract-emails

提取网站中的邮箱地址。

**请求体：**
```json
{
  "url": "https://example.com",
  "crawlMode": "fast",
  "turnstileToken": "turnstile_response_token"
}
```

**参数说明：**
- `url` (必填): 要分析的网站URL
- `crawlMode` (可选): 提取模式，默认为 "fast"
  - `"fast"`: 快速模式，仅分析当前页面
  - `"deep"`: 深度模式，分析当前页面及相关链接页面（最多10个页面，深度2）
- `turnstileToken` (必填): Cloudflare Turnstile验证码token

**响应：**
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

## 邮箱提取算法

该工具使用以下方法提取邮箱：

1. **网页抓取**：使用 Firecrawl 获取网页的 HTML 和 Markdown 内容
2. **正则匹配**：使用正则表达式 `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g` 匹配邮箱格式
3. **智能过滤**：过滤掉图片文件、垃圾邮箱等无效地址
4. **去重排序**：移除重复邮箱并按字母顺序排列

## 部署方式

### Docker 部署（推荐）

```bash
# 1. 创建环境变量文件
cp .env.example .env.local

# 2. 编辑环境变量
nano .env.local

# 3. 启动应用
docker-compose up -d

# 4. 查看日志
docker-compose logs -f
```

### Vercel 部署

1. 将项目推送到 GitHub 仓库
2. 访问 [Vercel](https://vercel.com) 并导入项目
3. 在项目设置中添加环境变量：
   - `FIRECRAWL_API_KEY`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - `TURNSTILE_SECRET_KEY`
4. 点击部署

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。 