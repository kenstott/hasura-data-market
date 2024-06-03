import Dialog from "@mui/material/Dialog";
import {GraphQLObjectType, GraphQLScalarType} from 'graphql'
import {useCurrentProductContext} from "../current-product-context/current-product-context";
import React, {useEffect, useState} from "react";
import DialogTitle from "@mui/material/DialogTitle";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import {FieldDescriptor, getFieldDescriptors} from "../helpers/get-field-descriptors";
import DialogContent from "@mui/material/DialogContent";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    DialogActions,
    Divider,
    FormControl,
    FormControlLabel,
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
    TableRow, Typography
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CancelIcon from "@mui/icons-material/Cancel";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

/* eslint-disable-next-line */
export interface SubmitRequestDialogProps {
    open: boolean
    onClose: () => void
    onCompleted: () => void
}

type ReadOrSelect = 'read' | 'select'
type AllOrSelected = 'all' | 'selected'

interface SelectedDataset {
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
    const [response, setResponse] = useState(false)

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
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xl"}>
            <DialogCloseButton onClose={onClose}/>
            <DialogTitle>Request Authorization for the Following Datasets</DialogTitle>
            <DialogContent>
                <Paper sx={{padding: 1}}>
                    <FormControl fullWidth>
                        <InputLabel htmlFor={'business-reason'}>Business justification for this data
                            request</InputLabel>
                        <Input fullWidth name={'business-reason'} multiline></Input>
                    </FormControl>
                </Paper>
                {selectedDatasets?.map(({
                                            objectType,
                                            readOrSelect,
                                            allOrSelected
                                        }, index) => {
                    return (<Accordion>
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
                                            .filter(([, , i], rowIndex) =>
                                                objectType.name === i.name
                                            ).filter((_, rowindex) => rowindex >= (pager[index] ?? 0) * 5
                                                && rowindex < ((pager[index] ?? 0) + 1) * 5)
                                            .map(([path, field]) => {
                                                return (<TableRow>
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
                                onPageChange={(event, newPage) => {
                                    setPager((prev) => ({...prev, [index]: newPage}))
                                }}
                            />
                        </AccordionDetails>
                    </Accordion>)
                })}
            </DialogContent>
            <DialogActions>
                <Button onClick={onCompleted} startIcon={<NavigateNextIcon/>} color={'primary'} variant={'contained'}>Submit
                    Request</Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon/>}
                    onClick={onClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default SubmitRequestDialog;
