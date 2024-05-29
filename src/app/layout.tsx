'use client'
import React, {ReactNode, useState} from 'react';
import {AppBar, Badge, Box, Button, CssBaseline, IconButton, Toolbar, Typography} from '@mui/material';
import {GraphQLSchemaProvider} from "./components/graphql-schema-context/graphql-schema-context";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from '@mui/icons-material/Search';
import AppleIcon from '@mui/icons-material/KeyboardCommandKey'
import {CurrentProductContextProvider} from "./components/current-product-context/current-product-context";
import {KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch} from "kbar";
import {usePathname} from 'next/navigation';
import {LoginProvider} from "./components/login-context/login-context";
import LoginDialog from "./components/login-dialog/login-dialog";


interface LayoutProps {
    children: ReactNode;
}

function RenderResults() {
}


const searchStyle = {
    padding: "12px 16px",
    fontSize: "16px",
    width: "300px",
    boxSizing: "border-box" as React.CSSProperties["boxSizing"],
    outline: "1px",
    borderRadius: "5px",
    border: "2px solid black",
    // background: "var(--background)",
    // color: "var(--foreground)",
};

const Layout: React.FC<LayoutProps> = ({children}) => {

    const pathname = usePathname()
    const [loginOpen, setLoginOpen] = useState(false)

    return (
        <html>
        <body>
        <GraphQLSchemaProvider>
            <CurrentProductContextProvider>
                <LoginProvider>
                    <Box className="app" maxWidth={"100%"} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginX: '0vh',
                        height: '100vh', // Set the height to 100% of the viewport height
                    }}>
                        <CssBaseline/>
                        <AppBar position="static">
                            {pathname === '/pages/marketplace' && (<KBarProvider>
                                <KBarPortal>
                                    <KBarPositioner>
                                        <KBarAnimator>
                                            <KBarSearch style={searchStyle}/>
                                            <RenderResults/>
                                        </KBarAnimator>
                                    </KBarPositioner>
                                </KBarPortal>
                            </KBarProvider>)}
                            <Toolbar>
                                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                                    Data Marketplace
                                </Typography>
                                {pathname === '/pages/marketplace' && (
                                    <div style={{alignItems: 'center', display: 'flex'}}>
                                        <SearchIcon/>
                                        <AppleIcon fontSize={'small'}/>
                                        +K |
                                    </div>)}
                                <Button href={'/'} color="inherit">Explore</Button>
                                <Button href={'/pages/marketplace'} color="inherit">Marketplace</Button>
                                <Button color="inherit" onClick={() => setLoginOpen(true)}>Login</Button>
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
                </LoginProvider>
            </CurrentProductContextProvider>
        </GraphQLSchemaProvider>
        </body>
        </html>
    );
};

export default Layout;
