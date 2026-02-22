import { MongoClient, ObjectId } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);

async function connectDB() {
  if (!client.isConnected()) await client.connect();
  return client.db("product_manager").collection("products");
}

export default async function handler(req, res) {
  const productCollection = await connectDB();

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
    const result = await productCollection.deleteOne({ _id: new ObjectId(id) });
    return res.status(200).json(result);
  }

  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
