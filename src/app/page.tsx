'use client'
import RequestQuery from "./components/request-query/request-query";
import MarketPlaceGrid from "./components/market-place-grid/market-place-grid";
import React from "react";
import {Box} from "@mui/material";

const Index = () => {
    return (<Box style={{height: '100%'}} p={1}><MarketPlaceGrid/></Box>)
}

export default Index;