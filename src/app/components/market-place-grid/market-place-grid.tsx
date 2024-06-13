import styles from './market-place-grid.module.scss';
import {Box, CircularProgress} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import React, {useEffect, useState} from "react";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import MarketPlaceCard, {getBaseType} from "../market-place-card/market-place-card";
import MarketPlaceCardDetails from "../market-place-card-details/market-place-card-details";
import {Product} from "../current-product-context/current-product-context";
import {isEnumType, isLeafType, isObjectType} from "graphql";
import {useSearchContext} from "../search-context/search-context";

/* eslint-disable-next-line */
export interface MarketPlaceGridProps {
}

export const MarketPlaceGrid: React.FC<MarketPlaceGridProps> = () => {
    const [products, setProducts] = useState<Product[]>()
    const [searchable, setSearchable] = useState<string[]>([])
    const {hasuraSchema} = useGraphQLSchemaContext()
    const {search} = useSearchContext()

    useEffect(() => {
        if (hasuraSchema) {
            const products =
                Object.values(hasuraSchema?.getQueryType()?.getFields() || {})
                    .filter((i) => !i.name.endsWith('_aggregate') && !i.name.endsWith('_pk') && i.name !== '_service')
            setProducts(products)
        }
    }, [hasuraSchema])

    useEffect(() => {
        if (products) {
            const newSearchable = []
            for (const product of products) {
                const baseType = getBaseType(product.type)
                if (isObjectType(baseType)) {
                    const fields = Object.entries(baseType.getFields()).filter(([_, field]) => isLeafType(getBaseType(field.type)))
                    const relationships = Object.entries(baseType.getFields()).filter(([_, field]) => isObjectType(getBaseType(field.type)))
                    const track = [] as string[]
                    track.push(product.name)
                    track.push(product.description || '')
                    if (fields) {
                        for (const [fieldName, fieldType] of fields) {
                            track.push(fieldName)
                            track.push(fieldType.description ?? '')
                        }
                    }
                    if (relationships) {
                        for (const [fieldName, fieldType] of relationships) {
                            track.push(fieldName)
                            track.push(fieldType.description ?? '')
                            const baseType = getBaseType(fieldType.type)
                            if (baseType && (isEnumType(baseType) || isObjectType(baseType))) {
                                track.push(baseType.description ?? '')
                            }
                        }
                    }
                    newSearchable.push(track.join(' '))
                }
            }
            setSearchable(newSearchable)
            return
        }
        setSearchable([])
    }, [products]);

    if (hasuraSchema && products) {
        return (
            <Box>
                <Grid className={styles['grid-container']} container spacing={2}>
                    {products?.filter((_, index) => search?.test(searchable[index]))
                        .map((item,) => (
                            <Grid xs={12} sm={6} md={4} key={item.name}>
                                <MarketPlaceCard product={item}/>
                            </Grid>
                        ))}
                </Grid>
                <MarketPlaceCardDetails anchor={'right'}/>
            </Box>
        );
    } else {
        return (
            <div className={styles['progress-container']}>
                <CircularProgress size={300}/>
            </div>
        )
    }
};

export default MarketPlaceGrid;
