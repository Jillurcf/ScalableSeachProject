const express = require("express");
const mysql = require("mysql2/promise");
const { Client } = require("@elastic/elasticsearch");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// MySQL config
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Barof1983?",
  database: "searchdb",
};

let connection;

async function connectDB() {
  connection = await mysql.createConnection(dbConfig);
  console.log("Connected to MySQL");
}
connectDB();

// Elasticsearch client
const esClient = new Client({
  node: "https://localhost:9200",
  auth: { username: "elastic", password: "=S57ym5rExp7eCsJIztW" },
  tls: { rejectUnauthorized: false },
});



app.get("/", (req, res) => {
  res.send("Hello from Express and MySQL!");
});

// Get all products from Elasticsearch
app.get("/products", async (req, res) => {
  try {
    const result = await esClient.search({
      index: "live_products",
      size: 1000,
      body: { query: { match_all: {} } },
    });
    const products = result.hits.hits.map((hit) => hit._source);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch all products" });
  }
});

// Sync products from MySQL to Elasticsearch
app.post("/sync-products", async (req, res) => {
  try {
    const [rows] = await connection.execute("SELECT * FROM live_products");

   const bulkBody = rows.flatMap(product => {
  let image_url = '';
  try {
    const imgs = JSON.parse(product.images);
    if (Array.isArray(imgs) && imgs.length > 0) {
      image_url = imgs[0];
    }
  } catch {
    image_url = product.images;
  }

  return [
    { index: { _index: 'live_products', _id: product.id } },
    {
      title: product.name || '',
      sku: product.sku,
      price: product.price,
      sale_price: product.sale_price,
      regular_price: product.regular_price,
      currency: product.currency,
      category: product.category,
      sub_category: product.sub_category,
      image_url,
      description: product.description,
      brand: product.brand,
      gender: product.gender,
      tags: product.tags,
      status: product.status,
      source_id: product.source_id,
      product_url: product.url
    }
  ];
});


    const esResponse = await esClient.bulk({
      refresh: true,
      body: bulkBody,
    });

    if (esResponse.errors) {
      console.error("Bulk insert errors:", esResponse.items);
      return res.status(500).json({ message: "Bulk insert failed with errors" });
    }

    res.json({ message: `Synced ${rows.length} products.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to sync products" });
  }
});

// Search route
app.get("/search", async (req, res) => {
  const searchQuery = req.query.q;
  if (!searchQuery) {
    return res.status(400).json({ error: "No search query provided" });
  }

  try {
    const result = await esClient.search({
      index: "live_products",
      size: 10,
      body: {
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: searchQuery,
                  fields: [
                    "title^3",
                    "sub_title^2",
                    "description",
                    "category",
                    "sub_category",
                    "brand",
                  ],
                  fuzziness: "AUTO",
                },
              },
              {
                prefix: { title: { value: searchQuery.toLowerCase(), boost: 2.0 } },
              },
              {
                term: { "title.keyword": { value: searchQuery.toLowerCase(), boost: 5.0 } },
              },
            ],
          },
        },
      },
    });
    res.json(result.hits.hits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
