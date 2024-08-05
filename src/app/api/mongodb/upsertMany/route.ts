import {convertISODateStringsToDates, MongoSingleton} from "../connection";
import {Document, Filter} from "mongodb";
import {MongoDbInsertResponse} from "../insertMany/route";

export interface MongoDbReplaceOne {
    filter: Filter<Document>
    replacement: Document,
    upsert?: boolean
}

export interface MongoDbUpsertMany {
    collection: string
    operations: MongoDbReplaceOne[]
}

export type UpsertManyFunction = (options: MongoDbUpsertMany) => Promise<MongoDbInsertResponse>

export async function POST(request: Request) {
    console.assert(process.env.MONGODB_DATABASE)
    const client = await MongoSingleton.getClient()
    const db = client.db(process.env.MONGODB_DATABASE)
    const {collection, operations}: MongoDbUpsertMany = await request.json()
    const bulkOps = operations.map(({filter, replacement}) => ({
        replaceOne: {
            filter: convertISODateStringsToDates<Filter<Document>>(filter),
            replacement: convertISODateStringsToDates<Document>(replacement),
            upsert: true
        }
    }));
    const result = await db.collection(collection).bulkWrite(bulkOps);
    return new Response(JSON.stringify(result))
}
