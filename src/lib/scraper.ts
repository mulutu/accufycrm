import https from 'https';

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
  html = html.trim();
  
  return html;
}

export async function scrapeWebsite(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      method: 'GET',
      hostname: SCRAPING_ANT_HOST,
      port: 443,
      path: `/v2/general?url=${encodeURIComponent(url)}&x-api-key=${SCRAPING_ANT_API_KEY}&js_render=true`,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString();
          console.log('Response body:', body); // Debug log
          
          const response = JSON.parse(body);
          
          // Check for API errors
          if (response.error) {
            reject(new Error(`ScrapingAnt API error: ${response.error}`));
            return;
          }

          // Extract content from the response
          if (response.content) {
            // Clean and extract text content
            const text = cleanHtmlContent(response.content);
            
            if (!text) {
              reject(new Error('No text content found after cleaning'));
              return;
            }

            resolve(text);
          } else {
            reject(new Error('No content found in the response'));
          }
        } catch (error) {
          console.error('Error parsing response:', error);
          console.error('Raw response:', Buffer.concat(chunks).toString());
          reject(new Error('Failed to parse response from ScrapingAnt'));
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