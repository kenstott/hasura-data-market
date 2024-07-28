import {styled} from "@mui/material/styles";
import Tooltip, {tooltipClasses, TooltipProps} from "@mui/material/Tooltip";
import React from "react";

export const HtmlTooltip = styled(({className, ...props}: TooltipProps) => (
    <Tooltip {...props} classes={{popper: className}}/>
))(({theme}) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: '#f5f5f9',
        color: 'rgba(0, 0, 0, 0.87)',
        maxWidth: 400,
        minWidth: 300,
        fontSize: theme.typography.pxToRem(12),
        border: '1px solid #dadde9',
    },
}));