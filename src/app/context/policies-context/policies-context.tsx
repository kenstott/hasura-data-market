import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {GraphQLField, GraphQLFieldMap, GraphQLObjectType, isLeafType} from "graphql";
import {useLoginContext} from "../login-context/login-context";
import {CartItem, useShoppingCartContext} from "../shopping-cart-context/shopping-cart-context";
import {AllOrSelected, ReadOrSelect, SelectedDataset} from "../../components/submit-request/submit-request-dialog";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import {FieldDescriptor} from "../../components/helpers/get-field-descriptors";
import {MongoDbFind} from "../../api/mongodb/find/route";
import {MongoDbReplaceOne} from "../../api/mongodb/upsertMany/route";

export type Product = GraphQLField<never, never>

export interface Policy extends CartItem {
    startDate?: Date
    endDate?: Date
    approvedBy?: string
    approvedAt?: Date
    createdBy?: string
    createdAt?: Date
    modifiedBy?: string
    modifiedAt?: Date
}

export interface TypePolicy {
    objectType: GraphQLObjectType
    readOrSelect: ReadOrSelect
    allOrSelected: AllOrSelected
    fields: Record<string, GraphQLField<never, never>>
}

export type PoliciesContextType = {
    Policies?: Policy[],
    policySummary?: PolicySummary
    updatePolicies: (policies: Array<CartItem | Policy>) => void
    selectDataSets: string[],
    setTick: React.Dispatch<React.SetStateAction<number>>
};

const PoliciesContext = createContext<PoliciesContextType | undefined>(undefined);

export const usePoliciesContext = () => {
    const context = useContext(PoliciesContext);
    if (!context) {
        throw new Error('usePoliciesContext must be used within a GraphQLProvider');
    }
    return context;
};


interface PolicySummary {
    [type: string]: TypePolicy
}

export const PoliciesContextProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [Policies, setPolicies] = useState<Policy[] | undefined>();
    const [headers, setHeaders] = useState<Record<string, string>>({})
    const [selectDataSets, setSelectDataSets] = useState<string[]>([])
    const [policySummary, setPolicySummary] = useState<PolicySummary>()
    const {role, id, adminSecret} = useLoginContext()
    const {schema} = useGraphQLSchemaContext()
    const {createHash} = useShoppingCartContext()
    const [tick, setTick] = useState(0)

    useEffect(() => {
        setHeaders({
            'x-hasura-admin-secret': adminSecret,
            'x-hasura-role': role,
            'x-hasura-user': id,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        })
    }, [role, id, adminSecret])

    const combineTypePolicy = useCallback((selectedFields?: FieldDescriptor[], currentTypePolicy?: TypePolicy, newTypePolicy?: SelectedDataset) => {
        selectedFields = selectedFields ?? []
        if (newTypePolicy) {
            const typePolicy: TypePolicy = {
                objectType: newTypePolicy.objectType,
                readOrSelect: newTypePolicy.readOrSelect,
                allOrSelected: newTypePolicy.allOrSelected,
                fields: {}
            }
            if (newTypePolicy.allOrSelected === 'selected') {
                typePolicy.fields = selectedFields.reduce<Record<string, GraphQLField<never, never>>>((acc, [, field, objectType]) => {
                    if (objectType.name === newTypePolicy.objectType.name) {
                        acc = {...acc, [field.name]: field}
                    }
                    return acc;
                }, {})
            } else {
                typePolicy.fields = Object.entries(newTypePolicy.objectType.getFields())
                    .filter(([, field]) => isLeafType(field.type))
                    .reduce<GraphQLFieldMap<never, never>>((acc, [name, field]) => ({...acc, [name]: field}), {})
            }
            if (currentTypePolicy) {
                if (currentTypePolicy.readOrSelect === 'select' && typePolicy.readOrSelect === 'read') {
                    typePolicy.readOrSelect = 'select'
                }
                if (currentTypePolicy.allOrSelected === 'all' && newTypePolicy.allOrSelected === 'selected') {
                    typePolicy.fields = currentTypePolicy.fields
                } else if (currentTypePolicy.allOrSelected === 'selected' && newTypePolicy.allOrSelected === 'selected') {
                    typePolicy.fields = {...typePolicy.fields, ...currentTypePolicy.fields}
                }
            }
            return typePolicy
        }
        return null
    }, [])

    useEffect(() => {
        const summary = Policies?.filter((policy) => !policy.deleted).reduce<PolicySummary>((acc, policy) => {
            for (const dataset of policy.selectedDatasets || []) {
                const revisedPolicy = combineTypePolicy(policy.selectedFields, acc[dataset.objectType.toString()], dataset)
                if (revisedPolicy) {
                    acc[revisedPolicy.objectType.name] = revisedPolicy
                }
            }
            return acc
        }, {})
        const datasets = [...new Set(Policies?.filter((policy) => !policy.deleted).reduce<string[]>((acc, i) => {
            return (i.selectedDatasets ?? []).filter((j) => j.readOrSelect === 'select').reduce<string[]>((acc2, j) => {
                return [...acc2, j.objectType.toString()]
            }, acc)
        }, []))]
        setSelectDataSets(datasets)
        setPolicySummary(summary)
    }, [Policies, combineTypePolicy])

    useEffect(() => {
        if (Object.keys(headers).length && schema) {
            const todayISO = (new Date()).toISOString()
            const body: MongoDbFind = {
                collection: 'policy',
                filter: {
                    "role": role,
                    "startDate": {"$lte": todayISO},
                    "$or": [{"endDate": null}, {"endDate": {"$gte": todayISO}}]
                }
            }
            fetch('/api/mongodb/find', {
                method: 'POST',
                headers,
                body: JSON.stringify(body)
            }).then((response) => {
                response.json().then(policies => {
                    for (const policy of policies) {
                        for (const dataset of policy.selectedDatasets || []) {
                            const hydratedGraphQLType = schema?.getTypeMap()?.[dataset.objectType.toString()] as GraphQLObjectType
                            if (hydratedGraphQLType) {
                                dataset.objectType = hydratedGraphQLType
                            }
                        }
                        policy.selectedFields = policy.selectedFields.map(([path, field, objectType]: FieldDescriptor) => {
                            const hydratedGraphQLType = schema?.getTypeMap()?.[objectType.toString()] as GraphQLObjectType
                            const result = [path, field, objectType]
                            if (hydratedGraphQLType) {
                                result[2] = hydratedGraphQLType
                                const hydratedField = hydratedGraphQLType.getFields()[field.name]
                                if (hydratedField) {
                                    result[1] = hydratedField
                                }
                            }
                            return result;
                        })
                    }
                    setPolicies((prevState) => {
                        if (prevState && JSON.stringify(prevState) === JSON.stringify(policies)) {
                            return prevState
                        }
                        return policies
                    })
                })
            })
        }
    }, [role, headers, schema, tick])

    const convertItemToPolicy = useCallback((item: CartItem | Policy): Policy => {
        const now = new Date()
        const p: Policy = {...item} as Policy
        if (p.deleted && !p.endDate) {
            p.endDate = now
        }
        if (!p.createdBy) {
            p.createdBy = id
            p.createdAt = now
        }
        p.modifiedBy = id
        p.modifiedAt = now
        p.key = createHash(p)
        return p
    }, [createHash, id])

    const updatePolicies = useCallback((updates: Array<CartItem | Policy>) => {

        const operations = updates
            .map<Policy>(convertItemToPolicy)
            .map<MongoDbReplaceOne>((p) => ({
                filter: {key: p.key},
                replacement: p
            }))
        if (Object.keys(headers).length) {
            fetch('/api/mongodb/upsertMany', {
                method: 'POST',
                headers,
                body: JSON.stringify({collection: 'policy', operations})
            }).then().catch()
        }
    }, [convertItemToPolicy, headers])

    return (
        <PoliciesContext.Provider
            value={{
                Policies,
                updatePolicies,
                selectDataSets,
                policySummary,
                setTick
            }}>
            {children}
        </PoliciesContext.Provider>
    );
};
