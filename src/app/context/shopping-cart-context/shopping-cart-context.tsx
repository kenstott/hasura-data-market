import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import {FieldDescriptor} from "../../components/helpers/get-field-descriptors.js";
import {SelectedDataset} from "../../components/submit-request/submit-request-dialog.js";
import hash from 'object-hash'

export interface CartItem {
    selectedFields?: FieldDescriptor[]
    selectedDatasets?: SelectedDataset[]
    businessReason?: string
    key?: string
    deleted?: boolean
    startDate?: Date
    endDate?: Date
    role?: string
}

export type ShoppingCartContextType = {
    ShoppingCart?: CartItem[]
    isInShoppingCart: (item: CartItem) => boolean
    addToShoppingCart: (item: CartItem) => void
    removeFromShoppingCart: (item: CartItem) => void
    deleteShoppingCart: () => void
    updateShoppingCart: (item: CartItem) => void
    createHash: (item: CartItem) => string
};

const ShoppingCartContext = createContext<ShoppingCartContextType | undefined>(undefined);

export const useShoppingCartContext = () => {
    const context = useContext(ShoppingCartContext);
    if (!context) {
        throw new Error('useShoppingCartContext must be used within a GraphQLProvider');
    }
    return context;
};
export const ShoppingCartContextProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [ShoppingCart, setShoppingCart] = useState<CartItem[] | undefined>();

    const createHash = useCallback((item: CartItem): string => {
        const {selectedDatasets, selectedFields, businessReason} = item
        return hash(JSON.stringify({selectedDatasets, selectedFields, businessReason}))
    }, [])

    const addToShoppingCart = useCallback((item: CartItem) => {
        item.key = createHash(item)
        setShoppingCart(prevState => [...(prevState || []), item])
    }, [createHash])

    const updateShoppingCart = useCallback((item: CartItem) => {
        setShoppingCart(prevState => {
            const newState = [...(prevState || [])]
            const toChange = newState.findIndex(i => i.key === item.key)
            if (toChange !== -1) {
                delete item.key
                item.key = createHash(item)
                newState[toChange] = item
            }
            return newState
        })
    }, [createHash])

    const removeFromShoppingCart = useCallback((item: CartItem) => {
        const key = createHash(item)
        setShoppingCart(prevState => [...(prevState || []).filter((i) => i.key != key)])
    }, [createHash])

    const deleteShoppingCart = useCallback((): void => {
        setShoppingCart([])
    }, [])

    const isInShoppingCart = useCallback((item: CartItem) => {
        return !!ShoppingCart?.find(i => i.key === createHash(item))
    }, [ShoppingCart, createHash])

    return (
        <ShoppingCartContext.Provider
            value={{
                ShoppingCart,
                addToShoppingCart,
                removeFromShoppingCart,
                updateShoppingCart,
                createHash,
                deleteShoppingCart,
                isInShoppingCart
            }}>
            {children}
        </ShoppingCartContext.Provider>
    );
};
