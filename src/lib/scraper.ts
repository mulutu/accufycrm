import https from 'https';

if (!process.env.SCRAPING_ANT_API_KEY) {
  throw new Error('SCRAPING_ANT_API_KEY is not defined in environment variables');
}

if (!process.env.SCRAPING_ANT_HOST) {
  throw new Error('SCRAPING_ANT_HOST is not defined in environment variables');
}

const SCRAPING_ANT_API_KEY = process.env.SCRAPING_ANT_API_KEY;
const SCRAPING_ANT_HOST = process.env.SCRAPING_ANT_HOST;

export async function scrapeWebsite(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      method: 'GET',
      hostname: SCRAPING_ANT_HOST,
      port: null,
      path: `/v2/general?url=${encodeURIComponent(url)}&x-api-key=${SCRAPING_ANT_API_KEY}`,
      headers: {
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];

      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        try {
          const body = Buffer.concat(chunks);
          const response = JSON.parse(body.toString());
          
          // Extract text content from the response
          if (response.content) {
            // Remove HTML tags and clean up the text
            const text = response.content
              .replace(/<[^>]*>/g, '') // Remove HTML tags
              .replace(/\s+/g, ' ') // Replace multiple spaces with single space
              .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
              .trim();
            
            resolve(text);
          } else {
            reject(new Error('No content found in the response'));
          }
        } catch {
          reject(new Error('Failed to parse response'));
        }
      });
    });

    req.on('error', () => {
      reject(new Error('Failed to scrape website content'));
    });

    req.end();
  });
} 