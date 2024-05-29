import styles from './login-dialog.module.scss';
import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {LoginContextVariables, useLoginContext} from "../login-context/login-context";
import {DialogActions, FormControl, FormHelperText, Input, InputLabel} from "@mui/material";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";

interface LoginDialogProps {
    open: boolean;
    onClose: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({open, onClose}) => {
    const {id, role, password, adminSecret, updateFormValues} = useLoginContext()
    const [formData, setFormData] =
        useState<LoginContextVariables>({id: "", role: "", password: "", adminSecret: ""})

    useEffect(() => {
        setFormData({id, role, password, adminSecret})
    }, [id, role, password, adminSecret]);
    const handleSave = () => {
        updateFormValues(formData)
        onClose();
    };

    const handleInputChange = (e: { target: { id: string; value: string; }; }) => {
        const {id, value} = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [id]: value,
        }));
    };

    return (
        <Dialog open={open} onClose={onClose} aria-labelledby="login-dialog-title">
            <DialogCloseButton onClose={onClose}/>
            <DialogTitle id="login-dialog-title">Login</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please fill in the following details:
                </DialogContentText>
                <FormControl fullWidth className={styles['form-control']}>
                    <InputLabel htmlFor="id">ID</InputLabel>
                    <Input id="id" value={formData.id} onChange={handleInputChange}/>
                </FormControl>
                <FormControl fullWidth className={styles['form-control']}>
                    <InputLabel htmlFor="role">Role</InputLabel>
                    <Input id="role" value={formData.role} onChange={handleInputChange}/>
                </FormControl>
                <FormControl fullWidth className={styles['form-control']}>
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <Input id="password" value={formData.password} onChange={handleInputChange}/>
                </FormControl>
                <FormControl fullWidth className={styles['form-control']}>
                    <InputLabel htmlFor="adminSecret">Admin Secret</InputLabel>
                    <Input id="adminSecret" value={formData.adminSecret}
                           onChange={handleInputChange}/>
                </FormControl>
                <FormHelperText>We&apos;ll never share your information.</FormHelperText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSave} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

LoginDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default LoginDialog;

