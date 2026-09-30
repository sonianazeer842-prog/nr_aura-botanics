import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function imageApiPlugin(): Plugin {
  return {
    name: 'image-api-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
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
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Saved to disk successfully' }));
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
