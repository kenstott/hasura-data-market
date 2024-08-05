import React from "react";
import {useShoppingCartContext} from "./context/shopping-cart-context/shopping-cart-context";
import {Badge, IconButton} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

export const ShoppingCartButton: React.FC<{ onClick: () => void }> = ({onClick}) => {
    const {ShoppingCart} = useShoppingCartContext()
    if (!ShoppingCart?.length) {
        return null
    }
    return <IconButton onClick={onClick} edge="end" color="inherit">
        <Badge badgeContent={ShoppingCart?.length} color="secondary">
            <ShoppingCartIcon/>
        </Badge>
    </IconButton>
}