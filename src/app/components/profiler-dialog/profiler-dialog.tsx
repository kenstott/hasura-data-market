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
import {
    DirectiveNode,
    FieldNode,
    GraphQLObjectType,
    GraphQLScalarType,
    isLeafType,
    OperationDefinitionNode,
    print
} from "graphql";
import {getBaseType} from "../market-place-card/market-place-card";
import {useLoginContext} from "../login-context/login-context";
import process from "process";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {useDebounce} from "../use-debounce";
import {ProfilePanel} from "../charts/profile-panel";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import gql from "graphql-tag";
import {Writeable} from "../product-table/product-table";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import {
    ProfileOptionsProps,
    ProfilerDialogProps,
    ProfilerOptionsVariables,
    ProfilingItems
} from "../charts/profile-types";
import {FieldDescriptor, getFieldDescriptors} from "../helpers/get-field-descriptors";
import {GraphQLResponse} from "../helpers/graphql-response";

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

export const ProfilerDialog: React.FC<ProfilerDialogProps> = ({open, onClose, query, product}) => {

    const [profileQuery, setProfileQuery] = useState<string>('')
    const [loading, setLoading] = useState(false)
    const [profileVariables, setProfileVariables] = useState<ProfilerOptionsVariables>({
        maxSize: 10000
    })
    const {adminSecret, role, id} = useLoginContext()
    const {schema} = useGraphQLSchemaContext()
    const debouncedProfileVariables = useDebounce<ProfilerOptionsVariables>(profileVariables, 1000)
    const [rows, setRows] = useState<ProfilingItems>()
    const [columns, setColumns] = useState<Array<FieldDescriptor>>()
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [totalRowsAnalyzed, setTotalRowsAnalyzed] = useState(0)

    const handleClick = (itemId: string) => {
        if (expandedItems.includes(itemId)) {
            setExpandedItems(expandedItems.filter((id) => id !== itemId));
        } else {
            setExpandedItems([...expandedItems, itemId]);
        }
    };

    useEffect(() => {
        if (query) {
            setColumns(getFieldDescriptors(query, schema))
            setProfileQuery(print(query))
        }
    }, [query, schema])

    useEffect(() => {
        const {maxSize} = debouncedProfileVariables
        setProfileQuery((prev) => {
            if (prev) {
                const newQuery = gql(prev)
                const operation = newQuery.definitions[0] as Writeable<OperationDefinitionNode>
                operation.directives = [
                    {
                        kind: "Directive",
                        name: {
                            kind: "Name",
                            value: "profile"
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
                ] as DirectiveNode[];

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
    }, [profileQuery, debouncedProfileVariables.maxSize, debouncedProfileVariables])

    useEffect(() => {
        if (product && open) {
            const {maxSize} = debouncedProfileVariables
            const baseType = getBaseType(product.type) as GraphQLObjectType;
            const fields = Object.entries(baseType.getFields() || {})
                .filter(([_, field]) => isLeafType(getBaseType(field.type)))
            setColumns(fields.map(fields => [...fields, baseType]))
            const fieldList = fields.map(([name, _]) => name).join(' ')
            const sample = `@sample(count: 0) @profile`
            const query = `query profile${baseType.name} ${sample} { ${baseType.name}(limit: ${maxSize}) { ${fieldList} } }`
            setProfileQuery(query)
        }
    }, [open, product, debouncedProfileVariables]);

    useEffect(() => {
        if (open) {
            setLoading(true)
        } else {
            setLoading(false)
        }
    }, [open]);

    useEffect(() => {
        if (open && profileQuery) {
            setLoading(true)
            const headers = {
                'x-hasura-admin-secret': adminSecret,
                'x-hasura-role': role,
                'x-hasura-user': id,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
            const q = gql(profileQuery)
            const operationName = (q.definitions[0] as OperationDefinitionNode).name?.value || ''
            const body = JSON.stringify({
                operationName,
                query: profileQuery,
                variables: {}
            })
            fetch(process.env.NEXT_PUBLIC_URI || '', {
                method: 'POST',
                headers,
                body
            }).then(async (response) => {
                const rows = await response.json() as GraphQLResponse
                setRows(rows.extensions.profiling[Object.keys(rows.extensions.profiling)[0]])
                setTotalRowsAnalyzed((rows.extensions.actualDatasetSize[Object.keys(rows.extensions.profiling)[0]]))
                setLoading(false)
            }).catch(() => {
                setLoading(false)
            })
        }
    }, [adminSecret, id, open, profileQuery, role]);

    if (open) {
        return (<Dialog fullWidth={true} style={{padding: 0}} maxWidth={'lg'} open={open}
                        onClose={onClose}>
            <Backdrop open={loading}
                      sx={{
                          top: 0,
                          bottom: 0,
                          left: 0,
                          right: 0,
                          position: 'absolute',
                          color: 'transparent',
                          backgroundColor: 'rgba(241, 241, 241, 0.5)',
                          zIndex: (theme) => theme.zIndex.drawer + 1
                      }}>
                <CircularProgress color="secondary"/>
            </Backdrop>
            <DialogTitle style={{display: 'flex', justifyContent: 'space-between'}}>
                <ProfilerOptions formVariables={profileVariables} setFormVariables={setProfileVariables}/>
                <Typography variant="button" style={{marginRight: '30px'}}>Total Rows
                    Analyzed: {totalRowsAnalyzed}</Typography>
            </DialogTitle>
            <DialogCloseButton onClose={onClose}/>
            <DialogContent>
                <Box style={{height: '80vh'}}>
                    <List>
                        {columns?.map(([fieldName, field]) => {
                                return (<div key={fieldName}>
                                        <ListItemButton onClick={() => handleClick(fieldName)}>
                                            {expandedItems.includes(fieldName) ? <ExpandMoreIcon/> :
                                                <ChevronRightIcon/>}<ListItemText primary={fieldName}/>
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
        </Dialog>)
    }
    return null
}

export default ProfilerDialog;
