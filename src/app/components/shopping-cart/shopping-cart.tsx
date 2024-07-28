import {useShoppingCartContext} from "../shopping-cart-context/shopping-cart-context";
import Dialog from "@mui/material/Dialog";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {Button, DialogActions} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import CancelIcon from "@mui/icons-material/Cancel";
import React, {useEffect, useState} from "react";
import {usePoliciesContext} from "../policies-context/policies-context";
import {ShoppingCartItem} from "./shopping-cart-item";

/* eslint-disable-next-line */
export interface ShoppingCartProps {
    open: boolean
    onClose: () => void
    onSubmittedRequest: () => void
}

export const ShoppingCartDialog: React.FC<ShoppingCartProps> = ({open, onClose, onSubmittedRequest}) => {
    const {ShoppingCart, deleteShoppingCart} = useShoppingCartContext()
    const [editing, setEditing] = useState('')
    const {updatePolicies} = usePoliciesContext()

    useEffect(() => {
        if (ShoppingCart?.length === 0) {
            onClose()
        } else {
            setEditing('')
        }
    }, [ShoppingCart, onClose]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xl"}>
            <DialogCloseButton onClose={onClose}/>
            <DialogTitle>Shopping Cart</DialogTitle>
            <DialogContent>
                {ShoppingCart?.filter(item => !editing || item.key === editing).map((item) => {
                    return (<ShoppingCartItem item={item} key={item.key} setEditing={setEditing}/>)
                })}
            </DialogContent>
            <DialogActions>
                {editing.length === 0 && <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                        if (ShoppingCart) {
                            updatePolicies(ShoppingCart)
                            deleteShoppingCart()
                            onSubmittedRequest()
                        }
                    }}
                    startIcon={<NavigateNextIcon/>}
                >
                    Submit Request
                </Button>}
                <Button
                    variant="outlined"
                    color="secondary"
                    onClick={onClose}
                    startIcon={<CancelIcon/>}>
                    Keep Shopping
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ShoppingCartDialog;
