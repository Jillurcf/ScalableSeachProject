// const { Client } = require('@elastic/elasticsearch');

// const client = new Client({
//   node: 'https://localhost:9200', // Update if using remote Elastic server
// });

// module.exports = client;
// elasticsearch.js
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: '=S57ym5rExp7eCsJIztW', // Replace this with the real password
  },
  tls: {
    rejectUnauthorized: false, // Accept self-signed cert in dev
  },
});

module.exports = client;
