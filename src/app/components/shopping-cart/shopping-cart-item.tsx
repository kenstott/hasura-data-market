import React, {useEffect, useState} from "react";
import {FieldDescriptor} from "../helpers/get-field-descriptors";
import {AllOrSelected, SelectedDataset} from "../submit-request/submit-request-dialog";
import {CartItem, useShoppingCartContext} from "../shopping-cart-context/shopping-cart-context";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
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
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {GraphQLScalarType} from "graphql";
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from 'dayjs';

interface ShoppingCartItemProps {
    item: CartItem,
    setEditing: (editing: string) => void
}

export const ShoppingCartItem: React.FC<ShoppingCartItemProps> = ({item, setEditing}) => {
    const [selectedFields, setSelectedFields] = useState<FieldDescriptor[] | undefined>(item.selectedFields || [])
    const [selectedDatasets, setSelectedDatasets] =
        useState<SelectedDataset[] | undefined>(item.selectedDatasets || [])
    const [businessReason, setBusinessReason] = useState<string | undefined>(item.businessReason)
    const [startDate, setStartDate] = useState<dayjs.Dayjs | null>(dayjs(item.startDate))
    const [endDate, setEndDate] =
        useState<dayjs.Dayjs | null>(dayjs(item.endDate))
    const [businessReasonHelperText, setBusinessReasonHelperText] = useState('0/500 characters')
    const [invalidRequest, setInvalidRequest] = useState(true)
    const [pager, setPager] = useState<Record<string, number>>({})
    const [itemChanged, setItemChanged] = useState(false)
    const {removeFromShoppingCart, createHash} = useShoppingCartContext()

    useEffect(() => {
        setEndDate(startDate?.add(parseInt(process.env.NEXT_PUBLIC_DEFAULT_SECURITY_POLICY_LENGTH_IN_DAYS || '1'), 'day') || null)
    }, [startDate]);

    useEffect(() => {
        if (businessReason && businessReason.length < 500) {
            setBusinessReasonHelperText(`${businessReason.length}/500 characters`)
        }
    }, [businessReason, businessReason?.length]);

    useEffect(() => {
        setInvalidRequest(!startDate || !endDate || startDate > endDate || (!!businessReason && businessReason.length === 0) || (!!businessReason && businessReason.length > 500))
    }, [businessReason, businessReason?.length, endDate, startDate])

    useEffect(() => {
        const key = createHash({selectedDatasets, selectedFields, businessReason})
        if (key !== item.key) {
            setItemChanged(true)
            setEditing(item.key || '')
        } else {
            setItemChanged(false)
            setEditing('')
        }
    }, [businessReason, createHash, item.key, selectedDatasets, selectedFields, setEditing])

    return (
        <>
            <Box>
                <Button onClick={() => {
                    removeFromShoppingCart(item)
                }}>Delete</Button>
                {itemChanged && !invalidRequest && <Button>Update Cart Item</Button>}
                {itemChanged && <Button onClick={() => {
                    setBusinessReason(item.businessReason)
                    setSelectedDatasets(item.selectedDatasets)
                    setSelectedFields(item.selectedFields)
                }}>Restore Changes</Button>}
            </Box>
            {item.deleted && <div style={{width: '400px'}}>
                <Typography variant={'h6'} color={'red'}>
                    This is a request to remove this policy
                </Typography>
            </div>}
            <Paper sx={{padding: 1}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                    <Box sx={{p: 1}} display="flex" justifyContent="space-between">
                        <FormControl fullWidth>
                            <DatePicker
                                label="*Start Date"
                                value={startDate}
                                onChange={(newValue) => setStartDate(newValue)}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <DatePicker
                                label="*End Date"
                                value={endDate}
                                onChange={(newValue) => setEndDate(newValue)}
                            />
                        </FormControl>
                    </Box>
                </LocalizationProvider>
            </Paper>
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
        </>)
}