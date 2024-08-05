import React, {useState} from "react";
import {FieldDescriptor} from "../helpers/get-field-descriptors";
import {SelectedDataset} from "../submit-request/submit-request-dialog";
import {useShoppingCartContext} from "../../context/shopping-cart-context/shopping-cart-context";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
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
    TableRow,
    Typography
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {GraphQLScalarType} from "graphql";
import {Policy} from "../../context/policies-context/policies-context";

interface PoliciesDialogItemProps {
    item: Policy
}

export const PoliciesDialogItem: React.FC<PoliciesDialogItemProps> = ({item}) => {
    const [selectedFields,] = useState<FieldDescriptor[] | undefined>(item.selectedFields || [])
    const [selectedDatasets,] =
        useState<SelectedDataset[] | undefined>(item.selectedDatasets || [])
    const [businessReason,] = useState<string | undefined>(item.businessReason)
    const [pager, setPager] = useState<Record<string, number>>({})
    const {ShoppingCart, isInShoppingCart, addToShoppingCart, removeFromShoppingCart} = useShoppingCartContext()

    return (
        <>
            <Box>
                {isInShoppingCart(item) ?
                    <Button onClick={() => {
                        removeFromShoppingCart(item)
                    }}>Restore Deleted Policy</Button> :
                    <>
                        <Button onClick={() => {
                            addToShoppingCart({...item, deleted: true})
                        }}>Delete Policy</Button>
                        <Button onClick={() => {/* ignore */
                        }}>Modify Policy</Button>
                    </>
                }
            </Box>
            <Paper sx={{padding: 1}}>
                <FormControl fullWidth>
                    <InputLabel htmlFor={'business-reason'}>
                        *Business justification for this data request
                    </InputLabel>
                    <Input required
                           value={businessReason}
                           contentEditable={false}
                           fullWidth name={'business-reason'}
                           maxRows={5}
                           multiline/>
                </FormControl>
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
                                    contentEditable={false}
                                    onClick={(event) => event.stopPropagation()}
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