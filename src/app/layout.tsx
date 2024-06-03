'use client'
import styles from './components/market-place-grid/market-place-grid.module.scss'
import React, {ReactNode, useEffect, useState} from 'react';
import {AppBar, Badge, Box, Button, CssBaseline, IconButton, InputBase, Toolbar, Typography} from '@mui/material';
import {GraphQLSchemaProvider} from "./components/graphql-schema-context/graphql-schema-context";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import {CurrentProductContextProvider} from "./components/current-product-context/current-product-context";
import {usePathname} from 'next/navigation';
import {LoginProvider} from "./components/login-context/login-context";
import LoginDialog from "./components/login-dialog/login-dialog";
import {SearchContextProvider, useSearchContext} from "./components/search-context/search-context";


interface LayoutProps {
    children: ReactNode;
}


const Search: React.FC = () => {
    const {setSearch} = useSearchContext()
    const [displayedSearch, setDisplayedSearch] = useState("")
    const [isInputVisible, setInputVisible] = useState(false);
    useEffect(() => {
        setSearch(new RegExp(`^.*${displayedSearch}.*$`, 'i'))
    }, [displayedSearch, setSearch]);
    return <>
        {isInputVisible && (<InputBase
            value={displayedSearch}
            onChange={(event) => {
                setDisplayedSearch(event.target.value)
            }}
            placeholder="Search..."
            className={styles.search}
        />)}
        <IconButton className={styles.search} onClick={() => {
            setInputVisible(!isInputVisible)
        }}>
            <SearchIcon/>
        </IconButton>
    </>
}
const Layout: React.FC<LayoutProps> = ({children}) => {

    const pathname = usePathname()
    const [loginOpen, setLoginOpen] = useState(false)

    return (
        <html>
        <body>
        <GraphQLSchemaProvider>
            <CurrentProductContextProvider>
                <LoginProvider>
                    <SearchContextProvider>
                        <Box className="app" maxWidth={"100%"} sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginX: '0vh',
                            height: '100vh', // Set the height to 100% of the viewport height
                        }}>
                            <CssBaseline/>
                            <AppBar position="static">
                                <Toolbar>
                                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                                        Data Marketplace
                                    </Typography>
                                    <Button href={'/'} color="inherit">Explore</Button>
                                    <Button href={'/pages/marketplace'} color="inherit">Marketplace</Button>
                                    <Button color="inherit" onClick={() => setLoginOpen(true)}>Login</Button>
                                    {pathname === '/pages/marketplace' && (<Search/>)}
                                    <IconButton edge="end" color="inherit">
                                        <Badge badgeContent={undefined} color="secondary">
                                            <ShoppingCartIcon/>
                                        </Badge>
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                }}>
                                {children}
                            </Box>
                        </Box>
                        <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)}/>
                    </SearchContextProvider>
                </LoginProvider>
            </CurrentProductContextProvider>
        </GraphQLSchemaProvider>
        </body>
        </html>
    );
};

export default Layout;
