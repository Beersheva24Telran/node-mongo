import { MongoClient } from "mongodb"

export default class MongoConnection {
    #client
    #db
    constructor(connectionStr, dbName) {
        this.#client = new MongoClient(connectionStr);
        this.#db = this.#client.db(dbName);

    }
    getCollection(collectionName) {
        return this.#db(collectionName);
    }
    async close() {
        await this.#client.close();
    }
}