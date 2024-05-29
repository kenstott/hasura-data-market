import React, {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {Box, DialogContent, FormControl, FormControlLabel, Input, Radio, RadioGroup, Typography} from "@mui/material";
import {Product} from "../current-product-context/current-product-context";
import {GraphQLObjectType, isLeafType} from "graphql";
import {getBaseType} from "../market-place-card/market-place-card";
import {useLoginContext} from "../login-context/login-context";
import process from "process";
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {useDebounce} from "../use-debounce";


export interface SamplerDialogProps {
    open: boolean;
    onClose: () => void;
    product?: Product
}

export interface SamplerOptionsVariables {
    sampleType: 'random' | 'first' | 'last',
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
            <FormControlLabel id={'sampleType'} value="last" control={<Radio/>} label="Last"/>
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

export const SamplerDialog: React.FC<SamplerDialogProps> = ({open, onClose, product}) => {

    const [query, setQuery] = useState<string>('')
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
        if (product) {
            const {sampleType, sampleSize, maxSize} = debouncedSampleVariables
            const baseType = getBaseType(product.type) as GraphQLObjectType;
            const fields = Object.entries(baseType.getFields() || {})
                .filter(([_, field]) => isLeafType(getBaseType(field.type)))
            const cols = fields.map(([name, _]) => ({field: name, headerName: name}))
            setColumns(cols)
            const lastOrRandom = {
                'random': 'random: true',
                'last': 'last: true',
                'first': ''
            }
            const fieldList = fields.map(([name, _]) => name).join(' ')
            const sample = `@sample(count: ${sampleSize} ${lastOrRandom[sampleType]})`
            const query = `query find${baseType.name} ${sample} { ${baseType.name}(limit: ${maxSize}) { ${fieldList} } }`
            setQuery(query)
        }
    }, [product, debouncedSampleVariables]);

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
            const baseType = getBaseType(product?.type) as GraphQLObjectType | undefined;
            const operationName = `find${baseType?.name}`
            const body = JSON.stringify({
                operationName,
                query,
                variables: {}
            })
            fetch(process.env.NEXT_PUBLIC_URI || '', {
                method: 'POST',
                headers,
                body
            }).then(async (response) => {
                const rows = await response.json()
                setRows(rows.data[baseType?.name || ''])
                setLoading(false)
            }).catch(() => setLoading(false))
        }
    }, [adminSecret, id, open, product?.type, query, role]);
    let rowCounter = 0;

    return (<Dialog fullWidth={true} style={{padding: 0}} maxWidth={'lg'} open={open} onClose={onClose}>
        <DialogTitle>
            <SamplerOptions formVariables={sampleVariables} setFormVariables={setSampleVariables}/>
        </DialogTitle>
        <DialogCloseButton onClose={onClose}/>
        <DialogContent><Box style={{height: '80vh'}}>
            <DataGrid
                loading={loading}
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
                getRowId={() => rowCounter++}
            />
        </Box>
        </DialogContent>
    </Dialog>)
}

export default SamplerDialog;
