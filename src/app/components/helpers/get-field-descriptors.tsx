import {
    DocumentNode,
    FieldNode,
    FragmentDefinitionNode,
    FragmentSpreadNode,
    GraphQLField,
    GraphQLObjectType,
    GraphQLSchema,
    OperationDefinitionNode,
    SelectionSetNode
} from "graphql";
import {getBaseType} from "../market-place-card/market-place-card";

export type FieldDescriptor = [string, GraphQLField<never, never>, GraphQLObjectType]

export interface GetFieldDescriptorsProps {
    type?: GraphQLObjectType,
    selectionSet?: SelectionSetNode,
    fragments?: FragmentDefinitionNode[],
    schema?: GraphQLSchema | null,
    parents?: string[]
}

const getFieldDescriptorsLoop = ({type, selectionSet, fragments, schema, parents}: GetFieldDescriptorsProps) => {
    let results = [] as Array<FieldDescriptor>
    parents = parents || []

    if (selectionSet) {
        for (const node of selectionSet.selections as Array<FieldNode | FragmentSpreadNode>) {
            if (node.kind === "FragmentSpread") {
                const fragment = fragments?.find(i => i.name.value === node.name.value)
                if (fragment) {
                    const {selectionSet, typeCondition: {name: {value: objectTypeName}},} = fragment
                    const objectType = schema?.getTypeMap()[objectTypeName]
                    const baseType = getBaseType(objectType) as GraphQLObjectType
                    const nextParents = parents.concat([node.name.value])
                    const subResults = getFieldDescriptorsLoop({
                        type: baseType,
                        selectionSet,
                        fragments,
                        schema,
                        parents: nextParents
                    })
                    results = results.concat(subResults)
                }
            } else if (node.selectionSet) {
                const baseType = getBaseType(type?.getFields()[node.name.value].type) as GraphQLObjectType
                const nextParents = parents.concat([node.name.value])
                const subResults = getFieldDescriptorsLoop({
                    type: baseType,
                    selectionSet: node.selectionSet,
                    fragments,
                    schema, parents: nextParents
                })
                results = results.concat(subResults)
            } else {
                const fieldType = type?.getFields()[node.name.value]
                if (fieldType) {
                    results.push([`${parents.join('.')}${parents.length ? '.' : ''}${node.name.value}`, fieldType, type])
                }
            }
        }
    }
    return results
}
export const getFieldDescriptors = (query: DocumentNode, schema?: GraphQLSchema | null) => {
    let selectedFields = [] as Array<FieldDescriptor>
    const queryFields = schema?.getQueryType()?.getFields() || {}
    const queries = query.definitions
        .filter((i) => i.kind === 'OperationDefinition' && i.operation !== 'mutation') as Array<OperationDefinitionNode>
    const fragments =
        query.definitions
            .filter((i) => i.kind === 'FragmentDefinition') as Array<FragmentDefinitionNode>
    for (const query of queries) {
        for (const field of query.selectionSet.selections as FieldNode[]) {
            const fieldType = queryFields[field.name.value]
            if (fieldType) {
                const baseType = getBaseType(fieldType.type) as GraphQLObjectType
                selectedFields = selectedFields.concat(getFieldDescriptorsLoop({
                    type: baseType,
                    selectionSet: field.selectionSet,
                    fragments,
                    schema
                }))
            }
        }
    }
    return selectedFields
}