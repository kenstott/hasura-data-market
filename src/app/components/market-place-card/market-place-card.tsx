import styles from './market-place-card.module.scss';
import {GraphQLField, GraphQLType, isLeafType, isListType, isObjectType, isWrappingType} from "graphql";
import {Button, Card, CardActions, CardContent, CardHeader} from "@mui/material";
import GearIcon from '@mui/icons-material/Settings';
import DatasetIcon from '@mui/icons-material/Dataset';
import InsightsIcon from '@mui/icons-material/Insights';
import BugReportIcon from '@mui/icons-material/BugReport';
import React, {useEffect, useState} from "react";
import {Product, useCurrentProductContext} from "../current-product-context/current-product-context";
import {SamplerDialog} from "../sampler-dialog/sampler-dialog";
import ProfilerDialog from "../profiler-dialog/profiler-dialog";
import AnomaliesDialog from "../anomalies-dialog/anomalies-dialog";

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
    const [displayFields, setDisplayFields] = useState<string | undefined>()
    const [relationships, setRelationships] = useState<[string, GraphQLField<never, never>][]>();
    const [displayRelationships, setDisplayRelationships] = useState<string | undefined>()
    const [openSampler, setOpenSampler] = useState(false)
    const [openProfiler, setOpenProfiler] = useState(false)
    const [openAnomalies, setOpenAnomalies] = useState(false)

    useEffect(() => {
        setDisplayFields(fields?.map(([name, _]) => name).join(', '))
    }, [fields]);

    useEffect(() => {
        setDisplayRelationships(relationships?.map(([name, field]) => `${name}${listTypeIsReferenced(field.type) ? '[]' : ''}`).join(', '))
    }, [relationships]);

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
                    {displayFields && (<div>
                        Fields: {displayFields}
                    </div>)}
                    {displayRelationships && (<div>
                        Relationships: {displayRelationships}
                    </div>)}
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
                        startIcon={<BugReportIcon/>}
                        color="primary"
                        onClick={() => setOpenAnomalies(true)}
                    >
                        Anomalies
                    </Button>
                </CardActions>
            </Card>
            <SamplerDialog product={product} open={openSampler} onClose={() => setOpenSampler(false)}/>
            <ProfilerDialog product={product} open={openProfiler} onClose={() => setOpenProfiler(false)}/>
            <AnomaliesDialog product={product} open={openAnomalies} onClose={() => setOpenAnomalies(false)}/>
        </React.Fragment>
    );
}

export default MarketPlaceCard;
