import styles from './market-place-card.module.scss';
import {Card, CardContent, CardHeader, IconButton, Menu, MenuItem, TableCell, TableRow} from "@mui/material";
import GearIcon from '@mui/icons-material/Settings';
import DatasetIcon from '@mui/icons-material/Dataset';
import InsightsIcon from '@mui/icons-material/Insights';
import BugReportIcon from '@mui/icons-material/BugReport';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import StyleIcon from '@mui/icons-material/Style';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import FollowTheSignsIcon from '@mui/icons-material/FollowTheSigns';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuIcon from '@mui/icons-material/Menu';
import React, {useCallback, useState} from "react";
import {Product, useCurrentProductContext} from "../current-product-context/current-product-context";
import SamplerDialog from "../sampler-dialog/sampler-dialog";
import ProfilerDialog from "../profiler-dialog/profiler-dialog";
import AnomaliesDialog from "../anomalies-dialog/anomalies-dialog";
import {usePoliciesContext} from "../policies-context/policies-context";
import PoliciesDialog from "../policies-dialog/policies-dialog";
import {ShowFields} from "./show-fields";
import {ShowRelationships} from "./show-relationships";
import AskMeDialog from "../ask-me-dialog/ask-me-dialog";
import {getBaseType} from "../helpers/get-base-type";
import {isListType, isNonNullType} from "graphql";

/* eslint-disable-next-line */
export interface MarketPlaceCardProps {
    product: Product,
    asTableRow?: boolean
}

interface HamburgerMenuProps {
    setOpenSampler: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    setOpenProfiler: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    setOpenAnomalies: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    setOpenAskMe: (value: (((prevState: boolean) => boolean) | boolean)) => void,
    selectDataSets: string[],
    product: Product,
    setCurrentProduct: (product?: Product) => void,
    setOpenPolicies: (value: (((prevState: boolean) => boolean) | boolean)) => void,
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> =
    ({
         setOpenPolicies,
         setOpenAnomalies,
         setOpenAskMe,
         setOpenSampler,
         setOpenProfiler,
         setCurrentProduct,
         selectDataSets,
         product
     }) => {
        const [anchorEl, setAnchorEl] = useState<HTMLAnchorElement | null>(null);
        const handleMenuClick = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
            setAnchorEl(event.currentTarget);
        }, []);


        const handleMenuClose = useCallback(() => {
            setAnchorEl(null);
        }, []);

        const isList = isListType(product?.type) || isNonNullType(product?.type) && isListType(product?.type.ofType)

        if (product) {
            return (<>
                <IconButton href={''} onClick={handleMenuClick}>
                    <MenuIcon/>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    sx={{width: 320, maxWidth: '100%'}}
                >
                    {isList && <MenuItem onClick={(_event) => {
                        handleMenuClose()
                        setOpenSampler(true)
                    }}><ListItemIcon>
                        <DatasetIcon fontSize="small"/>
                    </ListItemIcon>
                        <ListItemText>Sample Data</ListItemText>
                    </MenuItem>}

                    {isList && <MenuItem onClick={(_event) => {
                        handleMenuClose()
                        setOpenProfiler(true)
                    }}><ListItemIcon>
                        <InsightsIcon fontSize="small"/>
                    </ListItemIcon>
                        <ListItemText>Profile Data</ListItemText>
                    </MenuItem>}

                    {isList && <MenuItem onClick={(_event) => {
                        handleMenuClose()
                        setOpenAnomalies(true)
                    }}><ListItemIcon>
                        <BugReportIcon fontSize="small"/>
                    </ListItemIcon>
                        <ListItemText>Find Data Anomalies</ListItemText>
                    </MenuItem>}

                    {isList && <MenuItem onClick={(_event) => {
                        handleMenuClose()
                        setOpenAskMe(true)
                    }}><ListItemIcon>
                        <SupportAgentIcon fontSize="small"/>
                    </ListItemIcon>
                        <ListItemText>Ask Data Scientist</ListItemText>
                    </MenuItem>}

                    {selectDataSets.indexOf(getBaseType(product.type)?.toString() || '') === -1 &&
                        <MenuItem onClick={(_event) => {
                            handleMenuClose()
                            setCurrentProduct(product)
                        }}><ListItemIcon>
                            <GearIcon fontSize="small"/>
                        </ListItemIcon>
                            <ListItemText>Request Access</ListItemText>
                        </MenuItem>}
                    {selectDataSets.indexOf(getBaseType(product.type)?.toString() || '') !== -1 &&
                        <MenuItem onClick={(_event) => {
                            handleMenuClose()
                            setOpenPolicies(true)
                        }}><ListItemIcon>
                            <SecurityIcon fontSize="small"/>
                        </ListItemIcon>
                            <ListItemText>View/Modify Access Policies</ListItemText>
                        </MenuItem>}
                    <MenuItem onClick={(_event) => {
                        handleMenuClose()
                        // setCurrentProduct(product)
                    }}><ListItemIcon>
                        <StyleIcon fontSize="small"/>
                    </ListItemIcon>
                        <ListItemText>Tags</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={(_event) => {
                        handleMenuClose()
                        // setCurrentProduct(product)
                    }}><ListItemIcon>
                        <ReportProblemIcon fontSize="small"/>
                    </ListItemIcon>
                        <ListItemText>Data Quality Incidents</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={(_event) => {
                        handleMenuClose()
                        // setCurrentProduct(product)
                    }}><ListItemIcon>
                        <QuestionAnswerIcon fontSize="small"/>
                    </ListItemIcon>
                        <ListItemText>Q & A</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={(_event) => {
                        handleMenuClose()
                        // setCurrentProduct(product)
                    }}><ListItemIcon>
                        <FollowTheSignsIcon fontSize="small"/>
                    </ListItemIcon>
                        <ListItemText>Lineage</ListItemText>
                    </MenuItem>
                </Menu></>)
        }
    }

export function MarketPlaceCard({product, asTableRow}: MarketPlaceCardProps) {
    const [openAskMe, setOpenAskMe] = useState(false)
    const [openSampler, setOpenSampler] = useState(false)
    const [openProfiler, setOpenProfiler] = useState(false)
    const [openAnomalies, setOpenAnomalies] = useState(false)
    const [openPolicies, setOpenPolicies] = useState(false)
    const {selectDataSets} = usePoliciesContext()
    const {setCurrentProduct} = useCurrentProductContext();

    const baseParts = getBaseType(product?.type)?.toString().split('_')
    const queryParts = product?.name.split('_')
    const domain = baseParts && baseParts.length && baseParts[0] || undefined
    const name = queryParts.length > 1 ? queryParts.slice(1).join('_') : product?.name
    const title = domain ? domain + ' / ' + name : name

    if (!asTableRow) {
        return (
            <React.Fragment>
                <Card>
                    <CardHeader action={<HamburgerMenu
                        selectDataSets={selectDataSets}
                        setCurrentProduct={setCurrentProduct}
                        setOpenPolicies={setOpenPolicies}
                        setOpenAnomalies={setOpenAnomalies}
                        setOpenSampler={setOpenSampler}
                        setOpenProfiler={setOpenProfiler}
                        product={product}
                        setOpenAskMe={setOpenAskMe}/>
                    } className={styles['data-card-header']}
                                title={title}>{title}</CardHeader>
                    <CardContent>
                        <ShowFields product={product} read={true}/>
                        <ShowRelationships product={product}/>
                    </CardContent>
                </Card>
                {openSampler &&
                    <SamplerDialog product={product} open={openSampler} onClose={() => setOpenSampler(false)}/>}
                {openProfiler &&
                    <ProfilerDialog product={product} open={openProfiler} onClose={() => setOpenProfiler(false)}/>}
                {openAnomalies &&
                    <AnomaliesDialog product={product} open={openAnomalies} onClose={() => setOpenAnomalies(false)}/>}
                {openPolicies &&
                    <PoliciesDialog product={product} open={openPolicies} onClose={() => setOpenPolicies(false)}/>}
                {openAskMe && <AskMeDialog product={product} open={openAskMe} onClose={() => setOpenAskMe(false)}/>}
            </React.Fragment>
        );
    }

    return (
        <TableRow hover={true}>
            <TableCell><HamburgerMenu
                selectDataSets={selectDataSets}
                setCurrentProduct={setCurrentProduct}
                setOpenPolicies={setOpenPolicies}
                setOpenAnomalies={setOpenAnomalies}
                setOpenSampler={setOpenSampler}
                setOpenProfiler={setOpenProfiler}
                product={product}
                setOpenAskMe={setOpenAskMe}/></TableCell>
            <TableCell>{domain}</TableCell>
            <TableCell>{name}</TableCell>
            <TableCell></TableCell>
            <TableCell><ShowFields product={product} read={true} noLabel={true}/></TableCell>
            <TableCell><ShowRelationships product={product} readOrSelect={'read'} noLabel={true}/></TableCell>
            {openSampler &&
                <SamplerDialog product={product} open={openSampler} onClose={() => setOpenSampler(false)}/>}
            {openProfiler &&
                <ProfilerDialog product={product} open={openProfiler} onClose={() => setOpenProfiler(false)}/>}
            {openAnomalies &&
                <AnomaliesDialog product={product} open={openAnomalies} onClose={() => setOpenAnomalies(false)}/>}
            {openPolicies &&
                <PoliciesDialog product={product} open={openPolicies} onClose={() => setOpenPolicies(false)}/>}
            {openAskMe && <AskMeDialog product={product} open={openAskMe} onClose={() => setOpenAskMe(false)}/>}
        </TableRow>)
}

export default MarketPlaceCard;
