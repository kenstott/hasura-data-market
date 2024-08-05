import React, {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {
    Box,
    DialogContent,
    FormControl,
    FormControlLabel,
    IconButton,
    Input,
    Radio,
    RadioGroup,
    Snackbar,
    Typography
} from "@mui/material";
import {Product} from "../../context/current-product-context/current-product-context";
import {
    ArgumentNode,
    DocumentNode,
    FieldNode,
    GraphQLObjectType,
    isLeafType,
    OperationDefinitionNode,
    print
} from "graphql";
import {useLoginContext} from "../../context/login-context/login-context";
import process from "process";
import {DataGridPro, GridColDef, GridFilterModel, GridToolbar, useGridApiRef} from '@mui/x-data-grid-pro';
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {useDebounce} from "../use-debounce";
import gql from "graphql-tag";
import {Writeable} from "../product-table/product-table";
import {flatten} from 'flat'
import _ from 'lodash'
import {getQueryDottedFields} from "../helpers/get-query-dotted-fields";
import CloseIcon from "@mui/icons-material/Close";
import {getBaseType} from "../helpers/get-base-type";


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

function removeEmptyArrays(obj: Record<string, never>): Record<string, never> {
    const result: Record<string, never> = {};

    for (const key in obj) {
        if (Array.isArray(obj[key]) && (obj[key] as never[]).length === 0) {
            continue; // Skip empty arrays
        }
        result[key] = obj[key];
    }

    return result;
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
        sampleSize: 100,
        maxSize: 1000
    })
    const {adminSecret, role, id} = useLoginContext()
    const debouncedSampleVariables = useDebounce<SamplerOptionsVariables>(sampleVariables, 1000)
    const [rows, setRows] = useState<Record<string, unknown>[]>()
    const [columns, setColumns] = useState<GridColDef[]>()
    const [filterModel, setFilterModel] = useState<GridFilterModel>()
    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        if (open && query) {
            const fieldNode = (query.definitions?.[0] as OperationDefinitionNode).selectionSet.selections[0] as FieldNode
            setColumns(getQueryDottedFields(fieldNode.selectionSet).map(field => ({field})))
            setSampleQuery(print(query))
        }
    }, [query, open])

    useEffect(() => {
        if (open) {
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
        }
    }, [debouncedSampleVariables, open])

    useEffect(() => {
        const {sampleType, sampleSize, maxSize} = debouncedSampleVariables
        if (open && product) {
            const baseType = getBaseType(product?.type) as GraphQLObjectType;
            const fields = Object.entries(baseType.getFields() || {})
                .filter(([_, field]) => isLeafType(getBaseType(field.type)))
            const cols = fields.map(([name, _]) => ({field: name, headerName: name}))
            setColumns(cols)
            const fieldList = fields.map(([name, _]) => name).join(' ')
            const query = `query find__${baseType.name} @sample(count: ${sampleSize}, ${sampleType !== 'first' ? sampleType + ': true' : ''}) { ${product.name}(limit: ${maxSize}) { ${fieldList} } }`
            setSampleQuery(query)
        }
    }, [product, open, debouncedSampleVariables]);

    useEffect(() => {
        if (open && sampleQuery) {
            setLoading(true)
            const headers = {
                'x-hasura-admin-secret': adminSecret,
                'hasura_cloud_pat': adminSecret,
                'x-hasura-role': process.env.NEXT_PUBLIC_EXPLORER_ROLE || '',
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
                if (rows.errors?.length) {
                    setErrorMessage(`${rows.errors[0].message}. ${rows.errors[0].extensions?.['internal']?.error?.message || ''}`)
                }
                const testMaxDepths = [10, 8, 9, 7, 6, 5, 4, 3, 2, 1]
                const flatRowsTestMaxDepth = testMaxDepths.map((maxDepth) => rows.data[Object.keys(rows.data)[0]]
                    .slice(0, 10)
                    .map((i: Record<string, never>) => flatten(i, {maxDepth}))
                    .reduce((acc: number, i: Record<string, never>) => {
                        return Math.max(acc, Object.keys(i).length)
                    }, 0)).findIndex(i => i <= 250)
                if (flatRowsTestMaxDepth != 0) {
                    setErrorMessage(`Reducing flattening depth to ${testMaxDepths[flatRowsTestMaxDepth]}`)
                }
                const flatRows = rows.data[Object.keys(rows.data)[0]]
                    .map((i: Record<string, never>) => flatten(removeEmptyArrays(i), {maxDepth: testMaxDepths[flatRowsTestMaxDepth]}))
                const cols = [...new Set(_.flatten(flatRows.map(Object.keys)))].map<GridColDef>((field) => (
                    {
                        field: field as string,
                        valueGetter: (value, _row) => {
                            if (_.isObject(value)) {
                                return JSON.stringify(value)
                            }
                            return value
                        }
                    }
                ))
                setColumns(cols as GridColDef[])
                setRows(flatRows)
                setLoading(false)
                setTimeout(() => {
                    apiRef.current.autosizeColumns(autosizeOptions).then().catch()
                }, 1)

            }).catch((_error) => {
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
                <DataGridPro
                    apiRef={apiRef}
                    loading={loading}
                    slots={{toolbar: GridToolbar}}
                    autosizeOnMount={true}
                    rows={rows || [] as Record<string, unknown>[]}
                    columns={columns || []}
                    filterModel={filterModel}
                    onFilterModelChange={(model) => {
                        setFilterModel(model)
                    }}
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
            {errorMessage.length > 0 && <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={errorMessage.length > 0}
                autoHideDuration={6000}
                onClose={() => {
                    setErrorMessage('')
                }}
                message={errorMessage}
                action={<React.Fragment>
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={() => setErrorMessage('')}
                    >
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </React.Fragment>}
            />}
        </Dialog>)
    }
    return null
}

export default SamplerDialog;
