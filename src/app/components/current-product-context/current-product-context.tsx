import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {DocumentNode, GraphQLField, print} from "graphql";

export type Product = GraphQLField<never, never>
export type CurrentProductContextType = {
    currentProduct?: Product
    productRequestQuery?: DocumentNode
    modifiedProductRequestQuery?: DocumentNode
    selectedFields?: GraphQLField<never, never>[]
    selectedRelationships?: Product[]
    setCurrentProduct: (product?: Product) => void
    setSelectedFields: (fields?: GraphQLField<never, never>[]) => void
    setSelectedRelationships: (relationships?: Product[]) => void
    setProductRequestQuery: (query?: DocumentNode) => void
    setModifiedProductRequestQuery: (query?: DocumentNode) => void
};

const CurrentProductContext = createContext<CurrentProductContextType | undefined>(undefined);

export const useCurrentProductContext = () => {
    const context = useContext(CurrentProductContext);
    if (!context) {
        throw new Error('useCurrentProductContext must be used within a GraphQLProvider');
    }
    return context;
};
export const CurrentProductContextProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [currentProduct, setCurrentProduct] = useState<Product | undefined>();
    const [productRequestQuery, setProductRequestQuery] = useState<DocumentNode | undefined>();
    const [modifiedProductRequestQuery, setModifiedProductRequestQuery] = useState<DocumentNode | undefined>();
    const [selectedFields, setSelectedFields] = useState<GraphQLField<never, never>[] | undefined>();
    const [selectedRelationships, setSelectedRelationships] = useState<Product[] | undefined>();

    useEffect(() => {
        if (productRequestQuery) {
            console.log(print(productRequestQuery))
        }
    }, [productRequestQuery])
    return (
        <CurrentProductContext.Provider
            value={{
                currentProduct,
                setCurrentProduct,
                selectedFields,
                setSelectedFields,
                selectedRelationships,
                setSelectedRelationships,
                productRequestQuery,
                setProductRequestQuery,
                modifiedProductRequestQuery,
                setModifiedProductRequestQuery
            }}>
            {children}
        </CurrentProductContext.Provider>
    );
};
