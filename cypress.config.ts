// cypress.config.ts
import { defineConfig } from 'cypress';
import cypressMochawesomeReporter from 'cypress-mochawesome-reporter/plugin';
import { plugin as registerGrep } from '@cypress/grep/plugin';

export default defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'docs/report/raw',
    charts: true,
    reportPageTitle: 'Saucedemo E2E Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    overwrite: false,
    html: false,
    json: true,
  },
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    setupNodeEvents(on, config) {
      cypressMochawesomeReporter(on);
      registerGrep(config);
      return config;
    },
  },
  video: false,
});
