'use client'

import React, {useEffect, useRef, useState} from 'react';
import 'graphiql/graphiql.min.css';
import {explorerPlugin} from '@graphiql/plugin-explorer';
import {GraphiQL} from 'graphiql'
import 'graphiql/graphiql.css';
import dynamic from 'next/dynamic';
import '@graphiql/plugin-explorer/dist/style.css';
import {print} from "graphql";
import gql from 'graphql-tag'
import {ProfileButton} from "./profile-button/profile-button";
import {ExportResponseButton, FileFormat} from "./export-response/export-response-button";
import {createFetcher} from "../../create-fetcher";
import {Fetcher} from "@graphiql/toolkit";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import {useCurrentProductContext} from "../current-product-context/current-product-context";
import {useLoginContext} from "../login-context/login-context";
import {SampleButton} from "./sample-button/sample-button";
import AnomaliesButton from "./anomalies-button/anomalies-button";

// Required to not pre-compile on server-side
const GraphiQLX = dynamic(() => import('graphiql'), {
    ssr: false, // Disable server-side rendering for this component
});

const explorer = explorerPlugin({showAttribution: true, hideActions: true});
// Your custom toolbar component
const _window = typeof window !== 'undefined' ? window : undefined;

export const RequestQuery: React.FC = () => {
    const {
        productRequestQuery,
        setModifiedProductRequestQuery,
        modifiedProductRequestQuery
    } = useCurrentProductContext()

    const {schema} = useGraphQLSchemaContext();
    const {adminSecret, role, id} = useLoginContext()
    const [query, setQuery] = useState<string | undefined>(productRequestQuery ? print(productRequestQuery) : undefined)
    const [variables, setVariables] = useState<string>()
    const [headers, setHeaders] = useState<string | undefined>(_window?.localStorage.getItem('graphiql:headers') || undefined)
    const [operationName, setOperationName] = useState<string>()
    const [response, setResponse] = useState("")
    const fetcher = useRef<Fetcher>(createFetcher(setResponse));

    useEffect(() => {
        const newHeaders = {
            'x-hasura-admin-secret': adminSecret,
            'x-hasura-role': role,
            'x-hasura-user': id
        }
        setHeaders((prevHeaders) =>
            JSON.stringify({...JSON.parse(prevHeaders || '{}'), ...newHeaders}, null, 2))
    }, [adminSecret, role, id, headers]);

    useEffect(() => {
        try {
            if (query) {
                const ast = gql(query)
                setModifiedProductRequestQuery(ast)
            } else {
                setModifiedProductRequestQuery(undefined)
            }

        } catch {
            setModifiedProductRequestQuery(undefined)
        }
    }, [query, setModifiedProductRequestQuery])

    useEffect(() => {
        if (headers) {
            _window?.localStorage.setItem('graphiql:headers', headers)
        } else {
            _window?.localStorage.removeItem('graphiql:headers')
        }
    }, [fetcher, headers]);

    return (

        <GraphiQLX
            fetcher={(attributes, opts) => fetcher.current(attributes, opts)}
            disableTabs={true}
            plugins={[explorer]}
            query={query}
            schema={schema}
            headers={headers}
            response={response}
            onEditHeaders={setHeaders}
            variables={variables}
            shouldPersistHeaders={true}
            isHeadersEditorEnabled={true}
            onEditVariables={setVariables}
            onEditQuery={setQuery}
            operationName={operationName}
            onEditOperationName={setOperationName}
            toolbar={{
                additionalContent: [
                    <ProfileButton key="profile-button" queryAST={modifiedProductRequestQuery} setQuery={setQuery}/>,
                    <SampleButton key="sample-button" queryAST={modifiedProductRequestQuery} setQuery={setQuery}/>,
                    <AnomaliesButton key="anomalies-button" queryAST={modifiedProductRequestQuery} setQuery={setQuery}/>
                ],
            }}
        >
            <GraphiQL.Logo> </GraphiQL.Logo>
            <GraphiQL.Footer>
                <ExportResponseButton query={query} operationName={operationName} variables={variables}
                                      headers={headers} format={FileFormat.CSV}>CSV</ExportResponseButton>
                <ExportResponseButton query={query} operationName={operationName} variables={variables}
                                      headers={headers} format={FileFormat.JSON} response={response}>JSON
                    (Response)</ExportResponseButton>
                <ExportResponseButton query={query} operationName={operationName} variables={variables}
                                      headers={headers} format={FileFormat.ARROW}>ARROW</ExportResponseButton>
            </GraphiQL.Footer>
        </GraphiQLX>

    );
}

export default RequestQuery;