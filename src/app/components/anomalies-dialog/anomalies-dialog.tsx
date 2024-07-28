import React, {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {Box, DialogContent, FormControl, IconButton, Input, Slider, Snackbar, Stack, Typography} from "@mui/material";
import {Product} from "../current-product-context/current-product-context";
import {
    DocumentNode,
    FieldNode,
    GraphQLObjectType,
    isLeafType,
    OperationDefinitionNode,
    print
} from "graphql";
import {useLoginContext} from "../login-context/login-context";
import process from "process";
import {DataGridPro, GridColDef, GridFilterModel, GridToolbar, useGridApiRef} from '@mui/x-data-grid-pro';
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {useDebounce} from "../use-debounce";
import gql from "graphql-tag";
import {Writeable} from "../product-table/product-table";
import {flatten} from 'flat'
import {AnomalyFieldType, GraphQLResponse} from "../helpers/graphql-response";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import BugReportIcon from "@mui/icons-material/BugReport";
import {GridLogicOperator} from "@mui/x-data-grid-pro";
import _ from 'lodash';
import CloseIcon from "@mui/icons-material/Close";
import {getBaseType} from "../helpers/get-base-type";


export interface AnomaliesDialogProps {
    open: boolean;
    onClose: () => void;
    product?: Product,
    query?: DocumentNode
}

export interface AnomaliesOptionsVariables {
    maxSize: number
}

export interface AnomaliesOptionsProps {
    formVariables?: AnomaliesOptionsVariables
    setFormVariables: (props: AnomaliesOptionsVariables) => void
}

export const AnomaliesOptions: React.FC<AnomaliesOptionsProps> = ({formVariables, setFormVariables}) => {
    const handleMaxSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFormVariables({
            ...formVariables,
            ['maxSize']: parseInt(event.target.value)
        } as AnomaliesOptionsVariables);
    }

    return (<Typography variant="button"><FormControl
        sx={{display: 'flex', alignItems: 'center', flexDirection: {xs: 'column', sm: 'row'}}}>
        Maximum of&nbsp;&nbsp;&nbsp;
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

// const GridTypeMap: Record<string, GridColType> = {
//     'Boolean': 'boolean',
//     'Int': 'number',
//     'float8': 'number',
//     'float16': 'number',
//     'String': 'string',
//     'timestamp': 'dateTime',
//     'timestampz': 'dateTime'
// }

const convertToAnomaliesQuery = (prev: string, maxSize: number): string => {
    const newQuery = gql(prev)
    const operation = newQuery.definitions[0] as Writeable<OperationDefinitionNode>
    operation.directives = [
        {
            kind: "Directive",
            name: {
                kind: "Name",
                value: "anomalies"
            }
        },
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
                        value: "0"
                    }
                }
            ]
        }
    ];
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
export const AnomaliesDialog: React.FC<AnomaliesDialogProps> = ({open, onClose, query, product}) => {

    const apiRef = useGridApiRef();
    const {schema} = useGraphQLSchemaContext()
    const {adminSecret, role, id} = useLoginContext()
    const [anomaliesQuery, setAnomaliesQuery] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [AnomaliesVariables, setAnomaliesVariables] = useState<AnomaliesOptionsVariables>({
        maxSize: 100000
    })
    const [rows, setRows] = useState<AnomalyFieldType[]>()
    const [gridColumns, setGridColumns] = useState<GridColDef[]>([])
    const [totalRowsAnalyzed, setTotalRowsAnalyzed] = useState(0)
    const [filter, setFilter] = useState(0)
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        logicOperator: GridLogicOperator.And,
        items: [{field: '__score__', value: 0, operator: '<'}],
    })
    const [errorMessage, setErrorMessage] = useState<string>('')
    const debouncedAnomaliesVariables = useDebounce<AnomaliesOptionsVariables>(AnomaliesVariables, 1000)

    useEffect(() => {
        setFilterModel((prev) => {
            const items = [...prev.items]
            let score = items.find(({field}) => field === '__score__')
            if (!score) {
                score = {field: '__score__', value: filter, operator: '<'}
                items.push(score)
            } else {
                score.value = filter
            }
            return {...prev, items}
        })
    }, [filter]);

    useEffect(() => {
        if (query && open) {
            const {maxSize} = debouncedAnomaliesVariables
            setAnomaliesQuery(convertToAnomaliesQuery(print(query), maxSize))
        }
    }, [query, schema, debouncedAnomaliesVariables, open])

    useEffect(() => {
        const {maxSize} = debouncedAnomaliesVariables
        if (product && open) {
            const baseType = getBaseType(product.type) as GraphQLObjectType;
            const fields = Object.entries(baseType.getFields() || {})
                .filter(([_, field]) => isLeafType(getBaseType(field.type)))
            const fieldList = fields.map(([name, _]) => name).join(' ')
            const query = `query find__${baseType.name} { ${product.name} { ${fieldList} } }`
            setAnomaliesQuery(convertToAnomaliesQuery(query, maxSize))
        }
    }, [product, debouncedAnomaliesVariables, open]);

    useEffect(() => {
        if (open) {
            const {maxSize} = debouncedAnomaliesVariables
            setAnomaliesQuery((prev) => {
                if (prev) {
                    convertToAnomaliesQuery(prev, maxSize)
                }
                return prev
            })
        }
    }, [debouncedAnomaliesVariables, open])

    useEffect(() => {
        if (open && anomaliesQuery) {
            setLoading(true)
            const headers = {
                'x-hasura-admin-secret': adminSecret,
                'hasura_cloud_pat': adminSecret,
                'x-hasura-role': process.env.NEXT_PUBLIC_EXPLORER_ROLE || '',
                'x-hasura-user': id,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
            const q = gql(anomaliesQuery)
            const operationName = (q.definitions[0] as OperationDefinitionNode).name?.value || ''
            const body = JSON.stringify({
                operationName,
                query: anomaliesQuery,
                variables: {}
            })
            fetch(process.env.NEXT_PUBLIC_URI || '', {
                method: 'POST',
                headers,
                body
            }).then(async (response) => {
                const rows = await response.json() as GraphQLResponse
                if (rows.errors?.length) {
                    setErrorMessage(`${rows.errors[0].message}. ${rows.errors[0].extensions?.['internal']?.error?.message || ''}`)
                }

                const firstItem = rows.extensions.anomalies[Object.keys(rows.extensions.anomalies)[0]]
                const flatRows = firstItem.map((i) => flatten(i)) as AnomalyFieldType[]
                const cols = [...new Set(_.flatten(flatRows.map(Object.keys)))].map((field) => {
                    switch (field) {
                        case '__score__':
                            return {
                                field: '__score__',
                                type: 'number',
                                headerName: 'Anomaly Score'
                            };
                        case '__index__':
                            return {
                                field: '__index__',
                                type: 'number',
                                headerName: 'Row'
                            }
                        default:
                            return {field};
                    }
                });
                setGridColumns(cols.sort((a, b) => a.field.localeCompare(b.field)) as GridColDef[])
                setRows(flatRows || [])
                setTotalRowsAnalyzed((rows.extensions.actualDatasetSize[Object.keys(rows.extensions.anomalies)[0]]))
                setLoading(false)
                setTimeout(() => {
                    apiRef.current.autosizeColumns(autosizeOptions).then().catch()
                }, 1)

            }).catch((_error) => {
                setLoading(false)
            })
        }
    }, [adminSecret, anomaliesQuery, apiRef, id, open, role]);
    let rowCounter = 0;

    if (open && (product || query)) {
        return <Dialog fullWidth={true} style={{padding: 0}} maxWidth={'lg'} open={open} onClose={onClose}>
            <DialogTitle style={{display: 'flex', justifyContent: 'space-between'}}>
                <AnomaliesOptions formVariables={AnomaliesVariables} setFormVariables={setAnomaliesVariables}/>
                <Stack spacing={2} direction="row" sx={{mb: 1}} alignItems="center">
                    <BugReportIcon/>
                    <Slider size="small"
                            aria-label="Suspicious Records"
                            valueLabelDisplay="auto"
                            style={{width: '150px', marginLeft: '10px', marginRight: '10px'}}
                            step={.001}
                            min={-.5}
                            max={0}
                            value={filter}
                            onChange={(_event: Event, newValue: number | number[]) => {
                                setFilter(newValue as number);
                            }}/>
                </Stack>
                <Typography variant="button" style={{marginRight: '30px'}}>Total Rows
                    Analyzed: {totalRowsAnalyzed}</Typography>
            </DialogTitle>
            <DialogCloseButton onClose={onClose}/>
            <DialogContent><Box style={{height: '80vh'}}>
                <DataGridPro
                    apiRef={apiRef}
                    loading={loading}
                    slots={{toolbar: GridToolbar}}
                    autosizeOnMount={true}
                    rows={rows || []}
                    columns={gridColumns}
                    filterModel={filterModel}
                    onFilterModelChange={(model: GridFilterModel) => {
                        setFilterModel(model)
                    }}
                    getRowHeight={() => 'auto'}
                    getRowId={() => rowCounter++}
                    initialState={{
                        pinnedColumns: {left: ['__score__', '__index__']},
                        sorting: {
                            sortModel: [{field: '__score__', sort: 'asc'}],
                        },
                    }}
                    pageSizeOptions={[10, 100, {value: 1000, label: '1,000'}]}
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
        </Dialog>
    }
    return null
}

export default AnomaliesDialog;
