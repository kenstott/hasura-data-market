import {GraphQLField} from "graphql";
import React from "react";
import {Box, Card, CardContent, CardHeader} from "@mui/material";
import {getBaseType} from "../helpers/get-base-type";
import ProductTable from "./product-table";

interface DetailPanelContentProps {
    field: GraphQLField<never, never>,
    path: string
}

export const DetailPanelContent: React.FC<DetailPanelContentProps> = ({field, path}) => {
    const parts = getBaseType(field.type)?.toString().split('_')
    const title = parts && parts.length > 1 ? parts[0] + ' / ' + parts.slice(1).join('_') : getBaseType(field.type)?.toString()
    return <Box p={1}><Card>
        <CardHeader title={title}/>
        <CardContent>
            <ProductTable product={field} path={path}/>
        </CardContent>
    </Card></Box>
}