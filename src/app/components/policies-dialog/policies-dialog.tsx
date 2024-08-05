import {CartItem} from "../../context/shopping-cart-context/shopping-cart-context";
import Dialog from "@mui/material/Dialog";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import {Button, DialogActions} from "@mui/material";
import React, {useEffect, useState} from "react";
import {Policy, Product, usePoliciesContext} from "../../context/policies-context/policies-context";
import {useCurrentProductContext} from "../../context/current-product-context/current-product-context";
import {PoliciesDialogItem} from "./policies-dialog-item";
import {getBaseType} from "../helpers/get-base-type";

/* eslint-disable-next-line */
export interface PoliciesDialogProps {
    product: Product
    open: boolean
    onClose: () => void
}

export const PoliciesDialog: React.FC<PoliciesDialogProps> = ({product, open, onClose}) => {
    const {Policies} = usePoliciesContext()
    const [relevantPolicies, setRelevantPolicies] = useState<CartItem[]>([])
    const {setCurrentProduct} = useCurrentProductContext();

    useEffect(() => {
        if (Policies) {
            const test = Policies?.filter((i: Policy) => {
                return i.selectedDatasets?.find((j) => {
                    return j.readOrSelect === 'select' && j.objectType.toString() === getBaseType(product.type)?.toString()
                })
            })
            setRelevantPolicies(test)
        }
    }, [Policies, product]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth={"xl"}>
            <DialogCloseButton onClose={onClose}/>
            <DialogTitle>Current Policies</DialogTitle>
            <DialogContent>
                {relevantPolicies.filter(item => !item.deleted).map((item: CartItem) => <PoliciesDialogItem item={item}
                                                                                                            key={item.key}/>)}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    onClose()
                    setCurrentProduct?.(product)
                }}>Make an Additional Request</Button>
            </DialogActions>
        </Dialog>
    )
}

export default PoliciesDialog;
