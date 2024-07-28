// contexts/LoginContext.tsx
import React, {createContext, PropsWithChildren, useCallback, useContext, useEffect, useState} from "react";

export interface LoginContextType {
    id: string;
    role: string;
    password: string;
    adminSecret: string;
    updateFormValues: (values: LoginContextVariables) => void;
}

export type LoginContextVariables = Omit<LoginContextType, 'updateFormValues'>

const initialFormValues = {
    id: "",
    role: "",
    password: '',
    adminSecret: "",
};

const LoginContext = createContext<LoginContextType | undefined>(undefined);
const _window = typeof window !== 'undefined' ? window : undefined;

export const LoginProvider: React.FC<PropsWithChildren> = ({children}) => {

    const [formValues, setFormValues] =
        useState<LoginContextVariables>(initialFormValues);

    useEffect(() => {
        const result = _window?.localStorage?.getItem('data-marketplace:login')
        if (result) {
            setFormValues(JSON.parse(result))
        }
    }, []);

    const updateFormValues = useCallback((values: LoginContextVariables) => {
        setFormValues((prevValues) => ({...prevValues, ...values}));
        _window?.localStorage?.setItem('data-marketplace:login', JSON.stringify(values));
    }, []);

    return (
        <LoginContext.Provider value={{...formValues, updateFormValues}}>
            {children}
        </LoginContext.Provider>
    );
};

export const useLoginContext = () => {
    const context = useContext(LoginContext);
    if (!context) {
        throw new Error("useLoginContext must be used within a LoginProvider");
    }
    return context;
};
