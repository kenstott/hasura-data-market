'use client'

import React from "react";
import {Box} from "@mui/material";
import RequestQuery from "../../components/request-query/request-query";

function RequestQueryPage() {
    return (<Box style={{height: '100%'}} p={1}>
        <RequestQuery/>
    </Box>)
}

export default RequestQueryPage