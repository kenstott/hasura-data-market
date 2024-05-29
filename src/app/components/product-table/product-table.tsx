import {Product, useCurrentProductContext} from "../current-product-context/current-product-context";
import {
    Box,
    Checkbox,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {getBaseType} from "../market-place-card/market-place-card";
import React, {ReactNode, useEffect, useState} from "react";
import {
    DirectiveNode,
    FieldNode,
    GraphQLField,
    GraphQLObjectType,
    GraphQLScalarType,
    isLeafType,
    isObjectType,
    Kind,
    OperationDefinitionNode,
    print,
    SelectionNode
} from "graphql";
import gql from "graphql-tag";

/* eslint-disable-next-line */
export interface ProductFieldTableProps {
    product?: Product
}

type CheckedAll = 'unchecked' | 'checked' | 'indeterminate'

interface FieldTableProps {
    product?: Product,
    fields?: [string, GraphQLField<never, never>][]
    title?: ReactNode,
    root?: boolean
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };

type CheckedFields = Record<number, boolean>

const FieldTable: React.FC<FieldTableProps> =
    ({
         product,
         fields,
         title,
         root
     }) => {
        const [checkedFieldRows, setCheckedFieldRows] = useState<CheckedFields>();
        const [checkedAllFieldRows, setCheckedAllFieldRows] = useState<CheckedAll>('unchecked')
        const {setProductRequestQuery, selectedRelationships, productRequestQuery} = useCurrentProductContext()

        useEffect(() => {
            const values = Object.values(checkedFieldRows || {})
            const checked = values.filter(Boolean)
            if (checked.length === 0) {
                setCheckedAllFieldRows('unchecked')
            } else if (fields?.length === checked.length) {
                setCheckedAllFieldRows('checked')
            } else {
                setCheckedAllFieldRows('indeterminate')
            }
        }, [checkedFieldRows, fields])

        useEffect(() => {
            if (product && productRequestQuery) {
                const entries = Object.entries(checkedFieldRows || {}).reduce((acc, [name, checked]) => {
                    if (checked && fields) {
                        acc = [...acc, fields[parseInt(name)][1]]
                    }
                    return acc
                }, root ? selectedRelationships ?? [] : [] as GraphQLField<never, never>[])
                const newProductRequestQuery = gql(print(productRequestQuery))
                const queryOperation = newProductRequestQuery?.definitions?.find(
                    (def) => def.kind === 'OperationDefinition' && def.operation === 'query'
                ) as Writeable<OperationDefinitionNode>;
                const sampleDirective: DirectiveNode = {
                    kind: Kind.DIRECTIVE,
                    name: {
                        kind: Kind.NAME,
                        value: 'sample',
                    },
                    arguments: [
                        {
                            kind: 'Argument',
                            name: {
                                kind: 'Name',
                                value: 'count'
                            },
                            value: {
                                kind: 'IntValue',
                                value: '100'
                            }
                        },
                        {
                            kind: 'Argument',
                            name: {
                                kind: 'Name',
                                value: 'random'
                            },
                            value: {
                                kind: 'BooleanValue',
                                value: true
                            }
                        }
                    ],
                }
                queryOperation.directives = [sampleDirective]
                let baseQuery = (queryOperation?.selectionSet.selections[0] as Writeable<FieldNode>)
                baseQuery.arguments = [
                    {
                        kind: "Argument",
                        name: {
                            kind: "Name",
                            value: "limit"
                        },
                        value: {
                            kind: "IntValue",
                            value: "20000"
                        }
                    }
                ]
                if (baseQuery.name.value !== product.name) {
                    baseQuery = baseQuery.selectionSet?.selections
                        .find((i: SelectionNode) => (i as FieldNode).name.value === product.name) as Writeable<FieldNode>
                }

                if (baseQuery) {
                    if (!baseQuery.selectionSet) {
                        baseQuery.selectionSet = {kind: "SelectionSet", selections: []}
                    }

                    // Append the new field to the selection set
                    baseQuery.selectionSet.selections = (entries?.map(i => {
                        return baseQuery.selectionSet?.selections
                                .find(j => (j as FieldNode).name.value === i.name)
                            ?? {
                                kind: 'Field',
                                name: {
                                    kind: 'Name',
                                    value: i.name,
                                }
                            }
                    }) ?? []) as FieldNode[];
                    if (print(productRequestQuery) !== print(newProductRequestQuery)) {
                        setProductRequestQuery(newProductRequestQuery)
                    }

                }
            }
        }, [root, checkedFieldRows, fields, product, setProductRequestQuery, productRequestQuery, selectedRelationships])

        useEffect(() => {
            if (checkedAllFieldRows === 'checked' || checkedAllFieldRows === 'unchecked') {
                setCheckedFieldRows((prevRows) => {
                    return fields?.reduce((acc, _, index) => {
                        return ({...acc, [index]: checkedAllFieldRows === 'checked'})
                    }, prevRows) || {}
                })
            }
        }, [checkedAllFieldRows, fields]);


        const handleFieldCheckboxChange = (index: number) => {
            setCheckedFieldRows((prev) => ({
                ...prev,
                [index]: !prev?.[index]
            }))
        };


        return (checkedFieldRows &&
            <TableContainer sx={{margin: 1}} component={Paper}>
                <Typography variant="h6" gutterBottom>
                    {title !== undefined ? title : 'Fields'}
                </Typography>
                <Table sx={{
                    m: 2,
                    '& .MuiTableCell-sizeMedium': {
                        padding: '0px 5px',
                    },
                }}>
                    <TableHead>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell><Checkbox
                            checked={checkedAllFieldRows === 'checked'}
                            indeterminate={checkedAllFieldRows === 'indeterminate'}
                            onChange={() => {
                                if (checkedAllFieldRows === 'checked') {
                                    setCheckedAllFieldRows('unchecked')
                                } else {
                                    setCheckedAllFieldRows('checked')
                                }
                            }}
                        /></TableCell>
                    </TableHead>
                    {checkedFieldRows && <TableBody>
                        {fields?.map(([name, field], index) => (
                            <TableRow key={index}>
                                <TableCell>{name}</TableCell>
                                <TableCell>{field.description}</TableCell>
                                <TableCell>{(field.type as GraphQLScalarType).name || ''}</TableCell>
                                <TableCell>
                                    <Checkbox color="primary" checked={checkedFieldRows[index]}
                                              onChange={() => handleFieldCheckboxChange(index)}/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>}
                </Table>
            </TableContainer>)
    }

export function ProductTable({product}: ProductFieldTableProps) {
    const [fields, setFields] = useState<[string, GraphQLField<never, never>][]>();
    const [relationships, setRelationships] = useState<[string, GraphQLField<never, never>][]>();
    const [checkedRelationshipRows, setCheckedRelationshipRows] = useState<CheckedFields>({});

    const {
        selectedRelationships,
        setSelectedRelationships,
        setProductRequestQuery
    } = useCurrentProductContext()

    useEffect(() => {
        if (product?.type) {
            const baseType = getBaseType(product?.type)
            const query = gql(`
            query find${baseType} {
                ${baseType} {
                    fake
                }
            }`)
            setProductRequestQuery(query)
        }
    }, [product?.type, setProductRequestQuery]);

    const handleRelationshipCheckboxChange = (index: number) => {
        setCheckedRelationshipRows((prevCheckedRows) => ({
            ...prevCheckedRows,
            [index]: !prevCheckedRows[index],
        }));
    };
    useEffect(() => {
        const result = Object.entries(checkedRelationshipRows).reduce((acc, [index, checked]) => {
            if (checked && relationships) {
                acc.push(relationships[parseInt(index)][1])
            }
            return acc
        }, [] as Product[])
        setSelectedRelationships(result)
    }, [checkedRelationshipRows, relationships, setSelectedRelationships]);

    useEffect(() => {
        if (product) {
            const baseType = getBaseType(product?.type)
            if (isObjectType(baseType)) {
                const fields = Object.entries(baseType.getFields())
                    .filter(([_, field]) => isLeafType(getBaseType(field.type)))
                const relationships = Object.entries(baseType.getFields())
                    .filter(([name, field]) => !name.endsWith('_aggregate') && isObjectType(getBaseType(field.type)))
                setFields(fields)
                setRelationships(relationships)
            }
        }
    }, [product, product?.type])

    const RelationshipsTable = () => <TableContainer sx={{m: 1}} component={Paper}>
        <Typography variant="h6" gutterBottom>
            Relationships
        </Typography>
        <Table sx={{
            m: 2,
            '& .MuiTableCell-sizeMedium': {
                padding: '0 0',
            },
        }}
        >
            <TableHead>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Include</TableCell>
            </TableHead>
            <TableBody>
                {relationships?.map(([name, field], index) => (
                    <TableRow key={index}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{field.description}</TableCell>
                        <TableCell>{(getBaseType(field.type) as GraphQLObjectType).name || ''}</TableCell>
                        <TableCell>
                            <Checkbox color="primary" checked={checkedRelationshipRows[index]}
                                      onChange={() => handleRelationshipCheckboxChange(index)}/>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </TableContainer>

    const RelationshipTables = selectedRelationships?.map((i, index) => {
        const baseType = getBaseType(i.type) as GraphQLObjectType
        const fields = Object.entries(baseType.getFields())
            .filter(([_, field]) => isLeafType(getBaseType(field.type)))
        const Title = <div>{i.name}</div>
        return (
            <FieldTable product={i} title={Title} key={index} fields={fields}/>
        )
    })

    return <Box display="flex">
        <Box sx={{p: 1}} flex={1}>
            {(fields?.length ?? 0) > 0 && <FieldTable root={true} product={product} fields={fields}/>}
            {(relationships?.length ?? 0) > 0 && <RelationshipsTable/>}
        </Box>
        {(selectedRelationships?.length ?? 0) > 0 && (
            <Box sx={{p: 1}} flex={1}>{RelationshipTables} </Box>)}
    </Box>
}

export default ProductTable;
