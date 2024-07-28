import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {DocumentNode, GraphQLField, print} from "graphql";
import * as _ from 'lodash';
import gql from "graphql-tag";
import {getBaseType} from "../helpers/get-base-type";

export type Product = GraphQLField<never, never>
export type FieldSelectionStateMap = Record<string, [boolean, GraphQLField<never, never>]>
export type CurrentProductContextType = {
    currentProduct?: Product
    setCurrentProduct: (product?: Product) => void
    modifiedProductRequestQuery?: DocumentNode
    setModifiedProductRequestQuery: (query?: DocumentNode) => void
    productRequestQuery?: DocumentNode
    setProductRequestQuery: (query?: DocumentNode) => void
    updateSelectedFields: (path: string, scalarState: FieldSelectionStateMap, relationshipStateMap: FieldSelectionStateMap) => void
    selectedFields: Record<string, [boolean, GraphQLField<never, never>]>
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
    const [selectedFields, setSelectedFields] = useState<Record<string, [boolean, GraphQLField<never, never>]>>({})

    useEffect(() => {
        if (productRequestQuery) {
            console.log(print(productRequestQuery))
        }
    }, [productRequestQuery])

    useEffect(() => {
        setSelectedFields({})
    }, [currentProduct, setSelectedFields])

    useEffect(() => {
        const selectedItems = Object.entries(selectedFields).reduce((acc, [path, [selected,]]) => {
            if (selected) {
                _.set(acc, path, selected)
            }
            return acc;
        }, {})
        if (Object.keys(selectedItems).length) {
            const selectionSetString = JSON.stringify(selectedItems).replace(/(:|true|"|,)/g, ' ')
            const queryString = `query find__${getBaseType(currentProduct?.type)?.toString()} @sample(count: 100, random: true) { ${currentProduct?.name}(limit: 10000) ${selectionSetString} }`
            const parsedQuery = gql(queryString)
            console.log(print(parsedQuery))
            setProductRequestQuery(parsedQuery)
        } else {
            setProductRequestQuery(undefined)
        }
    }, [selectedFields, currentProduct?.name, currentProduct?.type]);

    const updateSelectedFields = useCallback((path: string, scalarState: FieldSelectionStateMap, relationshipState: FieldSelectionStateMap) => {
        setSelectedFields((prev) => {
            const firstPass = {
                ...prev, ...Object.entries(scalarState).reduce((acc, [name, [selected, field]]) => {
                    return {...acc, [(path ? path + '.' : '') + name]: [selected, field]}
                }, {})
            }
            const pattern = new RegExp('^(' + Object.entries(relationshipState)
                .filter(([, [flag]]) => flag)
                .map(([name]) => (path ? path + '.' : '') + name)
                .join('|') + ')\\..*$')
            return _.omitBy(firstPass, (_value, key) => pattern.test(key))
        })
    }, []);

    return (
        <CurrentProductContext.Provider
            value={{
                currentProduct,
                setCurrentProduct,
                productRequestQuery,
                setProductRequestQuery,
                modifiedProductRequestQuery,
                setModifiedProductRequestQuery,
                updateSelectedFields,
                selectedFields
            }}>
            {children}
        </CurrentProductContext.Provider>
    );
};
