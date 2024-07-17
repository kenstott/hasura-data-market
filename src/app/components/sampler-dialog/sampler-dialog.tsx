import React, {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {Box, DialogContent, FormControl, FormControlLabel, Input, Radio, RadioGroup, Typography} from "@mui/material";
import {Product} from "../current-product-context/current-product-context";
import {
    ArgumentNode,
    DocumentNode,
    FieldNode,
    GraphQLObjectType,
    isLeafType,
    OperationDefinitionNode,
    print
} from "graphql";
import {getBaseType} from "../market-place-card/market-place-card";
import {useLoginContext} from "../login-context/login-context";
import process from "process";
import {DataGrid, GridColDef, GridToolbar, useGridApiRef} from '@mui/x-data-grid';
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {useDebounce} from "../use-debounce";
import gql from "graphql-tag";
import {Writeable} from "../product-table/product-table";
import {flatten} from 'flat'
import _ from 'lodash'
import {getQueryDottedFields} from "../helpers/get-query-dotted-fields";


export interface SamplerDialogProps {
    open: boolean;
    onClose: () => void;
    product?: Product,
    query?: DocumentNode
}

export interface SamplerOptionsVariables {
    sampleType: 'random' | 'first' | 'fromEnd',
    sampleSize: number,
    maxSize: number
}

export interface SampleOptionsProps {
    formVariables?: SamplerOptionsVariables
    setFormVariables: (props: SamplerOptionsVariables) => void
}

export const SamplerOptions: React.FC<SampleOptionsProps> = ({formVariables, setFormVariables}) => {

    const handleSampleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormVariables({
            ...formVariables,
            ['sampleType']: event.target.value
        } as SamplerOptionsVariables);
    };

    const handleSampleSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFormVariables({
            ...formVariables,
            ['sampleSize']: parseInt(event.target.value)
        } as SamplerOptionsVariables);
    }

    const handleMaxSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFormVariables({
            ...formVariables,
            ['maxSize']: parseInt(event.target.value)
        } as SamplerOptionsVariables);
    }

    return (<Typography variant="button"><FormControl
        sx={{display: 'flex', alignItems: 'center', flexDirection: {xs: 'column', sm: 'row'}}}>
        <RadioGroup
            row
            id={'sampleType'}
            aria-labelledby="sample-radio-buttons"
            name="row-radio-buttons-group"
            value={formVariables?.sampleType}
            onChange={handleSampleTypeChange}
        >
            <FormControlLabel id={'sampleType'} value="random" control={<Radio/>} label="Random"/>
            <FormControlLabel id={'sampleType'} value="first" control={<Radio/>} label="First"/>
            <FormControlLabel id={'sampleType'} value="fromEnd" control={<Radio/>} label="Last"/>
        </RadioGroup>
        Sample&nbsp;&nbsp;&nbsp;
        <FormControl>
            <Input placeholder={'Sample Size'} id={'sampleSize'} value={formVariables?.sampleSize}
                   onChange={handleSampleSizeChange}/>
        </FormControl>
        &nbsp;&nbsp;From a Maximum of&nbsp;&nbsp;&nbsp;
        <FormControl>
            <Input placeholder={'Max Size'} id={'maxSize'} value={formVariables?.maxSize}
                   onChange={handleMaxSizeChange}/>
        </FormControl>
        &nbsp;Rows
    </FormControl></Typography>)
}

const autosizeOptions = {
    includeHeaders: true,
    includeOutliers: true,
    expand: true
};
export const SamplerDialog: React.FC<SamplerDialogProps> = ({open, onClose, query, product}) => {

    const apiRef = useGridApiRef();
    const [sampleQuery, setSampleQuery] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [sampleVariables, setSampleVariables] = useState<SamplerOptionsVariables>({
        sampleType: 'random',
        sampleSize: 1000,
        maxSize: 100000
    })
    const {adminSecret, role, id} = useLoginContext()
    const debouncedSampleVariables = useDebounce<SamplerOptionsVariables>(sampleVariables, 1000)
    const [rows, setRows] = useState<Record<string, unknown>[]>()
    const [columns, setColumns] = useState<GridColDef[]>()

    useEffect(() => {
        if (query) {
            const fieldNode = (query.definitions?.[0] as OperationDefinitionNode).selectionSet.selections[0] as FieldNode
            setColumns(getQueryDottedFields(fieldNode.selectionSet).map(field => ({field})))
            setSampleQuery(print(query))
        }
    }, [query])

    useEffect(() => {
        const {sampleType, sampleSize, maxSize} = debouncedSampleVariables
        setSampleQuery((prev) => {
            if (prev) {
                const newQuery = gql(prev)
                const operation = newQuery.definitions[0] as Writeable<OperationDefinitionNode>
                operation.directives = [
                    {
                        kind: "Directive",
                        name: {
                            kind: "Name",
                            value: "sample"
                        },
                        arguments: [
                            {
                                kind: "Argument",
                                name: {
                                    kind: "Name",
                                    value: "count"
                                },
                                value: {
                                    kind: "IntValue",
                                    value: sampleSize.toString()
                                }
                            }
                        ]
                    }
                ]
                if (sampleType !== 'first' && operation.directives[0].arguments) {
                    (operation.directives[0].arguments as Writeable<ArgumentNode[]>).push({
                        kind: "Argument",
                        name: {
                            kind: "Name",
                            value: sampleType
                        },
                        value: {
                            kind: "BooleanValue",
                            value: true
                        }
                    })
                }
                (operation.selectionSet.selections[0] as Writeable<FieldNode>).arguments = [
                    {
                        "kind": "Argument",
                        "name": {
                            "kind": "Name",
                            "value": "limit"
                        },
                        "value": {
                            "kind": "IntValue",
                            "value": maxSize.toString()
                        }
                    }
                ]
                return print(newQuery)
            }
            return prev
        })
    }, [debouncedSampleVariables])

    useEffect(() => {
        if (product) {
            const baseType = getBaseType(product?.type) as GraphQLObjectType;
            const fields = Object.entries(baseType.getFields() || {})
                .filter(([_, field]) => isLeafType(getBaseType(field.type)))
            const cols = fields.map(([name, _]) => ({field: name, headerName: name}))
            setColumns(cols)
            const fieldList = fields.map(([name, _]) => name).join(' ')
            const query = `query find${baseType.name} { ${baseType.name} { ${fieldList} } }`
            setSampleQuery(query)
        }
    }, [product]);

    useEffect(() => {
        if (open) {
            setLoading(true)
            const headers = {
                'x-hasura-admin-secret': adminSecret,
                'x-hasura-role': role,
                'x-hasura-user': id,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
            const q = gql(sampleQuery)
            const operationName = (q.definitions[0] as OperationDefinitionNode).name?.value || ''
            const body = JSON.stringify({
                operationName,
                query: sampleQuery,
                variables: {}
            })
            fetch(process.env.NEXT_PUBLIC_URI || '', {
                method: 'POST',
                headers,
                body
            }).then(async (response) => {
                const rows = await response.json()
                const flatRows = rows.data[Object.keys(rows.data)[0]].map(flatten)
                const cols = [...new Set(_.flatten(flatRows.map(Object.keys)))].map((field) => ({field}))
                setColumns(cols as GridColDef[])
                setRows(flatRows)
                setLoading(false)
                setTimeout(() => {
                    apiRef.current.autosizeColumns(autosizeOptions).then().catch()
                }, 1)

            }).catch((error) => {
                setLoading(false)
            })
        }
    }, [adminSecret, apiRef, id, open, role, sampleQuery]);
    let rowCounter = 0;

    if (open && (product || query)) {
        return (<Dialog fullWidth={true} style={{padding: 0}} maxWidth={'lg'} open={open} onClose={onClose}>
            <DialogTitle>
                <SamplerOptions formVariables={sampleVariables} setFormVariables={setSampleVariables}/>
            </DialogTitle>
            <DialogCloseButton onClose={onClose}/>
            <DialogContent><Box style={{height: '80vh'}}>
                <DataGrid
                    apiRef={apiRef}
                    loading={loading}
                    slots={{toolbar: GridToolbar}}
                    autosizeOnMount={true}
                    rows={rows || [] as Record<string, unknown>[]}
                    columns={columns || []}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 50,
                            },
                        },
                    }}
                    pageSizeOptions={[5]}
                    getRowHeight={() => 'auto'}
                    getRowId={() => rowCounter++}
                />
            </Box>
            </DialogContent>
        </Dialog>)
    }
    return null
}

export default SamplerDialog;
