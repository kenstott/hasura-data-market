import React, {useEffect, useState} from "react";
import {usePoliciesContext} from "../../context/policies-context/policies-context";
import {Product} from "../../context/current-product-context/current-product-context";

import {getBaseType} from "../helpers/get-base-type";
import {Box} from "@mui/material";

export interface ShowTypeProps {
    product?: Product,
    noLabel?: boolean
}

export const ShowType: React.FC<ShowTypeProps> = ({product, noLabel}) => {
    const {policySummary} = usePoliciesContext()
    const [read, setRead] = useState(false)

    useEffect(() => {
        const baseType = getBaseType(product?.type)
        setRead(!!policySummary?.[baseType?.toString() || '']?.readOrSelect)
    }, [policySummary, product?.type])

    return <Box sx={{mt: '7px', p: 0}}>
        {!noLabel ? <>
            <b>Type:</b> </> : <></>}
        <span
            style={{fontStyle: read ? 'italic' : 'normal'}}>{getBaseType(product?.type)?.toString?.()?.replace('_', ' / ')}</span>
    </Box>
}