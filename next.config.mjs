// next.config.js
module.exports = {
    reactStrictMode: true,
    async rewrites() {
      return [
        {
          source: '/api/socket',
          destination: '/api/socket/server.ts'
        }
      ];
    }
  };
  