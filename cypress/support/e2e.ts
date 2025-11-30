// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import '@cypress/grep';
import 'cypress-mochawesome-reporter/register';
// @ts-ignore mochawesome lacks types
import addContext from 'mochawesome/addContext';

Cypress.on('test:after:run', (test, runnable) => {
  const browser = Cypress.browser;
  const labelParts = [
    browser?.displayName || browser?.name,
    browser?.version ? `(${browser.version})` : '',
  ].filter(Boolean);

  const titlePath = typeof runnable?.titlePath === 'function' ? runnable.titlePath() : [];
  const fullTitle = Array.isArray(titlePath) ? titlePath.join(' -- ') : test.title;
  const tags = fullTitle.match(/@\w+/g);
  const safeTitle = (typeof runnable?.fullTitle === 'function' ? runnable.fullTitle() : fullTitle || test.title || 'test')
    .replace(/[\\/:*?"<>|]/g, '_');

  addContext({ test }, `Browser: ${labelParts.join(' ')}`);
  addContext({ test }, `Spec: ${Cypress.spec.name}`);
  addContext({ test }, `Duration: ${test.duration}ms, Retries: ${test.currentRetry}`);
  if (tags?.length) addContext({ test }, `Tags: ${tags.join(', ')}`);
  if (Cypress.env('ENV')) addContext({ test }, `ENV: ${Cypress.env('ENV')}`);

  // Enlaza la captura tomada en afterEach (exito o fallo)
  const screenshotsFolder = Cypress.config('screenshotsFolder');
  if (screenshotsFolder && Cypress.spec.name) {
    const screenshotPath = `${screenshotsFolder}/${Cypress.spec.name}/${safeTitle}.png`;
    addContext({ test }, `Screenshot: ${screenshotPath}`);
  }
});

// Toma un screenshot en cada test (exito o fallo) con un nombre seguro
afterEach(function () {
  const testTitle = this.currentTest?.fullTitle?.() || this.currentTest?.title || 'test';
  const safeTitle = testTitle.replace(/[\\/:*?"<>|]/g, '_');
  cy.screenshot(safeTitle, { capture: 'runner' });
});
