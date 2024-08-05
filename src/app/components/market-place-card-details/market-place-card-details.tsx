import styles from './market-place-card-details.module.scss'
import React, {useEffect, useState} from "react";
import {Button, Card, CardActions, CardContent, CardHeader, Drawer} from "@mui/material";
import CancelIcon from '@mui/icons-material/Cancel';
import InsightsIcon from '@mui/icons-material/Insights';
import DatasetIcon from '@mui/icons-material/Dataset';
import BugReportIcon from '@mui/icons-material/BugReport';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {useCurrentProductContext} from "../../context/current-product-context/current-product-context";
import ProductTable from "../product-table/product-table";
import SamplerDialog from "../sampler-dialog/sampler-dialog";
import RequestDialog from "../request-dialog/request-dialog";
import {useGraphQLSchemaContext} from "../../context/graphql-schema-context/graphql-schema-context";
import {graphql, GraphQLError, print} from "graphql";
import ProfilerDialog from "../profiler-dialog/profiler-dialog";
import AnomaliesDialog from "../anomalies-dialog/anomalies-dialog";
import gql from "graphql-tag";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import AskMeDialog from "../ask-me-dialog/ask-me-dialog";
import {getBaseType} from "../helpers/get-base-type";

/* eslint-disable-next-line */
export interface MarketPlaceCardDetailsProps {
    anchor: Anchor
}

export type Anchor = 'left' | 'top' | 'right' | 'bottom'

export function MarketPlaceCardDetails({anchor}: MarketPlaceCardDetailsProps) {

    const {productRequestQuery, currentProduct, setCurrentProduct} = useCurrentProductContext()
    const [requestDialogOpen, setRequestDialogOpen] = useState(false)
    const [showSampler, setShowSampler] = useState(false)
    const [showAskMe, setShowAskMe] = useState(false)
    const [showProfiler, setShowProfiler] = useState(false)
    const [showAnomalies, setShowAnomalies] = useState(false)
    const {schema} = useGraphQLSchemaContext()
    const [queryErrors, setQueryErrors] = useState<Readonly<GraphQLError[]>>()
    const [requestSubmitted, setRequestSubmitted] = useState(false)

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

    const parts = getBaseType(currentProduct?.type)?.toString().split('_')
    const title = parts && parts.length > 1 ? parts[0] + ' / ' + parts.slice(1).join('_') : getBaseType(currentProduct?.type)?.toString()

    const list = () => (
        <Card className={styles['market-place-card-details']}>
            <CardHeader title={title}/>
            <CardContent className={styles['market-place-card-content']}>
                <ProductTable product={currentProduct} path={""}/>
            </CardContent>
            <CardActions>
                <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    startIcon={<CancelIcon/>}
                    onClick={() => setCurrentProduct()}
                >
                    Cancel
                </Button>
                <Button
                    startIcon={<DatasetIcon/>}
                    variant="outlined"
                    color="secondary"
                    size="small"
                    disabled={!queryErrors || queryErrors.length > 0}
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
                    size="small"
                    disabled={!queryErrors || queryErrors.length > 0}
                    onClick={() => {
                        setShowProfiler(true)
                    }}
                >
                    Profile
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<BugReportIcon/>}
                    color="secondary"
                    size="small"
                    disabled={!queryErrors || queryErrors.length > 0}
                    onClick={() => {
                        setShowAnomalies(true)
                    }}
                >
                    Anomalies
                </Button>
                <Button
                    variant="outlined"
                    startIcon={<SupportAgentIcon/>}
                    color="secondary"
                    size="small"
                    disabled={!queryErrors || queryErrors.length > 0}
                    onClick={() => {
                        setShowAskMe(true)
                    }}
                >
                    Ask&nbsp;Me
                </Button>
                <Button
                    variant="contained"
                    startIcon={<NavigateNextIcon/>}
                    color="primary"
                    size="small"
                    disabled={!queryErrors || queryErrors.length > 0}
                    onClick={() => setRequestDialogOpen(true)}
                >
                    Next
                </Button>
            </CardActions>
            {showSampler && <SamplerDialog open={showSampler}
                                           query={productRequestQuery ? gql(print(productRequestQuery)) : undefined}
                                           onClose={() => setShowSampler(false)}/>}
            {showProfiler && <ProfilerDialog open={showProfiler}
                                             query={productRequestQuery ? gql(print(productRequestQuery)) : undefined}
                                             onClose={() => setShowProfiler(false)}/>}
            {showAnomalies && <AnomaliesDialog open={showAnomalies}
                                               query={productRequestQuery ? gql(print(productRequestQuery)) : undefined}
                                               onClose={() => setShowAnomalies(false)}/>}
            {showAskMe && <AskMeDialog open={showAskMe}
                                       query={productRequestQuery ? gql(print(productRequestQuery)) : undefined}
                                       onClose={() => setShowAskMe(false)}/>}
            <RequestDialog
                onCompleted={() => {
                    setRequestDialogOpen(false)
                    setRequestSubmitted(true)
                    setCurrentProduct(undefined)
                }}
                open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)}/>
        </Card>
    );

    return (
        <div>
            <React.Fragment key={anchor}>
                <Drawer
                    PaperProps={{sx: {width: '40%', minWidth: '580px'}}}
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
