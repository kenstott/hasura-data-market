import React, {createContext, ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {
    buildClientSchema,
    ExecutionResult,
    getIntrospectionQuery,
    GraphQLSchema,
    IntrospectionDirective,
    IntrospectionQuery
} from "graphql";
import {Fetcher} from "@graphiql/toolkit";
import {createFetcher} from "../../create-fetcher";
import process from "process";
import {Writeable} from "../product-table/product-table";

export type GraphQLSchemaContextType = {
    schema?: GraphQLSchema | null;
    hasuraSchema?: GraphQLSchema | null;
};

const GraphQLSchemaContext = createContext<GraphQLSchemaContextType | undefined>(undefined);

export const useGraphQLSchemaContext = () => {
    const context = useContext(GraphQLSchemaContext);
    if (!context) {
        throw new Error('useGraphQLContext must be used within a GraphQLProvider');
    }
    return context;
};
export const GraphQLSchemaProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [graphQLSchema, setGraphQLSchema] = useState<GraphQLSchema>()
    const [hasuraQLSchema, setHasuraGraphQLSchema] = useState<GraphQLSchema>()
    const fetcher = useRef<Fetcher>(createFetcher());
    const initialized = useRef<boolean>(false)

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true
            const run = async () => {
                const result = (await fetcher.current({
                    operationName: 'IntrospectionQuery',
                    query: getIntrospectionQuery()
                })) as ExecutionResult<IntrospectionQuery>
                if (result.data) {
                    const schema = buildClientSchema(result.data)
                    setGraphQLSchema(schema)
                }
                const _result = (await fetcher.current({
                    operationName: 'find__schema',
                    query: getIntrospectionQuery().replace('IntrospectionQuery', 'find__schema')
                }, {
                    headers: {
                        'x-hasura-role': process.env.NEXT_PUBLIC_EXPLORER_ROLE,
                        'x-hasura-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET,
                        'x-hasura-pass-through': true
                    }
                })) as ExecutionResult<IntrospectionQuery>
                if (_result.data) {
                    (_result.data.__schema.directives as Writeable<IntrospectionDirective[]>) = (_result.data.__schema.directives || result.data?.__schema.directives) as Writeable<IntrospectionDirective[]>
                    const schema = buildClientSchema(_result.data)
                    setHasuraGraphQLSchema(schema)
                }
            }
            run().then().catch()
        }

    }, [])

    return (

        <GraphQLSchemaContext.Provider value={{schema: graphQLSchema, hasuraSchema: hasuraQLSchema}}>
            {children}
        </GraphQLSchemaContext.Provider>
    );
};
