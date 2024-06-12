import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const server = process.env.MONGO_SERVER;
const port = process.env.MONGO_PORT;
const user = process.env.MONGO_USER;
const password = process.env.MONGO_PASSWORD;
const URI = `mongodb://${user}:${encodeURIComponent(
  password
)}@${server}:${port}?retryWrites=true&w=majority&directConnection=true`;

class Database {
  constructor() {
    if (Database.instance) {
      return Database.instance;
    }
    Database.instance = this;
    this._connectPromise = this._connect();
  }

  async _connect() {
    try {
      await mongoose.connect(URI);
      console.log("Database connection successful");
    } catch (error) {
      console.error("Database connection error:", error.message);
      process.exit(1);
    }
  }

  async _disconnect() {
    try {
      await mongoose.disconnect();
      console.log("Database disconnection successful");
    } catch (error) {
      console.error("Database disconnection error:", error.message);
    }
  }

  static getInstance() {
    if (!Database.instance) {
      new Database();
    }
    return Database.instance;
  }

  static async connect() {
    const instance = Database.getInstance();
    return instance._connectPromise;
  }

  static async disconnect() {
    const instance = Database.getInstance();
    return instance._disconnect();
  }
}

export const connect = async () => {
  return Database.connect();
};

export const disconnect = async () => {
  return Database.disconnect();
};
