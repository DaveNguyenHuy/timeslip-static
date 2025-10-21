#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const fse = require('fs');
require('dotenv').config();

const root = __dirname;

function renderToFile(templateFile, context, outPath) {
  const templateSource = fs.readFileSync(path.join(root, templateFile), 'utf8');
  const compile = handlebars.compile(templateSource, { noEscape: true });
  const html = compile(context);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Wrote ${outPath}`);
}

function rimrafDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src)) {
    const s = path.join(src, entry);
    const d = path.join(dest, entry);
    const stat = fs.statSync(s);
    if (stat.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main() {
  const API_BASE_URL = process.env.API_BASE_URL || 'https://security.ecopunch.vn/api/v1/public';
  const distDir = path.join(root, 'dist');
  // 1) clean dist
  rimrafDir(distDir);
  ensureDir(distDir);
  const outputs = [
    { ctx: { isMain: true, isPartner: false, apiBaseUrl: API_BASE_URL }, out: path.join(root, 'dist/prime_timeslip.html') },
    { ctx: { isMain: false, isPartner: true, apiBaseUrl: API_BASE_URL }, out: path.join(root, 'dist/partner_timeslip.html') },
  ];

  outputs.forEach(({ ctx, out }) => {
    renderToFile('template.hbs', ctx, out);
  });

  // 2) copy assets
  const assetsSrc = path.join(root, 'assets');
  if (fs.existsSync(assetsSrc)) {
    copyDir(assetsSrc, path.join(distDir, 'assets'));
    console.log('Copied assets -> dist/assets');
  }
}

main();


