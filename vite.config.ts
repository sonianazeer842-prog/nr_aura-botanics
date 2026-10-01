import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function imageApiPlugin(): Plugin {
  return {
    name: 'image-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Fast authoritative products.json serving without browser cache
        if (req.method === 'GET' && (req.url === '/products.json' || req.url?.startsWith('/products.json?'))) {
          try {
            const publicProductsPath = path.resolve(__dirname, 'public/products.json');
            const rootProductsPath = path.resolve(__dirname, 'products.json');
            const targetPath = fs.existsSync(publicProductsPath) ? publicProductsPath : rootProductsPath;
            if (fs.existsSync(targetPath)) {
              const content = fs.readFileSync(targetPath, 'utf8');
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
              res.setHeader('Pragma', 'no-cache');
              res.setHeader('Expires', '0');
              res.end(content);
              return;
            }
          } catch (err) {
            console.error('Error serving /products.json:', err);
          }
        }

        if (req.method === 'POST' && req.url === '/api/save-images') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const formatted = JSON.stringify(data, null, 2);
              const publicImagesPath = path.resolve(__dirname, 'public/images.json');
              const rootImagesPath = path.resolve(__dirname, 'images.json');
              fs.writeFileSync(publicImagesPath, formatted, 'utf8');
              fs.writeFileSync(rootImagesPath, formatted, 'utf8');
              const distImagesPath = path.resolve(__dirname, 'dist/images.json');
              if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
                fs.writeFileSync(distImagesPath, formatted, 'utf8');
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Saved to disk successfully' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/save-products') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              const formatted = JSON.stringify(data, null, 2);
              const publicProductsPath = path.resolve(__dirname, 'public/products.json');
              const rootProductsPath = path.resolve(__dirname, 'products.json');
              fs.writeFileSync(publicProductsPath, formatted, 'utf8');
              fs.writeFileSync(rootProductsPath, formatted, 'utf8');
              const distProductsPath = path.resolve(__dirname, 'dist/products.json');
              if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
                fs.writeFileSync(distProductsPath, formatted, 'utf8');
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Products saved to disk successfully' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        if (req.method === 'POST' && req.url === '/api/upload-image') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const { filename, data } = JSON.parse(body);
              if (!filename || !data) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing filename or data' }));
                return;
              }
              const matches = data.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
              const buffer = matches ? Buffer.from(matches[2], 'base64') : Buffer.from(data, 'base64');
              const targetPath = path.resolve(__dirname, 'public', filename);
              fs.writeFileSync(targetPath, buffer);
              if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
                fs.writeFileSync(path.resolve(__dirname, 'dist', filename), buffer);
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, path: `/${filename}` }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), imageApiPlugin()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
