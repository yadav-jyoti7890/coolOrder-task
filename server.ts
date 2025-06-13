import { APP_BASE_HREF } from '@angular/common';
import { renderApplication } from '@angular/platform-server';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import bootstrap from './src/main.server';

const app = express();
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');
const indexHtmlPath = join(browserDistFolder, 'index.html');

app.get('*.*', express.static(browserDistFolder, {
  maxAge: '1y'
}));

app.get('*', async (req, res, next) => {
  try {
    const html = await renderApplication(bootstrap, {
      document: readFileSync(indexHtmlPath).toString(),
      url: req.originalUrl,
      platformProviders: [
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    });
    res.send(html);
  } catch (err) {
    next(err);
  }
});

const port = process.env['PORT'] || 4000;
app.listen(port, () => {
  console.log(`Node Express server listening on http://localhost:${port}`);
});
