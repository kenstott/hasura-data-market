import {Product} from "../../context/current-product-context/current-product-context";
import {MongoDbUpsertMany, UpsertManyFunction} from "../../api/mongodb/upsertMany/route";

export const addTag = async (product: Product | undefined, scope: string, tag: string, upsertMany: UpsertManyFunction) => {
    const resource = product?.name.replace('_', '/')
    const newTag = {resource, scope, tag}
    const body: MongoDbUpsertMany = {
        collection: 'tag',
        operations: [{filter: {resource, scope, tag}, upsert: true, replacement: newTag}]
    }
    return upsertMany(body)
}