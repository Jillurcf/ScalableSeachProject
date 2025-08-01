const client = require('../elasticsearchClient');
const mysql = require('mysql2');

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Barof1983?', // Update this
  database: 'searchdb' // Update this
});

const indexProducts = () => {
  connection.query('SELECT * FROM searchdb', async (err, results) => {
    if (err) {
      console.error('MySQL query failed:', err);
      return;
    }

    for (const product of results) {
      try {
        await client.index({
          index: 'live_products',
          id: product.id, // assuming `id` is unique
          body: {
            title: product.name || '',                       // e.g. "ANTI"
            sub_title: product.title || '',                  // e.g. "ANTI-HAIR LOSS SHAMPOO..."
            description: product.description || '',          // nullable
            brand: product.brand || '',                      // e.g. "NATUR VITAL"
            category: product.category || '',                // e.g. "hair"
            sub_category: product.sub_category || '',        // e.g. "shampoos"
            price: product.price || 0,                       // optional but may be useful
            url: product.url || '',                          // optional
            image: product.image || '',                      // JSON string or parse first
            gender: product.gender || '',                    // e.g. "male", "female", etc.
            type: product.type || '',                        // e.g. "beauty"
            status: product.status || '',                    // e.g. "new"
          }
        });
      } catch (indexError) {
        console.error(`Failed to index product ID ${product.id}:`, indexError);
      }
    }

    console.log('✅ Products indexed into Elasticsearch.');
    process.exit(0);
  });
};


indexProducts();
