#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
require('dotenv').config();

const root = __dirname;

function renderToFile(templateFile, context, outPath) {
  const templateSource = fs.readFileSync(path.join(root, templateFile), 'utf8');
  const compile = handlebars.compile(templateSource, { noEscape: true });
  const html = compile(context);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Wrote ${outPath}`);
}

function main() {
  const API_BASE_URL = process.env.API_BASE_URL || 'https://security.ecopunch.vn/api/v1/public';
  const outputs = [
    { ctx: { isMain: true, isPartner: false, apiBaseUrl: API_BASE_URL }, out: path.join(root, 'timeslip_01.html') },
    { ctx: { isMain: false, isPartner: true, apiBaseUrl: API_BASE_URL }, out: path.join(root, 'timeslip_02.html') },
  ];

  outputs.forEach(({ ctx, out }) => {
    renderToFile('template.hbs', ctx, out);
  });
}

main();


