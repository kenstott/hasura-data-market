import {FieldNode, SelectionSetNode} from "graphql";

export const getQueryDottedFields = (selectionSet?: SelectionSetNode, parents?: string[]) => {
    let results: string[] = []
    if (selectionSet) {
        for (const node of selectionSet.selections as FieldNode[]) {
            if (node.selectionSet) {
                results = results.concat(getQueryDottedFields(node.selectionSet, (parents || []).concat([node.name.value])))
            } else {
                results.push(`${(parents || [])?.join('.')}${parents ? '.' : ''}${node.name.value}`)
            }
        }
    }
    return results
}