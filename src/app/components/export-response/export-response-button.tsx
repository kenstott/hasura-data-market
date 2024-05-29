import {Button, CircularProgress} from "@mui/material";
import React, {PropsWithChildren, ReactNode, useState} from "react";
import process from "process";
import gql from "graphql-tag";
import FileSaver from "file-saver";
import {OperationDefinitionNode} from "graphql";

const _window = typeof window !== 'undefined' ? window : undefined;

/* eslint-disable-next-line */
export interface ExportResponseButtonProps {
    children?: ReactNode
    query?: string
    operationName?: string
    variables?: string
    headers?: string
    format: FileFormat
    response?: string
}

export enum FileFormat {
    CSV = 'csv',
    JSON = 'json',
    ARROW = 'arrow'
}

const mimeTypes = {
    [FileFormat.CSV]: 'text/csv',
    [FileFormat.JSON]: 'application/json',
    [FileFormat.ARROW]: 'application/vnd.apache.arrow.file'
}
const extension = {
    [FileFormat.CSV]: 'csv',
    [FileFormat.JSON]: 'json',
    [FileFormat.ARROW]: 'arrow'
}
export const ExportResponseButton: React.FC<PropsWithChildren<ExportResponseButtonProps>> =
    ({
         children,
         query,
         operationName,
         variables,
         format,
         headers,
         response
     }) => {
        const [loading, setLoading] = useState<boolean>(false)
        const exportFile = async () => {
            if (response) {
                const blob = new Blob([JSON.stringify(response, null, 2)], {type: 'application/json'});
                FileSaver.saveAs(blob, `${operationName ?? 'response'}.${extension[format]}`)
            } else if (query) {
                const downloadURL = new URL(
                    `gql/${format}`,
                    (process.env.NEXT_PUBLIC_URI || '').replace('graphql', 'gql')
                )
                try {
                    let _operationName = operationName
                    if (!_operationName) {
                        const ast = gql(query)
                        if (ast.definitions.length)
                            _operationName = (ast.definitions[0] as OperationDefinitionNode).name?.value
                    }
                    const body = JSON.stringify({
                        operationName: _operationName,
                        query,
                        variables: variables ? JSON.parse(variables) : {}
                    })
                    const __headers = headers ?? _window?.localStorage.getItem('graphiql:headers') ?? '{}'
                    const _headers = {
                        ...JSON.parse(__headers),
                        'Accept': mimeTypes[format],
                        'Content-Type': 'application/json'
                    }
                    setLoading(true)
                    const response = await fetch(downloadURL, {
                        method: 'POST',
                        headers: _headers,
                        body
                    })
                    const blob = await response.blob()
                    setLoading(false)
                    FileSaver.saveAs(blob, `${_operationName}.${extension[format]}`)
                } catch (error) {
                    alert((error as Error).message)
                }
            }
        }

        return (<Button onClick={exportFile}>{loading ? <CircularProgress size={20}/> : null}{children}</Button>)
    }

export default ExportResponseButton;
