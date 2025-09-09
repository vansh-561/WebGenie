import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in the environment variables");
}

const mongoURI = process.env.MONGODB_URI;

const client = new MongoClient(mongoURI);

const connectToDatabase = async () => {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db();
};

export { connectToDatabase };