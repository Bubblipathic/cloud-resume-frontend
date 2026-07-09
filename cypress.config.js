const { defineConfig } = require("cypress");

module.exports = defineConfig({
  allowCypressEnv: false,

  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      config.baseUrl = 'http://localhost:5500/frontend';
      return config;
    },
  },
});
