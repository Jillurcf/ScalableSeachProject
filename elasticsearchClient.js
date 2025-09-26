
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  node: 'https://localhost:9200',
  auth: {
    username: 'elastic',
    password: '=S57ym5rExp7eCsJIztW', 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

module.exports = client;
