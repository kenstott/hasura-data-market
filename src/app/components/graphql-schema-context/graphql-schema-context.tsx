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

const introspectionQuery = `query find__schema {
      __schema {
        
        queryType { name }
        mutationType { name }
        subscriptionType { name }
        types {
          ...FullType
        }
        directives {
          name
          description
          
          locations
          args(includeDeprecated: true) {
            ...InputValue
          }
        }
      }
    }

    fragment FullType on __Type {
      kind
      name
      description
      
      fields(includeDeprecated: true) {
        name
        description
        args(includeDeprecated: true) {
          ...InputValue
        }
        type {
          ...TypeRef
        }
        isDeprecated
        deprecationReason
      }
      inputFields(includeDeprecated: true) {
        ...InputValue
      }
      interfaces {
        ...TypeRef
      }
      enumValues(includeDeprecated: true) {
        name
        description
        isDeprecated
        deprecationReason
      }
      possibleTypes {
        ...TypeRef
      }
    }

    fragment InputValue on __InputValue {
      name
      description
      type { ...TypeRef }
      defaultValue
      isDeprecated
      deprecationReason
    }

    fragment TypeRef on __Type {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
    `

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
            const headers = {
                'x-hasura-role': process.env.NEXT_PUBLIC_EXPLORER_ROLE,
                'x-hasura-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET,
                'hasura_cloud_pat': process.env.NEXT_PUBLIC_ADMIN_SECRET
            }
            const run = async () => {
                try {
                    const result = (await fetcher.current({
                        operationName: 'find__schema',
                        query: introspectionQuery
                    }, {headers})) as ExecutionResult<IntrospectionQuery>
                    if (result.data) {
                        const schema = buildClientSchema(result.data)
                        setGraphQLSchema(schema)
                    }
                    const _result = (await fetcher.current({
                        operationName: 'find__schema',
                        query: introspectionQuery
                    }, {headers: {...headers, 'x-hasura-pass-through': true}})) as ExecutionResult<IntrospectionQuery>
                    if (_result.data) {
                        (_result.data.__schema.directives as Writeable<IntrospectionDirective[]>) = (_result.data.__schema.directives || result.data?.__schema.directives) as Writeable<IntrospectionDirective[]>
                        const schema = buildClientSchema(_result.data)
                        setHasuraGraphQLSchema(schema)
                    }
                } catch (error) {
                    console.log(error)
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
