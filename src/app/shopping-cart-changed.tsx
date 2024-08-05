import React, {useEffect, useState} from "react";
import {useShoppingCartContext} from "./context/shopping-cart-context/shopping-cart-context";
import {usePoliciesContext} from "./context/policies-context/policies-context";
import {Snackbar} from "@mui/material";

export const ShoppingCartChanged: React.FC = () => {
    const [shoppingCartChanged, setShoppingCartChanged] = useState(false)
    const {ShoppingCart} = useShoppingCartContext()
    const [shoppingCartLength, setShoppingCartLength] = useState(ShoppingCart?.length || 0)
    const {setTick} = usePoliciesContext()

    useEffect(() => {
        const interval = setInterval(() => {
            setTick((prev) => prev + 1)
        }, 5000)
        return () => {
            clearInterval(interval)
        }
    }, [setTick])

    useEffect(() => {
        setShoppingCartLength(ShoppingCart?.length || 0)
    }, [ShoppingCart])

    useEffect(() => {
        setShoppingCartChanged(true)
    }, [shoppingCartLength]);

    return <Snackbar
        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        open={shoppingCartChanged}
        autoHideDuration={6000}
        style={{width: '400px'}}
        onClose={() => setShoppingCartChanged(false)}
        message={shoppingCartLength === 0 ? "Your shopping cart is empty" : "Your data request was added to your shopping cart"}
    />
}