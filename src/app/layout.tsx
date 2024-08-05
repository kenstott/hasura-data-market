'use client'
import React, {ReactNode, useState} from 'react';
import {AppBar, Box, Button, CssBaseline, Toolbar, Tooltip, Typography} from '@mui/material';
import {GraphQLSchemaProvider} from "./context/graphql-schema-context/graphql-schema-context";
import {CurrentProductContextProvider} from "./context/current-product-context/current-product-context";
import {usePathname} from 'next/navigation';
import {LoginProvider} from "./context/login-context/login-context";
import LoginDialog from "./components/login-dialog/login-dialog";
import {SearchContextProvider} from "./context/search-context/search-context";
import {LicenseInfo} from '@mui/x-license';
import {ShoppingCartContextProvider} from "./context/shopping-cart-context/shopping-cart-context";
import {ShoppingCartDialog} from "./components/shopping-cart/shopping-cart";
import {PoliciesContextProvider} from "./context/policies-context/policies-context";
import {ShoppingCartButton} from "./shopping-cart-button";
import {ShoppingCartChanged} from "./shopping-cart-changed";
import {Search} from "./search";
import {DataContextProvider} from "./context/data-context/data-context";

LicenseInfo.setLicenseKey('79d1cb460e9bc5cd7369165827a395a9Tz05NDQ0OSxFPTE3NTI4NDQ2ODIwMDAsUz1wcm8sTE09cGVycGV0dWFsLEtWPTI=');

interface LayoutProps {
    children: ReactNode;
}


const Layout: React.FC<LayoutProps> = ({children}) => {

    const pathname = usePathname()
    const [loginOpen, setLoginOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)

    return (
        <html>
        <body>
        <GraphQLSchemaProvider>
            <ShoppingCartContextProvider>
                <CurrentProductContextProvider>
                    <LoginProvider>
                        <DataContextProvider>
                            <PoliciesContextProvider>
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
                                                    Data Catalog
                                                </Typography>
                                                <Tooltip title={"View inventory statistics"}>
                                                    <Button href={'/pages/dashboard'} color="inherit">Dashboard</Button>
                                                </Tooltip>
                                                <Tooltip title={"Subscribe to data"}>
                                                    <Button href={'/pages/marketplace'}
                                                            color="inherit">Subscriptions</Button>
                                                </Tooltip>
                                                <Tooltip title={"Design a data composition\nto solve a problem"}>
                                                    <Button href={'/pages/request-query'}
                                                            color="inherit">Explore</Button>
                                                </Tooltip>
                                                <Button color="inherit"
                                                        onClick={() => setLoginOpen(true)}>Login</Button>
                                                {(pathname === '/pages/marketplace' || pathname === '/') && (<Search/>)}
                                                <ShoppingCartButton onClick={() => setCartOpen(true)}/>
                                            </Toolbar>
                                        </AppBar>
                                        <Box
                                            className={'portal'}
                                            sx={{
                                                flexGrow: 1,
                                                overflowY: 'auto',
                                            }}>
                                            {children}
                                        </Box>
                                    </Box>
                                    <LoginDialog open={loginOpen} onClose={() => setLoginOpen(false)}/>
                                    {cartOpen && <ShoppingCartDialog
                                        open={cartOpen}
                                        onSubmittedRequest={() => {/* ignore */
                                        }}
                                        onClose={() => setCartOpen(false)}/>}
                                    <ShoppingCartChanged/>
                                </SearchContextProvider>
                            </PoliciesContextProvider>
                        </DataContextProvider>
                    </LoginProvider>
                </CurrentProductContextProvider>
            </ShoppingCartContextProvider>
        </GraphQLSchemaProvider>
        </body>
        </html>
    );
};

export default Layout;
