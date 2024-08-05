import {convertISODateStringsToDates, MongoSingleton} from "../connection";
import {Document, Filter, FindOptions} from "mongodb";

export interface MongoDbFind {
    collection: string
    filter: Filter<Document>
    options?: FindOptions
}

export async function POST(request: Request) {
    console.assert(process.env.MONGODB_DATABASE)
    const client = await MongoSingleton.getClient()
    const db = client.db(process.env.MONGODB_DATABASE)
    const {collection, filter, options}: MongoDbFind = await request.json()
    const response = await db.collection(collection).find(convertISODateStringsToDates(filter), options).toArray()
    return new Response(JSON.stringify(response))
}
