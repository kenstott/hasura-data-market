import React from "react";
import {Grid, Typography} from "@mui/material";
import {ShowFieldProps} from "./show-fields";

export const FieldTooltip: React.FC<ShowFieldProps> = ({product, read}) => {
    return <>
        {!read && <span style={{color: 'red'}}>No read rights.</span>}
        {!read && <hr/>}
        <Grid container spacing={0}>
            <Grid item xs={3}>
                <Typography>Name:</Typography>
            </Grid>
            <Grid item xs={9}>
                <Typography>{product?.name}</Typography>
            </Grid>
            <Grid item xs={3}>
                <Typography>Type:</Typography>
            </Grid>
            <Grid item xs={9}>
                <Typography>{product?.type.toString()}</Typography>
            </Grid>
        </Grid>
        {product?.description && <hr/>}
        {product?.description}
    </>
}