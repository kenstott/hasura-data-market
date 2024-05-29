import styles from './market-place-card.module.scss';
import {GraphQLField, GraphQLType, isLeafType, isListType, isObjectType, isWrappingType} from "graphql";
import {Button, Card, CardActions, CardContent, CardHeader} from "@mui/material";
import GearIcon from '@mui/icons-material/Settings';
import DatasetIcon from '@mui/icons-material/Dataset';
import InsightsIcon from '@mui/icons-material/Insights';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import React, {useEffect, useState} from "react";
import {Product, useCurrentProductContext} from "../current-product-context/current-product-context";
import SamplerDialog from "../sampler-dialog/sampler-dialog";
import ProfilerDialog from "../profiler-dialog/profiler-dialog";

/* eslint-disable-next-line */
export interface MarketPlaceCardProps {
    product: Product
}

export const getBaseType = (t?: GraphQLType): GraphQLType | undefined => {
    if (t) {
        if (isWrappingType(t)) {
            return getBaseType(t.ofType)
        }
    }
    return t;
}
const listTypeIsReferenced = (t: GraphQLType): boolean => {
    if (isListType(t)) {
        return true
    } else if (isWrappingType(t)) {
        return listTypeIsReferenced(t.ofType)
    }
    return false;
}

export function MarketPlaceCard({product}: MarketPlaceCardProps) {
    const [fields, setFields] = useState<[string, GraphQLField<never, never>][]>();
    const [relationships, setRelationships] = useState<[string, GraphQLField<never, never>][]>();
    const [openSampler, setOpenSampler] = useState(false)
    const [openProfiler, setOpenProfiler] = useState(false)
    useEffect(() => {
        const baseType = getBaseType(product.type)
        if (isObjectType(baseType)) {
            const fields = Object.entries(baseType.getFields()).filter(([_, field]) => isLeafType(getBaseType(field.type)))
            const relationships = Object.entries(baseType.getFields()).filter(([_, field]) => isObjectType(getBaseType(field.type)))
            setFields(fields)
            setRelationships(relationships)
        }
    }, [product.type])
    const {setCurrentProduct} = useCurrentProductContext();
    return (
        <React.Fragment>
            <Card>
                <CardHeader className={styles['data-card-header']} title={product.name}>{product.name}</CardHeader>
                <CardContent>
                    <div>
                        Fields: {fields?.map(([name, _]) => name).join(', ')}
                    </div>
                    <div>
                        Relationships: {relationships?.map(([name, field]) => `${name}${listTypeIsReferenced(field.type) ? '[]' : ''}`).join(', ')}
                    </div>
                </CardContent>
                <CardActions>
                    <Button
                        startIcon={<GearIcon/>}
                        color="primary"
                        onClick={() => {
                            setCurrentProduct?.(product)
                        }}
                    >
                        Request
                    </Button>
                    <Button
                        startIcon={<DatasetIcon/>}
                        color="primary"
                        onClick={() => setOpenSampler(true)}
                    >
                        Sample
                    </Button>
                    <Button
                        startIcon={<InsightsIcon/>}
                        color="primary"
                        onClick={() => setOpenProfiler(true)}
                    >
                        Profile
                    </Button>
                    <Button
                        startIcon={<DataUsageIcon/>}
                        color="primary"
                    >
                        Usage
                    </Button>
                </CardActions>
            </Card>
            <SamplerDialog product={product} open={openSampler} onClose={() => setOpenSampler(false)}/>
            <ProfilerDialog product={product} open={openProfiler} onClose={() => setOpenProfiler(false)}/>
        </React.Fragment>
    );
}

export default MarketPlaceCard;
