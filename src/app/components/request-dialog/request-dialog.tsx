import styles from './request-dialog.module.scss';
import DialogTitle from "@mui/material/DialogTitle";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {Box, Button, DialogActions, DialogContent} from "@mui/material";
import RequestQuery from "../request-query/request-query";
import CancelIcon from "@mui/icons-material/Cancel";
import Dialog from "@mui/material/Dialog";
import React from "react";

/* eslint-disable-next-line */
export interface RequestDialogProps {
    open: boolean;
    onClose: () => void;
}

export const RequestDialog: React.FC<RequestDialogProps> = ({open, onClose}) => {
    return (
        <Dialog fullWidth={true} className={styles['request-dialog']}
                maxWidth={'lg'} open={open} onClose={onClose}>
            <DialogTitle>Review Your Data Request</DialogTitle>
            <DialogCloseButton onClose={onClose}/>
            <DialogContent className={styles['request-dialog-content']}>
                <Box className={styles['request-dialog-content']}>
                    <RequestQuery/>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button color={'primary'} variant={'contained'} onClick={onClose}>Submit
                    Request</Button>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<CancelIcon/>}
                    onClick={onClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default RequestDialog;
