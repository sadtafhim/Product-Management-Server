import { MongoClient, ObjectId } from "mongodb";

let cachedClient = null;
let cachedDb = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db("product_manager");

  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const { db } = await connectToDatabase();
    const productCollection = db.collection("products");

    if (req.method === "GET") {
      const products = await productCollection.find().toArray();
      return res.status(200).json(products);
    }

    if (req.method === "POST") {
      const product_data = req.body;
      const result = await productCollection.insertOne(product_data);
      return res.status(201).json(result);
    }

    if (req.method === "PUT") {
      const { id, ...data } = req.body;
      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: data },
      );
      return res.status(200).json(result);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      const result = await productCollection.deleteOne({
        _id: new ObjectId(id),
      });
      return res.status(200).json(result);
    }

    res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: err.message });
  }
}
