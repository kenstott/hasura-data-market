import {Filter, MongoClient, Document} from "mongodb";
import assert from "assert";

export class MongoSingleton {
    private static instance: MongoClient;

    private constructor() {
        // Private constructor to prevent instantiation
    }

    public static async getClient(): Promise<MongoClient> {
        if (!this.instance) {
            assert(process.env.MONGODB_CONNECTION_STRING)
            assert(process.env.MONGODB_DATABASE)
            const uri = process.env.MONGODB_CONNECTION_STRING;
            this.instance = new MongoClient(uri);
            await this.instance.connect();
        }
        return this.instance;
    }

    public static hasClient(): boolean {
        return !!this.instance
    }
}

process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing MongoDB connection');
    if (MongoSingleton.hasClient()) {
        const client = await MongoSingleton.getClient();
        await client.close()
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing MongoDB connection');
    if (MongoSingleton.hasClient()) {
        const client = await MongoSingleton.getClient();
        await client.close()
    }
    process.exit(0);
});

function isISODateString(value: any): boolean {
    const isoDatePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
    return typeof value === 'string' && isoDatePattern.test(value);
}


export function convertISODateStringsToDates<T extends Document | Document[]>(obj: Array<Document> | Document): T {
    if (Array.isArray(obj)) {
        return obj.map(item => convertISODateStringsToDates(item)) as T;
    } else if (obj !== null && typeof obj === 'object') {
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (isISODateString(value)) {
                    obj[key] = new Date(value);
                } else if (typeof value === 'object') {
                    obj[key] = convertISODateStringsToDates(value);
                }
            }
        }
    }
    return obj as T;
}