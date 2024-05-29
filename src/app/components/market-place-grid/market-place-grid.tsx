import styles from './market-place-grid.module.scss';
import {Box, CircularProgress} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import React, {useEffect, useState} from "react";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import MarketPlaceCard from "../market-place-card/market-place-card";
import MarketPlaceCardDetails from "../market-place-card-details/market-place-card-details";
import {Product} from "../current-product-context/current-product-context";

/* eslint-disable-next-line */
export interface MarketPlaceGridProps {
}

export const MarketPlaceGrid: React.FC<MarketPlaceGridProps> = () => {
    const [products, setProducts] = useState<Product[]>()
    const {schema} = useGraphQLSchemaContext()

    useEffect(() => {
        if (schema) {
            const products =
                Object.values(schema?.getQueryType()?.getFields() || {})
                    .filter((i) => !i.name.endsWith('_aggregate') && !i.name.endsWith('_pk'))
            setProducts(products)
        }
    }, [schema])

    if (schema && products) {
        return (
            <Box>
                <Grid className={styles['grid-container']} container spacing={2}>
                    {products?.map((item) => (
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
