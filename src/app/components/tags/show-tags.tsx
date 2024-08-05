import React, {useCallback, useEffect, useState} from "react";
import styles from './tags.module.scss'
import {Product} from "../../context/current-product-context/current-product-context";
import {Avatar, Box, Chip} from "@mui/material";
import {useLoginContext} from "../../context/login-context/login-context";
import {getTags} from "./get-tags";
import {removeTag} from "./remove-tag";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Clear";
import TagEditorDialog from "./tag-editor-dialog";
import {useDataContext} from "../../context/data-context/data-context";

export interface ShowTagsProps {
    product?: Product,
    refresh?: () => void
}

export interface Tag {
    resource: string
    scope: string
    tag: string
}

export const ShowTags: React.FC<ShowTagsProps> = ({product, refresh}) => {
    const {id, role, headers} = useLoginContext()
    const {deleteMany} = useDataContext()
    const [tagData, setTagData] = useState<Tag[]>([])
    const [canDelete, setCanDelete] = useState(false)
    const [openTags, setOpenTags] = useState(false)

    useEffect(() => {
        getTags(product, id, role, headers).then(setTagData)
    }, [id, role, product, headers]);

    const handleDelete = useCallback((chipToDelete: string, scope: string) => {
        removeTag(product, scope, chipToDelete, deleteMany).then(_ => {
            getTags(product, id, role, headers).then(setTagData)
        })
    }, [deleteMany, headers, id, product, role]);

    return <Box className={styles['tag-container']}>
        {tagData.map((data, index) => {
                if (data.scope === 'global') {
                    return <Chip
                        key={index}
                        label={data.tag}
                        color={'primary'}
                        onDelete={canDelete ? () => handleDelete(data.tag, data.scope) : undefined}
                    />
                }
                if (data.scope === role) {
                    return <Chip
                        key={index}
                        label={data.tag}
                        color={'secondary'}
                        onDelete={canDelete ? () => handleDelete(data.tag, data.scope) : undefined}
                    />
                }
                if (data.scope === id) {
                    return <Chip
                        key={index}
                        label={data.tag}
                        color={'default'}
                        onDelete={canDelete ? () => handleDelete(data.tag, data.scope) : undefined}
                    />
                }
            }
        )}
        {tagData.length > 0 &&
            <Avatar onClick={() => setCanDelete(!canDelete)} className={styles['tag-button']}>
                <DeleteIcon sx={{fontSize: '12px'}}/>
            </Avatar>}
        {tagData.length > 0 &&
            <Avatar onClick={() => setOpenTags(true)} className={styles['tag-button']}>
                <EditIcon sx={{fontSize: '12px'}}/>
            </Avatar>}
        {openTags && product && <TagEditorDialog product={product} open={openTags} onClose={() => {
            setOpenTags(false)
            refresh?.()
        }}/>}
    </Box>
}