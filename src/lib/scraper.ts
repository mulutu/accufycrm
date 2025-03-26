import https from 'https';
import { prisma } from '@/lib/prisma';

if (!process.env.SCRAPING_ANT_API_KEY) {
  throw new Error('SCRAPING_ANT_API_KEY is not defined in environment variables');
}

if (!process.env.SCRAPING_ANT_HOST) {
  throw new Error('SCRAPING_ANT_HOST is not defined in environment variables');
}

const SCRAPING_ANT_API_KEY = process.env.SCRAPING_ANT_API_KEY;
const SCRAPING_ANT_HOST = process.env.SCRAPING_ANT_HOST;

function cleanHtmlContent(html: string): string {
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove style tags and their content
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  
  // Remove comments
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remove meta tags
  html = html.replace(/<meta[^>]*>/gi, '');
  
  // Remove link tags
  html = html.replace(/<link[^>]*>/gi, '');
  
  // Remove img tags
  html = html.replace(/<img[^>]*>/gi, '');
  
  // Remove iframe tags and their content
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  
  // Remove noscript tags and their content
  html = html.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, '');
  
  // Remove form tags and their content
  html = html.replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '');
  
  // Remove button tags and their content
  html = html.replace(/<button\b[^<]*(?:(?!<\/button>)<[^<]*)*<\/button>/gi, '');
  
  // Remove input tags
  html = html.replace(/<input[^>]*>/gi, '');
  
  // Remove select tags and their content
  html = html.replace(/<select\b[^<]*(?:(?!<\/select>)<[^<]*)*<\/select>/gi, '');
  
  // Remove textarea tags and their content
  html = html.replace(/<textarea\b[^<]*(?:(?!<\/textarea>)<[^<]*)*<\/textarea>/gi, '');
  
  // Remove nav tags and their content
  html = html.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
  
  // Remove header tags and their content
  html = html.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
  
  // Remove footer tags and their content
  html = html.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');
  
  // Remove remaining HTML tags
  html = html.replace(/<[^>]*>/g, '');
  
  // Remove JavaScript-like content
  html = html.replace(/translateY:\s*\[[^\]]+\]/g, '');
  html = html.replace(/opacity:\s*\[[^\]]+\]/g, '');
  html = html.replace(/easing:\s*[^;]+/g, '');
  html = html.replace(/duration:\s*\d+/g, '');
  html = html.replace(/delay:\s*[^;]+/g, '');
  html = html.replace(/anime\.stagger\([^)]+\)/g, '');
  html = html.replace(/\[[^\]]+\]/g, '');
  html = html.replace(/\{[^}]+\}/g, '');
  
  // Remove CSS-like content
  html = html.replace(/[a-zA-Z-]+:\s*[^;]+;/g, '');
  html = html.replace(/@[a-zA-Z-]+\s*\{[^}]+\}/g, '');
  html = html.replace(/\.([a-zA-Z0-9_-]+)\s*\{[^}]+\}/g, '');
  html = html.replace(/#([a-zA-Z0-9_-]+)\s*\{[^}]+\}/g, '');
  
  // Remove inline styles
  html = html.replace(/style="[^"]*"/g, '');
  html = html.replace(/style='[^']*'/g, '');
  
  // Remove data attributes
  html = html.replace(/data-[a-zA-Z-]+="[^"]*"/g, '');
  html = html.replace(/data-[a-zA-Z-]+='[^']*'/g, '');
  
  // Decode HTML entities
  html = html.replace(/&nbsp;/g, ' ');
  html = html.replace(/&amp;/g, '&');
  html = html.replace(/&lt;/g, '<');
  html = html.replace(/&gt;/g, '>');
  html = html.replace(/&quot;/g, '"');
  html = html.replace(/&#039;/g, "'");
  
  // Clean up whitespace
  html = html.replace(/\s+/g, ' '); // Replace multiple spaces with single space
  html = html.replace(/\n+/g, '\n'); // Replace multiple newlines with single newline
  html = html.replace(/\t+/g, ' '); // Replace tabs with space
  html = html.replace(/[^\S\r\n]+/g, ' '); // Replace any whitespace with single space
  html = html.trim();
  
  return html;
}

export async function scrapeWebsite(url: string, chatbotId: string, userId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      method: 'GET',
      hostname: SCRAPING_ANT_HOST,
      port: 443,
      path: `/v2/general?url=${encodeURIComponent(url)}&x-api-key=${SCRAPING_ANT_API_KEY}&js_render=true`,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    console.log('Making request to ScrapingAnt with URL:', url);
    console.log('Request options:', {
      ...options,
      path: options.path.replace(SCRAPING_ANT_API_KEY, '[REDACTED]')
    });

    const req = https.request(options, (res) => {
      const responseChunks: Buffer[] = [];

      res.on('data', (chunk) => {
        responseChunks.push(chunk);
      });

      res.on('end', async () => {
        try {
          const body = Buffer.concat(responseChunks).toString();
          console.log('Response status code:', res.statusCode);
          console.log('Response headers:', res.headers);
          console.log('Response body length:', body.length);
          console.log('Response body preview:', body.substring(0, 500));
          
          // Clean and extract text content directly from HTML
          const text = cleanHtmlContent(body);
          
          if (!text) {
            console.error('No text content found after cleaning');
            reject(new Error('No text content found after cleaning'));
            return;
          }

          console.log('Successfully extracted and cleaned content, length:', text.length);
          
          // Split content into chunks of 1000 characters
          const chunkSize = 1000;
          const textChunks = text.match(new RegExp(`.{1,${chunkSize}}`, 'g')) || [];
          
          // Create documents for each chunk
          await Promise.all(
            textChunks.map((chunk, index) => 
              prisma.document.create({
                data: {
                  name: `${url} - Part ${index + 1}`,
                  content: chunk,
                  chatbotId,
                  userId,
                },
              })
            )
          );
          
          console.log('Successfully stored scraped content in database');
          resolve();
        } catch (error) {
          console.error('Error processing response:', error);
          console.error('Raw response:', Buffer.concat(responseChunks).toString());
          reject(new Error('Failed to process response from ScrapingAnt'));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(new Error('Failed to connect to ScrapingAnt'));
    });

    // Set a timeout
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.end();
  });
} 