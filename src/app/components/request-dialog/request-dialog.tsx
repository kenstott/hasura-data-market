import styles from './request-dialog.module.scss';
import DialogTitle from "@mui/material/DialogTitle";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {Box, Button, DialogActions, DialogContent} from "@mui/material";
import {RequestQuery} from "../request-query/request-query";
import CancelIcon from "@mui/icons-material/Cancel";
import Dialog from "@mui/material/Dialog";
import React, {useState} from "react";
import {SubmitRequestDialog} from "../submit-request/submit-request-dialog";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

/* eslint-disable-next-line */
export interface RequestDialogProps {
    open: boolean;
    onClose: () => void;
    onCompleted: () => void;
}

export const RequestDialog: React.FC<RequestDialogProps> = ({open, onClose, onCompleted}) => {
    const [showSubmitRequest, setShowSubmitRequest] = useState(false)
    return (
        <>
            <Dialog fullWidth={true} className={styles['request-dialog']}
                    maxWidth={'xl'} open={open} onClose={onClose}>
                <DialogTitle>Review Your Data Request</DialogTitle>
                <DialogCloseButton onClose={onClose}/>
                <DialogContent className={styles['request-dialog-content']}>
                    <Box className={styles['request-dialog-content']}>
                        <RequestQuery/>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button startIcon={<NavigateNextIcon/>} color={'primary'} variant={'contained'}
                            onClick={() => setShowSubmitRequest(true)}>Next</Button>
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
            <SubmitRequestDialog
                open={showSubmitRequest}
                onCompleted={() => {
                    setShowSubmitRequest(false)
                    onCompleted()
                }}
                onClose={() => setShowSubmitRequest(false)}/>
        </>
    );
}

export default RequestDialog;
