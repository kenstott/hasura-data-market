import {Product} from "../current-product-context/current-product-context";
import React, {useCallback, useEffect, useState} from "react";
import {usePoliciesContext} from "../policies-context/policies-context";
import {GraphQLField, GraphQLObjectType, isLeafType, isObjectType} from "graphql";

import {getBaseType} from "../helpers/get-base-type";
import {HtmlTooltip} from "../helpers/html-tooltip";
import {FieldTooltip} from "./field-tooltip";
import {Box} from "@mui/material";

export interface ShowFieldProps {
    product?: Product,
    read?: boolean
    noLabel?: boolean
}

export const ShowFields: React.FC<ShowFieldProps> = ({product, noLabel}) => {
    const {policySummary} = usePoliciesContext()
    const [fields, setFields] = useState<[string, GraphQLField<never, never>][]>()
    const [baseType, setBaseType] = useState<GraphQLObjectType>()

    const canRead = useCallback((fieldName: string) => {
        const productPolicy = policySummary?.[baseType?.name || '']
        if (productPolicy && productPolicy.fields[fieldName]) {
            return <HtmlTooltip style={{width: '400px'}}
                                title={<FieldTooltip read={true}
                                                     product={productPolicy.fields[fieldName]}/>}><i>{fieldName}</i></HtmlTooltip>
        } else if (baseType?.getFields()[fieldName]) {
            return <HtmlTooltip style={{width: '400px'}}
                                title={<FieldTooltip read={false}
                                                     product={baseType.getFields()[fieldName]}/>}><span>{fieldName}</span></HtmlTooltip>
        }
        return <HtmlTooltip
            title={<div style={{color: 'red'}}>No read rights.</div>}><span>{fieldName}</span></HtmlTooltip>
    }, [baseType, policySummary])

    useEffect(() => {
        const baseType = getBaseType(product?.type)
        if (isObjectType(baseType)) {
            const fields = Object.entries(baseType.getFields()).filter(([_, field]) => isLeafType(getBaseType(field.type)))
            setFields(fields)
            setBaseType(baseType)
        }
    }, [product?.type])
    return <Box sx={{mt: '7px', p: 0}}>
        {fields?.length && !noLabel ? <b>Fields: </b> : <></>}
        {(fields || []).map(([name,], index) =>
            <React.Fragment key={name}>
                {index > 0 && ', '}
                {canRead(name)}
            </React.Fragment>)}
    </Box>
}