import {convertISODateStringsToDates, MongoSingleton} from "../connection";
import {MongoDbFind} from "../find/route";

export async function POST(request: Request) {
    console.assert(process.env.MONGODB_DATABASE)
    const client = await MongoSingleton.getClient()
    const db = client.db(process.env.MONGODB_DATABASE)
    const {collection, filter, options}: MongoDbFind = await request.json()
    const response = await db.collection(collection).findOne(convertISODateStringsToDates(filter), options)
    return new Response(JSON.stringify(response))
}
