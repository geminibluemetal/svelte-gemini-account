// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'SvelteGeminiApp',
    script: 'build/index.js',
    env: {
      PORT: 80,
      NODE_ENV: 'production',
      ORIGIN: 'http://gemini-02', // Added http:// prefix
      PROTOCOL_HEADER: 'x-forwarded-proto',
      HOST_HEADER: 'x-forwarded-host'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 80,
      ORIGIN: 'http://gemini-02', // Added http:// prefix here too
    }
  }]
};