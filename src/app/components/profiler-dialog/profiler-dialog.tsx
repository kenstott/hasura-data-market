import React, {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import {
    Backdrop,
    Box,
    CircularProgress,
    Collapse,
    DialogContent,
    Divider,
    FormControl,
    Input,
    List,
    ListItemButton,
    ListItemText,
    Typography
} from "@mui/material";
import {Product} from "../current-product-context/current-product-context";
import {GraphQLField, GraphQLObjectType, GraphQLScalarType, isLeafType} from "graphql";
import {getBaseType} from "../market-place-card/market-place-card";
import {useLoginContext} from "../login-context/login-context";
import process from "process";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {useDebounce} from "../use-debounce";
import {ProfilePanel} from "../charts/profile-panel";

export interface ProfileNumberStats {
    mean: number
    min: number
    max: number
    average: number
    median: number
    mode: number
    variance: number
    sum: number
}

interface ProfileDateStats {
    mean: string
    min: string
    max: string
    average: string
    median: string
    mode: string
    variance: string
}

export interface ProfileStringItem {
    unique: boolean
    dups?: {
        [value: string]: number
    }
    stats?: ProfileNumberStats
}

type Month = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
type DayOfMonth =
    '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '21'
    | '22'
    | '23'
    | '24'
    | '25'
    | '26'
    | '27'
    | '28'
    | '29'
    | '30'
    | '31'
type HourOfDay =
    '0'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | '11'
    | '12'
    | '13'
    | '14'
    | '15'
    | '16'
    | '17'
    | '18'
    | '19'
    | '20'
    | '21'
    | '22'
    | '23'
    | '24'
type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'
export type Quartile = '1' | '0.75' | '.0.5' | '0.25'
export type Decile = '1' | '0.9' | '0.8' | '0.7' | '0.6' | '0.5' | '0.4' | '0.3' | '0.2' | '0.1'

export interface ProfileDateItem {
    unique: boolean
    counts?: {
        year: {
            [year: string]: number
        }
        month: Record<Month, number>
        dayOfWeek: Record<DayOfWeek, number>
        dayOfMonth: Record<DayOfMonth, number>
        hourOfDay: Record<HourOfDay, number>
    }
    stats?: ProfileDateStats
}

interface ProfileBooleanItem {
    counts?: {
        'true': number,
        'false': number
    }
}

export interface ProfileNumericItem {
    unique: boolean
    stats: ProfileNumberStats
    deciles: Record<Decile, number>
    quartiles: Record<Quartile, number>
}

type ProfilingItem = ProfileStringItem | ProfileDateItem | ProfileNumericItem | ProfileBooleanItem

type ProfilingItems = {
    [field: string]: ProfilingItem
}

export interface ProfilerDialogProps {
    open: boolean;
    onClose: () => void;
    product?: Product
}

export interface ProfilerOptionsVariables {
    maxSize: number
}

export interface ProfileOptionsProps {
    formVariables?: ProfilerOptionsVariables
    setFormVariables: (props: ProfilerOptionsVariables) => void
}

export interface ProfilePanelProps {
    t?: GraphQLScalarType
    item?: ProfilingItem
}

export const ProfilerOptions: React.FC<ProfileOptionsProps> = ({formVariables, setFormVariables}) => {

    const handleMaxSizeChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setFormVariables({
            ...formVariables,
            ['maxSize']: parseInt(event.target.value)
        } as ProfilerOptionsVariables);
    }

    return (<Typography variant="button"><FormControl
        sx={{display: 'flex', alignItems: 'center', flexDirection: {xs: 'column', sm: 'row'}}}>
        Profile a Maximum of&nbsp;&nbsp;&nbsp;
        <FormControl>
            <Input placeholder={'Max Size'} id={'maxSize'} value={formVariables?.maxSize}
                   onChange={handleMaxSizeChange}/>
        </FormControl>
        &nbsp;Rows
    </FormControl></Typography>)
}

export const ProfilerDialog: React.FC<ProfilerDialogProps> = ({open, onClose, product}) => {

    const [query, setQuery] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [sampleVariables, setProfileVariables] = useState<ProfilerOptionsVariables>({
        maxSize: 10000
    })
    const {adminSecret, role, id} = useLoginContext()
    const debouncedProfileVariables = useDebounce<ProfilerOptionsVariables>(sampleVariables, 1000)
    const [rows, setRows] = useState<ProfilingItems>()
    const [columns, setColumns] = useState<[string, GraphQLField<never, never>][]>()
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const handleClick = (itemId: string) => {
        if (expandedItems.includes(itemId)) {
            setExpandedItems(expandedItems.filter((id) => id !== itemId));
        } else {
            setExpandedItems([...expandedItems, itemId]);
        }
    };


    useEffect(() => {
        if (product && open) {
            const {maxSize} = debouncedProfileVariables
            const baseType = getBaseType(product.type) as GraphQLObjectType;
            const fields = Object.entries(baseType.getFields() || {})
                .filter(([_, field]) => isLeafType(getBaseType(field.type)))
            setColumns(fields)
            const fieldList = fields.map(([name, _]) => name).join(' ')
            const sample = `@sample(count: 0) @profile`
            const query = `query profile${baseType.name} ${sample} { ${baseType.name}(limit: ${maxSize}) { ${fieldList} } }`
            setQuery(query)
        }
    }, [open, product, debouncedProfileVariables]);

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
            const operationName = `profile${baseType?.name}`
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
                setRows(rows.extensions['profiling'][baseType?.name || ''])
                setLoading(false)
            }).catch(() => {
                setLoading(false)
            })
        }
    }, [adminSecret, id, open, product?.type, query, role]);

    if (open) {
        return (<Dialog fullWidth={true} style={{padding: 0}} maxWidth={'lg'} open={open} onClose={onClose}>
            <DialogTitle>
                <ProfilerOptions formVariables={sampleVariables} setFormVariables={setProfileVariables}/>
            </DialogTitle>
            <DialogCloseButton onClose={onClose}/>
            <DialogContent>
                <Box style={{height: '80vh'}}>
                    <List>
                        {columns?.map(([fieldName, field]) => {
                                return (<div key={fieldName}>
                                        <ListItemButton onClick={() => handleClick(fieldName)}>
                                            <ListItemText primary={fieldName}/>
                                        </ListItemButton>
                                        <Collapse in={expandedItems.includes(fieldName)} timeout="auto" unmountOnExit>
                                            <ProfilePanel t={getBaseType(field.type) as GraphQLScalarType}
                                                          item={rows?.[fieldName]}/>
                                        </Collapse>
                                        <Divider/>
                                    </div>
                                )
                            }
                        )}
                    </List>
                </Box>
            </DialogContent>
            <Backdrop open={loading} sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}>
                <CircularProgress color="secondary"/>
            </Backdrop>
        </Dialog>)
    }
    return null
}

export default ProfilerDialog;
