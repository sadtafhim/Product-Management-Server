const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db, productCollection;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("product_manager");
    productCollection = db.collection("products");
  }
}

app.get("/", (req, res) => res.send("Server is running!"));

app.get("/products", async (req, res) => {
  await connectDB();
  const result = await productCollection.find().toArray();
  res.send(result);
});

app.post("/products", async (req, res) => {
  await connectDB();
  const result = await productCollection.insertOne(req.body);
  res.send(result);
});

app.delete("/products/:id", async (req, res) => {
  await connectDB();
  const result = await productCollection.deleteOne({
    _id: new ObjectId(req.params.id),
  });
  res.send(result);
});

app.put("/products/:id", async (req, res) => {
  await connectDB();
  const result = await productCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: req.body },
  );
  res.send(result);
});

if (process.env.NODE_ENV !== "production") {
  app.listen(5000, () => console.log("Local server on 5000"));
}

module.exports = app;
