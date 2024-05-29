import React, {createContext, ReactNode, useContext, useEffect, useRef, useState} from 'react';
import {buildClientSchema, ExecutionResult, getIntrospectionQuery, GraphQLSchema, IntrospectionQuery} from "graphql";
import {Fetcher} from "@graphiql/toolkit";
import {createFetcher} from "../../create-fetcher";

export type GraphQLSchemaContextType = {
    schema?: GraphQLSchema | null; // Example: You can add other relevant data here
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
            }
            run().then().catch()
        }

    }, [])

    return (

        <GraphQLSchemaContext.Provider value={{schema: graphQLSchema}}>
            {children}
        </GraphQLSchemaContext.Provider>
    );
};
