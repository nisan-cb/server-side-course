// Nisan Cohen Burayev 315433656

import { MongoClient } from 'mongodb';
import { categories } from './validators.js';
import dotenv from 'dotenv';

dotenv.config();
const mongoConnectionUrl = process.env.MONGO_CONNECTION_URL;

// DB class responsible on mongo DB interaction 
class DB {

    constructor(mongoConnectionUrl) {
        this.mongoClient = new MongoClient(mongoConnectionUrl);
        this.dbName = 'db1';
    }

    async connect() {
        try {
            await this.mongoClient.connect()
            console.log('Connected successfully to DB');
        } catch (error) {
            console.log('Error during DB connection. ', error)
        }
    }


    async createUser(userObj) {
        try {
            const usersCollection = this.mongoClient.db(this.dbName).collection('users');
            const result = await usersCollection.insertOne(userObj);
            console.log(`User added with ID: ${result.insertedId}`);
        } catch (error) {
            console.log(error);
        }
    }

    async isUserExist(user_id) {
        try {
            const usersCollection = this.mongoClient.db(this.dbName).collection('users');
            const existingUser = await usersCollection.findOne({ id: String(user_id) });
            return existingUser ? true : false;
        } catch (error) {
            return false;
        }
    }

    async addCostItem(costItem) {
        try {
            const costsCollection = this.mongoClient.db(this.dbName).collection('costs');
            const result = await costsCollection.insertOne(costItem);
            console.log(`Cost item added with ID: ${result.insertedId}`);
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    async getReportData(user_id, year, month) {
        try {
            const costsCollection = this.mongoClient.db(this.dbName).collection('costs');
            const cursor = costsCollection.find({ user_id, year, month });
            const resObj = Object.fromEntries(categories.map(c => [c, []]));
            for await (const doc of cursor) {
                resObj[doc.category].push({ day: doc.day, description: doc.description, sum: doc.sum });
            }
            return resObj;
        } catch (error) {
            console.log(error);
            return {};
        }
    }

}

const db = new DB(mongoConnectionUrl);

export default db;
