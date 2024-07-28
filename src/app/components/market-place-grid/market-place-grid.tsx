import styles from './market-place-grid.module.scss';
import {
    Box, Button,
    ButtonProps,
    CircularProgress,
    FormControlLabel,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2'
import React, {useCallback, useEffect, useState} from "react";
import {useGraphQLSchemaContext} from "../graphql-schema-context/graphql-schema-context";
import MarketPlaceCard, {HamburgerMenu} from "../market-place-card/market-place-card";
import MarketPlaceCardDetails from "../market-place-card-details/market-place-card-details";
import {Product, useCurrentProductContext} from "../current-product-context/current-product-context";
import {GraphQLField, isEnumType, isLeafType, isObjectType} from "graphql";
import {useSearchContext} from "../search-context/search-context";
import {usePoliciesContext} from "../policies-context/policies-context";
import {getBaseType} from "../helpers/get-base-type";
import {
    DataGridPro,
    DataGridProProps,
    GRID_TREE_DATA_GROUPING_FIELD,
    GridColDef, GridColumnVisibilityModel, gridFilteredDescendantCountLookupSelector,
    GridRenderCellParams, GridToolbar, GridTreeNodeWithRender, useGridApiContext, useGridSelector
} from "@mui/x-data-grid-pro";
import {ShowFields} from "../market-place-card/show-fields";
import {ShowRelationships} from "../market-place-card/show-relationships";
import SamplerDialog from "../sampler-dialog/sampler-dialog";
import ProfilerDialog from "../profiler-dialog/profiler-dialog";
import AnomaliesDialog from "../anomalies-dialog/anomalies-dialog";
import PoliciesDialog from "../policies-dialog/policies-dialog";
import AskMeDialog from "../ask-me-dialog/ask-me-dialog";

/* eslint-disable-next-line */
export interface MarketPlaceGridProps {
}

const RowHamburgerMenu: React.FC<{ row: { item: GraphQLField<never, never> } }> = ({row}) => {
    const [openAskMe, setOpenAskMe] = useState(false)
    const [openSampler, setOpenSampler] = useState(false)
    const [openProfiler, setOpenProfiler] = useState(false)
    const [openAnomalies, setOpenAnomalies] = useState(false)
    const [openPolicies, setOpenPolicies] = useState(false)
    const {setCurrentProduct} = useCurrentProductContext();
    const {selectDataSets} = usePoliciesContext()
    return <><HamburgerMenu
        selectDataSets={selectDataSets}
        setCurrentProduct={setCurrentProduct}
        setOpenPolicies={setOpenPolicies}
        setOpenAnomalies={setOpenAnomalies}
        setOpenSampler={setOpenSampler}
        setOpenProfiler={setOpenProfiler}
        product={row.item}
        setOpenAskMe={setOpenAskMe}/>
        {openSampler &&
            <SamplerDialog product={row.item} open={openSampler} onClose={() => setOpenSampler(false)}/>}
        {openProfiler &&
            <ProfilerDialog product={row.item} open={openProfiler} onClose={() => setOpenProfiler(false)}/>}
        {openAnomalies &&
            <AnomaliesDialog product={row.item} open={openAnomalies} onClose={() => setOpenAnomalies(false)}/>}
        {openPolicies &&
            <PoliciesDialog product={row.item} open={openPolicies} onClose={() => setOpenPolicies(false)}/>}
        {openAskMe && <AskMeDialog product={row.item} open={openAskMe} onClose={() => setOpenAskMe(false)}/>}
    </>
}

function CustomGridTreeDataGroupingCell(props: GridRenderCellParams) {
    const {id, field, rowNode} = props;
    const apiRef = useGridApiContext();
    const filteredDescendantCountLookup = useGridSelector(
        apiRef,
        gridFilteredDescendantCountLookupSelector,
    );
    const filteredDescendantCount = filteredDescendantCountLookup[rowNode.id] ?? 0;

    const handleClick: ButtonProps['onClick'] = (event) => {
        if (rowNode.type !== 'group') {
            return;
        }

        apiRef.current.setRowChildrenExpansion(id, !rowNode.childrenExpanded);
        apiRef.current.setCellFocus(id, field);
        event.stopPropagation();
    };

    if (rowNode.depth === 0) {
        return (
            <Box sx={{ml: rowNode.depth * 4}}>
                <div>
                    {filteredDescendantCount > 0 ? (
                        <Button onClick={handleClick} tabIndex={-1} size="small">
                            Data Domain: {(rowNode as (GridTreeNodeWithRender & { groupingKey: string })).groupingKey}
                        </Button>
                    ) : (
                        <span/>
                    )}
                </div>
            </Box>
        );
    }
    if (rowNode.depth === 1) {
        return (
            <Box sx={{ml: rowNode.depth * 4}}>
                <div>
                    {filteredDescendantCount > 0 ? (
                        <Button onClick={handleClick} tabIndex={-1} size="small">
                            Product Owner: {(rowNode as (GridTreeNodeWithRender & { groupingKey: string })).groupingKey}
                        </Button>
                    ) : (
                        <span/>
                    )}
                </div>
            </Box>
        );
    }
    if (rowNode.depth === 2) {
        return (
            <Box sx={{mt: '7px', ml: rowNode.depth * 4}}>
                {(rowNode as (GridTreeNodeWithRender & { groupingKey: string })).groupingKey}
            </Box>
        );
    }
}

interface DatasourceRow {
    hierarchy: string[]
    id: number,
    'Product Owner': string,
    Type?: string,
    Domain?: string,
    item: GraphQLField<never, never>
}

export const MarketPlaceGrid: React.FC<MarketPlaceGridProps> = () => {
    const [products, setProducts] = useState<Product[]>()
    const [searchable, setSearchable] = useState<string[]>([])
    const {hasuraSchema} = useGraphQLSchemaContext()
    const {search} = useSearchContext()
    const [showInventory, setShowInventory] = useState(false);
    const [showAsGrid, setShowAsGrid] = useState(true)
    const [rows, setRows] = useState<DatasourceRow[]>([])
    const [columns, setColumns] = useState<GridColDef[]>([])
    const [filterModel, setFilterModel] = useState<GridColumnVisibilityModel>({
        'Product': false,
        'Domain': false,
        'Product Owner': false,
        'Type': false
    })
    const {selectDataSets} = usePoliciesContext()
    const {currentProduct} = useCurrentProductContext()

    useEffect(() => {
        if (hasuraSchema) {
            const products =
                Object.values(hasuraSchema?.getQueryType()?.getFields() || {})
                    .filter((i) => !i.name.endsWith('_aggregate') && !i.name.endsWith('_pk') && i.name !== '_service')
            setProducts(products)
        }
    }, [hasuraSchema])

    useEffect(() => {
        if (products) {
            const newSearchable = []
            for (const product of products) {
                const baseType = getBaseType(product.type)
                if (isObjectType(baseType)) {
                    const fields = Object.entries(baseType.getFields()).filter(([_, field]) => isLeafType(getBaseType(field.type)))
                    const relationships = Object.entries(baseType.getFields()).filter(([_, field]) => isObjectType(getBaseType(field.type)))
                    const track = [] as string[]
                    track.push(product.name)
                    track.push(product.description || '')
                    if (fields) {
                        for (const [fieldName, fieldType] of fields) {
                            track.push(fieldName)
                            track.push(fieldType.description ?? '')
                        }
                    }
                    if (relationships) {
                        for (const [fieldName, fieldType] of relationships) {
                            track.push(fieldName)
                            track.push(fieldType.description ?? '')
                            const baseType = getBaseType(fieldType.type)
                            if (baseType && (isEnumType(baseType) || isObjectType(baseType))) {
                                track.push(baseType.description ?? '')
                            }
                        }
                    }
                    newSearchable.push(track.join(' '))
                }
            }
            setSearchable(newSearchable)
            return
        }
        setSearchable([])
    }, [products]);

    const handleSwitchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setShowInventory(event.target.checked);
    }, []);

    useEffect(() => {
        setColumns([
            {
                field: GRID_TREE_DATA_GROUPING_FIELD,
                width: 250
            },
            {
                type: 'actions',
                width: 50,
                field: '',
                renderCell: ({row}) => <RowHamburgerMenu row={row}/>
            },
            {field: 'Domain', width: 150},
            {field: 'Product', width: 300,},
            {field: 'Type', width: 250},
            {field: 'Product Owner', width: 200},
            {
                field: 'Fields',
                flex: .5,
                renderCell: ({row}) => {
                    return <ShowFields product={row.item} read={true} noLabel={true}/>
                }
            },
            {
                field: 'Relationships',
                flex: .5,
                renderCell: ({row}) => {
                    return <ShowRelationships product={row.item} noLabel={true}/>
                }
            }
        ])
    }, [])

    useEffect(() => {
            setRows(products?.filter((product, index) =>
                (!showInventory || showInventory && selectDataSets.findIndex((i) => getBaseType(product.type)?.toString() === i) !== -1) &&
                (!search || search?.test(searchable[index]))
            )
                .map((item, id) => {
                        const baseParts = getBaseType(item.type)?.toString().split('_')
                        const queryParts = item.name.split('_')
                        const domain = baseParts && baseParts.length && baseParts[0] || undefined
                        const name = queryParts.length > 1 ? queryParts.slice(1).join('_') : item.name
                        return {
                            hierarchy: [domain || '', 'Unknown', name || ''],
                            id,
                            Domain: domain,
                            Product: name,
                            Type: getBaseType(item.type)?.toString(),
                            'Product Owner': 'Unknown',
                            item
                        }
                    }
                ) || [])
        },
        [products, search, searchable, selectDataSets, showInventory])

    const getTreeDataPath: DataGridProProps['getTreeDataPath'] = useCallback((row: DatasourceRow) => {
        return row.hierarchy
    }, [])

    const groupingColDef: DataGridProProps['groupingColDef'] = {
        headerName: 'Hierarchy',
        renderCell: (params) => <CustomGridTreeDataGroupingCell {...params} />,
    };

    if (hasuraSchema && products) {
        return (
            <Box className={"marketplace-grid"} sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}>
                <Box>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showInventory}
                                onChange={handleSwitchChange}
                                name="inventorySwitch"
                                color="primary"
                            />
                        }
                        label={showInventory ? "Inventory" : "All"}
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={showAsGrid}
                                onChange={(event) => setShowAsGrid(event.target.checked)}
                                name="gridSwitch"
                                color="primary"
                            />
                        }
                        label={showAsGrid ? "Cards" : "Table"}
                    />
                </Box>
                {showAsGrid && <Box sx={{flexGrow: 1, overflowY: 'scroll'}}>
                    <Grid className={styles['grid-container']} container spacing={2}>
                        {products?.filter((product, index) =>
                            (!showInventory || showInventory && selectDataSets.findIndex((i) => getBaseType(product.type)?.toString() === i) !== -1) &&
                            (!search || search?.test(searchable[index]))
                        )
                            .map((item,) => (
                                <Grid xs={12} sm={6} md={4} lg={3} key={item.name}>
                                    <MarketPlaceCard product={item}/>
                                </Grid>
                            ))}
                    </Grid>
                    {currentProduct !== undefined && <MarketPlaceCardDetails anchor={'right'}/>}
                </Box>}
                {!showAsGrid && <Box sx={{flexGrow: 1, overflowY: 'scroll'}}>
                    <DataGridPro
                        treeData
                        getTreeDataPath={getTreeDataPath}
                        slots={{toolbar: GridToolbar}}
                        hideFooter={true}
                        getRowHeight={() => 'auto'}
                        columns={columns}
                        rows={rows}
                        onColumnVisibilityModelChange={setFilterModel}
                        columnVisibilityModel={filterModel}
                        groupingColDef={groupingColDef}
                    />
                    {currentProduct !== undefined && <MarketPlaceCardDetails anchor={'right'}/>}
                </Box>}

            </Box>
        );
    } else {
        return (
            <Box sx={{display: 'flex', height: '100vh', justifyContent: "center", alignItems: "center"}}>
                <CircularProgress sx={{alignSelf: 'center'}} size={150}/>
            </Box>
        )
    }
};

export default MarketPlaceGrid;
