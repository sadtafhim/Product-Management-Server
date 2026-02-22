const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
require("dotenv").config();

const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("server is running!");
});

async function run() {
  try {
    await client.connect();
    const db = client.db("product_manager");
    const productCollection = db.collection("products");

    app.post("/products", async (req, res) => {
      const product_data = req.body;
      const result = await productCollection.insertOne(product_data);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/products/:id", async (req, res) => {
      const result = await productCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });
    app.put("/products/:id", async (req, res) => {
      const result = await productCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
      );
      res.send(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

module.exports = app;
