import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import {MongoDbUpsertMany, UpsertManyFunction} from "../../api/mongodb/upsertMany/route";
import {MongoDbInsertResponse} from "../../api/mongodb/insertMany/route";
import {useLoginContext} from "../login-context/login-context";
import {DeleteManyFunction, MongoDbDelete, MongoDbDeleteResponse} from "../../api/mongodb/deleteMany/route";
import {MongoDbFind} from "../../api/mongodb/find/route";


export type DataContextType = {
    loading: boolean
    upsertMany: UpsertManyFunction
    deleteMany: DeleteManyFunction
    find: <T>(options: MongoDbFind) => Promise<T>
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useDataContext = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext must be used within a GraphQLProvider');
    }
    return context;
};
export const DataContextProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [loading, setLoading] = useState(false)
    const {headers} = useLoginContext()

    const upsertMany = useCallback(async (options: MongoDbUpsertMany): Promise<MongoDbInsertResponse> => {
        try {
            setLoading(true)
            return (await fetch('/api/mongodb/upsertMany', {
                method: 'POST', headers, body: JSON.stringify(options)
            })).json()
        } finally {
            setLoading(false)
        }
    }, [headers])

    const deleteMany = useCallback(async (options: MongoDbDelete): Promise<MongoDbDeleteResponse> => {
        try {
            setLoading(true)
            return (await fetch('/api/mongodb/deleteMany', {
                method: 'POST', headers, body: JSON.stringify(options)
            })).json()
        } finally {
            setLoading(false)
        }
    }, [headers])

    const find: <T>(options: MongoDbFind) => Promise<T> = useCallback(async (options: MongoDbFind): Promise<never> => {
        try {
            setLoading(true)
            return await (await fetch('/api/mongodb/upsertMany', {
                method: 'POST', headers, body: JSON.stringify(options)
            })).json() as never
        } finally {
            setLoading(false)
        }
    }, [headers])


    return (
        <DataContext.Provider
            value={{
                loading,
                upsertMany,
                deleteMany,
                find
            }}>
            {children}
        </DataContext.Provider>
    );
};
