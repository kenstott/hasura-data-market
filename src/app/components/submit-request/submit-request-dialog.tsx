import Dialog from "@mui/material/Dialog";
import {GraphQLObjectType, GraphQLScalarType} from 'graphql'
import {useCurrentProductContext} from "../../context/current-product-context/current-product-context";
import React, {useEffect, useState} from "react";
import DialogTitle from "@mui/material/DialogTitle";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {useGraphQLSchemaContext} from "../../context/graphql-schema-context/graphql-schema-context";
import {FieldDescriptor, getFieldDescriptors} from "../helpers/get-field-descriptors";
import DialogContent from "@mui/material/DialogContent";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    DialogActions,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    Input,
    InputLabel,
    Paper,
    Radio,
    RadioGroup,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from "@mui/icons-material/Cancel";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {useShoppingCartContext} from "../../context/shopping-cart-context/shopping-cart-context";
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import {useLoginContext} from "../../context/login-context/login-context";

/* eslint-disable-next-line */
export interface SubmitRequestDialogProps {
    open: boolean
    onClose: () => void
    onCompleted: () => void
}

export type ReadOrSelect = 'read' | 'select'
export type AllOrSelected = 'all' | 'selected'

export interface SelectedDataset {
    objectType: GraphQLObjectType
    readOrSelect: ReadOrSelect
    allOrSelected: AllOrSelected
}

export const SubmitRequestDialog: React.FC<SubmitRequestDialogProps> = ({open, onClose, onCompleted}) => {
    const {schema} = useGraphQLSchemaContext()
    const {modifiedProductRequestQuery} = useCurrentProductContext()
    const [pager, setPager] = useState<Record<string, number>>({})
    const [selectedFields, setSelectedFields] = useState<FieldDescriptor[]>()
    const [selectedDatasets, setSelectedDatasets] =
        useState<SelectedDataset[]>()
    const [businessReason, setBusinessReason] = useState('')
    const [businessReasonHelperText, setBusinessReasonHelperText] = useState('0/500 characters')
    const [invalidRequest, setInvalidRequest] = useState(true)
    const {addToShoppingCart} = useShoppingCartContext()
    const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(dayjs(new Date()))
    const [endDate, setEndDate] = useState<dayjs.Dayjs | null>()
    const {role} = useLoginContext()

    useEffect(() => {
        if (modifiedProductRequestQuery) {
            const fieldDescriptors = getFieldDescriptors(modifiedProductRequestQuery, schema)
            const selectRequestFields = fieldDescriptors.filter(([i]) => !i.includes('.'))
            const readRequestFields = fieldDescriptors.filter(([i]) => i.includes('.'))
            setSelectedFields(fieldDescriptors)
            const selectDatasets = [...new Set(selectRequestFields.map(([, , objectType]) => objectType))]
            const readDatasets =
                [...new Set(readRequestFields.map(([, , objectType]) => objectType))]
                    .filter(i => !selectDatasets.find(j => j.name === i.name))
            const selectedDatasets =
                selectDatasets.map(objectType => ({objectType, readOrSelect: 'select', allOrSelected: 'selected'}))
                    .concat(readDatasets.map((objectType) =>
                        ({objectType, readOrSelect: 'read', allOrSelected: 'selected'}))) as SelectedDataset[]
            setSelectedDatasets(selectedDatasets)
        }
    }, [modifiedProductRequestQuery, schema]);

    useEffect(() => {
        setEndDate(startDate?.add(parseInt(process.env.NEXT_PUBLIC_DEFAULT_SECURITY_POLICY_LENGTH_IN_DAYS || '1'), 'day') || null)
    }, [startDate]);

    useEffect(() => {
        if (businessReason.length < 500) {
            setBusinessReasonHelperText(`${businessReason.length}/500 characters`)
        }
    }, [businessReason.length]);

    useEffect(() => {
        setInvalidRequest(!startDate || !endDate || startDate > endDate || businessReason.length === 0 || businessReason.length > 500)
    }, [businessReason.length, endDate, startDate])

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xl"}>
            <DialogCloseButton onClose={onClose}/>
            <DialogTitle>Request Access to the Following Datasets</DialogTitle>
            <DialogContent>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Paper sx={{padding: 1}}>
                        <FormControl fullWidth>
                            <InputLabel htmlFor={'business-reason'}>
                                *Business justification for this data request
                            </InputLabel>
                            <Input required
                                   value={businessReason}
                                   onChange={(event) => setBusinessReason(event.target.value)}
                                   fullWidth name={'business-reason'}
                                   maxRows={5}
                                   multiline/>
                            <FormHelperText>
                                {businessReasonHelperText}
                            </FormHelperText>
                        </FormControl>
                        <Box sx={{mt: 1}} display="flex" justifyContent="space-between">
                            <FormControl fullWidth>
                                <DatePicker
                                    label="*Start Date"
                                    value={startDate} // Add your state variable here
                                    onChange={(newValue) => setStartDate(newValue)} // Add your state setter function here
                                />
                            </FormControl>
                            <div style={{width: 10}}/>
                            <FormControl fullWidth>
                                <DatePicker
                                    label="*End Date"
                                    value={endDate}   // Add your state variable here
                                    onChange={(newValue) => setEndDate(newValue)} // Add your state setter function here
                                />
                            </FormControl>
                        </Box>
                    </Paper>
                </LocalizationProvider>
                {selectedDatasets?.map(({
                                            objectType,
                                            readOrSelect,
                                            allOrSelected
                                        }, index) => {
                    return (<Accordion key={index}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon/>}
                            aria-controls="panel1-content"
                            id="panel1-header"
                        >
                            <Stack direction={'row'} spacing={2} divider={<Divider orientation="vertical" flexItem/>}>

                                <div style={{width: '300px'}}>
                                    <Typography variant={'h6'}>
                                        {objectType.name}
                                    </Typography>
                                </div>

                                <div style={{width: '300px'}}>
                                    <Typography variant={'subtitle1'}>{objectType.description}</Typography>
                                </div>

                                <div
                                    style={{width: '150px'}}>{readOrSelect === 'read' ? 'Read Permissions' : 'Select Permissions'}</div>
                                <div><FormControl
                                    sx={{
                                        marginBottom: '15px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        flexDirection: {xs: 'column', sm: 'row'}
                                    }}>
                                    <RadioGroup
                                        row
                                        id={'selectedOrAll'}
                                        aria-labelledby="selected or all fields"
                                        name="row-radio-buttons-group"
                                        value={allOrSelected}
                                        onClick={(event) => event.stopPropagation()}
                                        onChange={(event) => {
                                            const newSelectedDatasets = [...selectedDatasets]
                                            newSelectedDatasets[index].allOrSelected = event.target.value as AllOrSelected
                                            setSelectedDatasets(newSelectedDatasets)
                                        }}
                                    >
                                        <FormControlLabel id={'all'} value="all" control={<Radio/>}
                                                          label="All Fields"/>
                                        <FormControlLabel id={'selected'} value="selected" control={<Radio/>}
                                                          label="Selected Fields"/>
                                    </RadioGroup>
                                </FormControl></div>
                            </Stack>

                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableCell>Query Path</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Type</TableCell>
                                    </TableHead>
                                    <TableBody>
                                        {selectedFields && selectedFields
                                            .filter(([, , i]) =>
                                                objectType.name === i.name
                                            ).filter((_, rowindex) => rowindex >= (pager[index] ?? 0) * 5
                                                && rowindex < ((pager[index] ?? 0) + 1) * 5)
                                            .map(([path, field], index) => {
                                                return (<TableRow key={index}>
                                                    <TableCell>{path}</TableCell>
                                                    <TableCell>{field.description}</TableCell>
                                                    <TableCell>{(field.type as GraphQLScalarType).name}</TableCell>
                                                </TableRow>)
                                            })
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                rowsPerPageOptions={[5]}
                                count={selectedFields?.filter(([, , i]) => objectType.name === i.name).length || 0}
                                rowsPerPage={5}
                                page={pager[index] || 0}
                                onPageChange={(_event, newPage) => {
                                    setPager((prev) => ({...prev, [index]: newPage}))
                                }}
                            />
                        </AccordionDetails>
                    </Accordion>)
                })}
            </DialogContent>
            <DialogActions>
                <Button disabled={invalidRequest} onClick={() => {
                    if (startDate && endDate && businessReason) {
                        addToShoppingCart({
                            selectedDatasets,
                            selectedFields,
                            businessReason,
                            startDate: startDate.toDate(),
                            endDate: endDate.toDate(),
                            role
                        })
                    }
                    onCompleted()
                }} startIcon={<NavigateNextIcon/>}
                        color={'primary'} variant={'contained'}>
                    Add to Shopping Cart
                </Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon/>}
                    onClick={onClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SubmitRequestDialog;
