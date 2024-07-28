import React from "react";
import {Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography} from "@mui/material";
import {ShowRelationshipProps} from "./show-relationships";
import {getBaseType} from "../helpers/get-base-type";
import {GraphQLObjectType} from "graphql";

export const RelationshipTooltip: React.FC<ShowRelationshipProps> = ({product, readOrSelect}) => {
    return <>
        {!readOrSelect && <span style={{color: 'red'}}>No rights.</span>}
        {readOrSelect && <span style={{color: 'blue'}}>{`${readOrSelect} rights.`}</span>}
        <hr/>
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
        <Table size="small" sx={{'& .MuiTableCell-root': {padding: '4px', fontSize: '0.75rem'}}}>
            <TableHead>
                <TableCell>Field</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Rights</TableCell>
            </TableHead>
            <TableBody>
                {Object.entries((getBaseType(product?.type) as GraphQLObjectType)?.getFields() || {}).map(([name, field]) =>
                    <TableRow key={name}>
                        <TableCell>{name}</TableCell>
                        <TableCell>{field.type.toString()}</TableCell>
                        <TableCell>{field.description}</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </>
}