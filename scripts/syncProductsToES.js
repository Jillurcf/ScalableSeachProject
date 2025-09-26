const client = require('../elasticsearchClient');
const mysql = require('mysql2');

// MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Barof1983?', 
  database: 'searchdb' 
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
          id: product.id, 
          body: {
            title: product.name || '',                       
            sub_title: product.title || '',                 
            description: product.description || '',        
            brand: product.brand || '',                   
            category: product.category || '',                
            sub_category: product.sub_category || '',       
            price: product.price || 0,                      
            url: product.url || '',                        
            image: product.image || '',                    
            gender: product.gender || '',                  
            type: product.type || '',                     
            status: product.status || '',                    
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
