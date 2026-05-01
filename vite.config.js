import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    middlewareMode: false,
  },
  // Serve the 'movie video' folder under /videos at dev time
  plugins: [
    react(),
    {
      name: 'serve-movie-videos',
      configureServer(server) {
        const videoDir = path.resolve(__dirname, 'movie video');
        server.middlewares.use('/videos', (req, res, next) => {
          const filePath = path.join(videoDir, decodeURIComponent(req.url));
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const stat = fs.statSync(filePath);
            const fileSize = stat.size;
            const range = req.headers.range;
            if (range) {
              const parts = range.replace(/bytes=/, '').split('-');
              const start = parseInt(parts[0], 10);
              const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
              const chunksize = end - start + 1;
              const file = fs.createReadStream(filePath, { start, end });
              res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'video/x-matroska',
              });
              file.pipe(res);
            } else {
              res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'video/x-matroska',
                'Accept-Ranges': 'bytes',
              });
              fs.createReadStream(filePath).pipe(res);
            }
          } else {
            next();
          }
        });
      },
    },
  ],
});
