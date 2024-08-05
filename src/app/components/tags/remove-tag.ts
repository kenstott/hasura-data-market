import {Product} from "../../context/current-product-context/current-product-context";
import {DeleteManyFunction, MongoDbDelete, MongoDbDeleteResponse} from "../../api/mongodb/deleteMany/route";

export const removeTag = async (product: Product | undefined, scope: string, tag: string, deleteMany: DeleteManyFunction): Promise<MongoDbDeleteResponse> => {
    const resource = product?.name.replace('_', '/')
    const body: MongoDbDelete = {
        collection: 'tag',
        filter: {resource, scope, tag},
        options: {}
    }
    return await deleteMany(body)
}