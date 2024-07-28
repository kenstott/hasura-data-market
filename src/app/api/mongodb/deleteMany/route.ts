import {convertISODateStringsToDates, MongoSingleton} from "../connection";
import {DeleteOptions, Document, Filter} from "mongodb";

interface MongoDbDelete {
    collection: string
    filter: Filter<Document>,
    options: DeleteOptions
}

export async function POST(request: Request) {
    console.assert(process.env.MONGODB_DATABASE)
    const client = await MongoSingleton.getClient()
    const db = client.db(process.env.MONGODB_DATABASE)
    const {collection, filter, options}: MongoDbDelete = await request.json()
    const response = await db.collection(collection).deleteMany(
        convertISODateStringsToDates<Filter<Document>>(filter), options)
    return new Response(JSON.stringify(response))
}
