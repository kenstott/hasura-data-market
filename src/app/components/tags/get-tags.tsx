import {Product} from "../../context/current-product-context/current-product-context";
import {MongoDbFind} from "../../api/mongodb/find/route";
import {Tag} from "./show-tags";

export const getTags = async (product: Product | undefined, id: string, role: string, headers: HeadersInit): Promise<Tag[]> => {
    const resource = product?.name.replace('_', '/') || ''
    const filter: Record<string, unknown> = {scope: {$in: ['global', id, role]}}
    if (resource) {
        filter.resource = resource
    }
    const body: MongoDbFind = {collection: 'tag', filter}
    const response = await fetch('/api/mongodb/find', {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    })
    return await response.json()
}

