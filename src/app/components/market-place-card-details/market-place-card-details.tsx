import styles from './market-place-card-details.module.scss'
import React, {useEffect, useState} from "react";
import {Button, Card, CardActions, CardContent, CardHeader, Drawer} from "@mui/material";
import CancelIcon from '@mui/icons-material/Cancel';
import InsightsIcon from '@mui/icons-material/Insights';
import DatasetIcon from '@mui/icons-material/Dataset';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {useCurrentProductContext} from "../current-product-context/current-product-context";
import {ProductTable} from "../product-table/product-table";
import SamplerDialog from "../sampler-dialog/sampler-dialog";
import RequestDialog from "../request-dialog/request-dialog";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import {graphql, GraphQLError, print} from "graphql";

/* eslint-disable-next-line */
export interface MarketPlaceCardDetailsProps {
    anchor: Anchor
}

export type Anchor = 'left' | 'top' | 'right' | 'bottom'

export function MarketPlaceCardDetails({anchor}: MarketPlaceCardDetailsProps) {

    const {productRequestQuery, currentProduct, setCurrentProduct, selectedRelationships} = useCurrentProductContext()
    const [requestDialogOpen, setRequestDialogOpen] = useState(false)
    const [showSampler, setShowSampler] = useState(false)
    const {schema} = useGraphQLSchemaContext()
    const [queryErrors, setQueryErrors] = useState<Readonly<GraphQLError[]>>()

    useEffect(() => {
        if (schema && productRequestQuery) {
            graphql(schema, print(productRequestQuery)).then((e) => {
                if (e.data === null && e.errors?.length === 1) {
                    setQueryErrors([])
                } else {
                    setQueryErrors(e.errors ?? [])
                }
            })
        } else {
            setQueryErrors(undefined)
        }
    }, [productRequestQuery, schema]);

    const list = () => (
        <Card className={styles['market-place-card-details']}>
            <CardHeader title={currentProduct?.name}/>
            <CardContent className={styles['market-place-card-content']}>
                <ProductTable product={currentProduct}/>
            </CardContent>
            <CardActions>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon/>}
                    onClick={() => setCurrentProduct()}
                >
                    Cancel
                </Button>
                <Button
                    startIcon={<DatasetIcon/>}
                    variant="outlined"
                    color="secondary"
                    onClick={() => {
                        setShowSampler(true)
                    }}
                >
                    Sample
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<InsightsIcon/>}
                    color="secondary"
                >
                    Profile
                </Button>
                <Button
                    variant="contained"
                    startIcon={<NavigateNextIcon/>}
                    color="primary"
                    disabled={!queryErrors || queryErrors.length > 0}
                    onClick={() => setRequestDialogOpen(true)}
                >
                    Next
                </Button>
            </CardActions>
            <SamplerDialog product={undefined} open={showSampler} onClose={() => setShowSampler(false)}/>
            <RequestDialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)}/>
        </Card>
    );

    return (
        <div>
            <React.Fragment key={anchor}>
                <Drawer
                    PaperProps={{sx: {width: `${selectedRelationships?.length ? 80 : 40}%`}}}
                    anchor={anchor}
                    open={currentProduct !== undefined}
                >
                    {list()}
                </Drawer>
            </React.Fragment>
        </div>
    );
}

export default MarketPlaceCardDetails;
