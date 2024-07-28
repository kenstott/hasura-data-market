import React, {useCallback, useEffect, useState} from "react";
import {usePoliciesContext} from "../policies-context/policies-context";
import {GraphQLField, isObjectType} from "graphql";
import {Product} from "../current-product-context/current-product-context";

import {getBaseType} from "../helpers/get-base-type";
import {HtmlTooltip} from "../helpers/html-tooltip";
import {RelationshipTooltip} from "./relationship-tooltip";
import {ReadOrSelect} from "../submit-request/submit-request-dialog";
import {Box} from "@mui/material";

export interface ShowRelationshipProps {
    product?: Product,
    readOrSelect?: ReadOrSelect,
    noLabel?: boolean
}

export const ShowRelationships: React.FC<ShowRelationshipProps> = ({product, noLabel}) => {
    const {policySummary} = usePoliciesContext()
    const [relationships, setRelationships] = useState<[string, GraphQLField<never, never>][]>([])
    // const [baseType, setBaseType] = useState<GraphQLObjectType>()

    const canRead = useCallback((fieldName: string) => {
        const relationship = relationships.find(([name, _field]) => name === fieldName)
        if (relationship) {
            const relationshipBaseType = getBaseType(relationship[1].type)
            if (relationshipBaseType) {
                const relationshipPolicy = policySummary?.[relationshipBaseType.toString()]
                if (relationshipPolicy) {
                    return <HtmlTooltip style={{width: '400px '}}
                                        title={<RelationshipTooltip readOrSelect={relationshipPolicy.readOrSelect}
                                                                    product={relationship[1]}/>}>
                        <i>{fieldName}</i>
                    </HtmlTooltip>
                }

                return <HtmlTooltip style={{width: '400px '}}
                                    title={<RelationshipTooltip product={relationship[1]}/>}>
                    <span>{fieldName}</span>
                </HtmlTooltip>
            }
        }
        return <HtmlTooltip
            title={<div style={{color: 'red'}}>No read rights.</div>}><span>{fieldName}</span></HtmlTooltip>
    }, [policySummary, relationships])

    useEffect(() => {
        const baseType = getBaseType(product?.type)
        if (isObjectType(baseType)) {
            const fields = Object.entries(baseType.getFields()).filter(([_, field]) => isObjectType(getBaseType(field.type)))
            setRelationships(fields)
        }
    }, [product?.type])
    return <Box sx={{mt: '7px', p: 0}}>
        {relationships?.length && !noLabel ? <>
            <hr/>
            <b>Relationships:</b> </> : <></>}
        {(relationships || []).map(([name,], index) =>
            <React.Fragment key={name}>
                {index > 0 && ', '}
                {canRead(name)}<span>[]</span>
            </React.Fragment>)}
    </Box>
}