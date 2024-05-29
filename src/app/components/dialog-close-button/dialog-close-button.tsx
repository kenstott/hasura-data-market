import CloseIcon from "@mui/icons-material/Close";
import {IconButton} from "@mui/material";
import React from "react";

/* eslint-disable-next-line */
export interface DialogCloseButtonProps {
    onClose: () => void
}

export const DialogCloseButton: React.FC<DialogCloseButtonProps> = ({onClose}) => {
    return (
        <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
            }}
        >
            <CloseIcon/>
        </IconButton>
    );
}

export default DialogCloseButton;
