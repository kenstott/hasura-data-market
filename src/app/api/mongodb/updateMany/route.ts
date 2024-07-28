import {convertISODateStringsToDates, MongoSingleton} from "../connection";
import {Document, Filter, UpdateFilter} from "mongodb";
import {MongoDbFind} from "../find/route";

export interface MongoDbUpdate extends MongoDbFind {
    collection: string
    documents: UpdateFilter<Document> | Document[]
}

export async function POST(request: Request) {
    console.assert(process.env.MONGODB_DATABASE)
    const client = await MongoSingleton.getClient()
    const db = client.db(process.env.MONGODB_DATABASE)
    const {collection, documents, filter, options}: MongoDbUpdate = await request.json()
    const response = await db.collection(collection).updateMany(
        convertISODateStringsToDates<Filter<Document>>(filter),
        convertISODateStringsToDates<UpdateFilter<Document> | Document[]>(documents), options
    )
    return new Response(JSON.stringify(response))
}
