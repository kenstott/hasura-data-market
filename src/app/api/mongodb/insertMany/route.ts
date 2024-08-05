import {convertISODateStringsToDates, MongoSingleton} from "../connection";
import {Document} from "mongodb";

export interface MongoDbInsert {
    collection: string
    documents: Document[]
}

export interface MongoDbInsertResponse {
    acknowledged: boolean,
    insertedCount: number,
    insertedIds: string[]
}

export async function POST(request: Request) {
    console.assert(process.env.MONGODB_DATABASE)
    const client = await MongoSingleton.getClient()
    const db = client.db(process.env.MONGODB_DATABASE)
    const {collection, documents}: MongoDbInsert = await request.json()
    const response = await db.collection(collection)
        .insertMany(convertISODateStringsToDates<Document[]>(documents))
    return new Response(JSON.stringify(response))
}
