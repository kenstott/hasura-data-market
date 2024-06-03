import React, {createContext, ReactNode, useContext, useState} from 'react';


export type SearchContextType = {
    search?: RegExp
    setSearch: (search?: RegExp) => void
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearchContext = () => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error('useSearchContext must be used within a GraphQLProvider');
    }
    return context;
};
export const SearchContextProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [search, setSearch] = useState<RegExp | undefined>();
    return (
        <SearchContext.Provider
            value={{
                search,
                setSearch,
            }}>
            {children}
        </SearchContext.Provider>
    );
};
