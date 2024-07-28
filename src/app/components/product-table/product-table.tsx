import {useCurrentProductContext} from "../current-product-context/current-product-context";
import React, {ReactNode, useCallback, useEffect, useRef} from "react";
import {GraphQLField, GraphQLObjectType, isLeafType, isObjectType} from "graphql";
import {
    DataGridPro,
    GRID_CHECKBOX_SELECTION_COL_DEF,
    GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
    GRID_DETAIL_PANEL_TOGGLE_FIELD,
    GridColDef,
    GridRowId,
    GridRowSelectionModel,
    useGridApiRef
} from "@mui/x-data-grid-pro";
import {Maybe} from "graphql/jsutils/Maybe";
import {getBaseType} from "../helpers/get-base-type";
import {DetailPanelContent} from "./detail-panel-content";

interface ProductTableProps {
    product?: GraphQLField<never, never>,
    title?: ReactNode,
    path: string
}

export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

interface DatasourceRow {
    id: number
    name: string
    description: Maybe<string>
    type: string
}

const columns: GridColDef[] = [
    {...GRID_DETAIL_PANEL_TOGGLE_COL_DEF},
    {...GRID_CHECKBOX_SELECTION_COL_DEF},
    {field: 'name', headerName: 'Name', width: 175},
    {field: 'description', headerName: 'Description', width: 175},
    {field: 'type', headerName: 'Type', width: 175}
]

const ProductTable: React.FC<ProductTableProps> = ({product, path}) => {
    const apiRef = useGridApiRef();
    const fields = useRef<GraphQLField<never, never>[]>(Object.values((getBaseType(product?.type) as GraphQLObjectType)?.getFields?.() || {}))
    const {updateSelectedFields, setCurrentProduct, selectedFields} = useCurrentProductContext()
    const rows = useRef<DatasourceRow[]>(fields.current.map((field, id): DatasourceRow => ({
        id,
        name: field.name,
        description: field.description,
        type: field.type.toString()
    })));

    const [expandedModel, setExpandedModel] = React.useState<GridRowId[]>([])

    const getDetailPanelContent = React.useCallback((row: DatasourceRow) => {
        if (isObjectType(getBaseType(fields.current[row.id].type))) {
            return <DetailPanelContent field={fields.current[row.id]} path={(path ? path + '.' : '') + product?.name}/>
        }
    }, [path, product]);

    const getSelectionModel = useCallback(() => {
        const pathMinus1 = path.split('.').filter(Boolean).concat(product?.name || '').slice(1)
        return Object.entries(selectedFields).reduce<GridRowId[]>((acc, [name, [selected, _field]]) => {
            if (selected) {
                const pathFields = fields.current.map((i) => {
                    return [...pathMinus1].concat(i.name).filter(Boolean).join('.')
                })
                const index = pathFields.indexOf(name)
                if (selected && index !== -1) {
                    acc = acc.concat([index])
                }
            }
            return acc
        }, expandedModel)
    }, [expandedModel, path, product?.name, selectedFields])

    const updateSelectionState = useCallback((selections: GridRowSelectionModel) => {
        if (selections) {
            const pathMinus1 = path.split('.').filter(Boolean).concat(product?.name || '').slice(1).join('.')
            const fieldMap = fields.current.reduce<Record<string, [boolean, GraphQLField<never, never>]>>((acc, field, id) => {
                const b = getBaseType(field.type)
                const c = isLeafType(b)
                return {
                    ...acc,
                    [field.name]: [c && selections.indexOf(id) !== -1, field]
                };
            }, {}) || {}
            const objectMap = fields.current.reduce<Record<string, [boolean, GraphQLField<never, never>]>>((acc, field, id) => {
                const b = getBaseType(field.type)
                const c = isLeafType(b)
                return {
                    ...acc,
                    [field.name]: [!c && selections.indexOf(id) === -1, field]
                };
            }, {}) || {}
            updateSelectedFields(pathMinus1, fieldMap, objectMap)
        }
    }, [path, product?.name, updateSelectedFields])

    useEffect(() => {
        if (product && !path.length) {
            setCurrentProduct(product)
        }
    }, [path.length, product, setCurrentProduct])

    return <DataGridPro
        apiRef={apiRef}
        keepNonExistentRowsSelected
        checkboxSelection
        columns={columns}
        rows={rows.current}
        rowSelectionModel={getSelectionModel()}
        detailPanelExpandedRowIds={expandedModel}
        onDetailPanelExpandedRowIdsChange={setExpandedModel}
        pinnedColumns={{left: [GRID_DETAIL_PANEL_TOGGLE_FIELD]}}
        onRowSelectionModelChange={(model, _details) => {
            setExpandedModel(model.filter((i) => isObjectType(getBaseType(fields.current[i as number].type))))
            updateSelectionState(model)
        }}
        getDetailPanelContent={({row}) => getDetailPanelContent(row)}
        getDetailPanelHeight={() => 'auto'}
        columnVisibilityModel={{
            name: true,
            description: true,
            type: true,
            __check__: true,
            __detail_panel_toggle__: false
        }}
    />
}

export default ProductTable;
