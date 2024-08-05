import React, {useCallback, useEffect, useState} from 'react';
import styles from './tags.module.scss';
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField
} from '@mui/material';
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import {Product} from "../../context/current-product-context/current-product-context";
import {Tag} from "./show-tags";
import {useLoginContext} from "../../context/login-context/login-context";
import {MongoDbFind} from "../../api/mongodb/find/route";
import DialogTitle from "@mui/material/DialogTitle";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import {addTag} from "./add-tag";
import {getTags} from "./get-tags";
import {removeTag} from "./remove-tag";
import {useDataContext} from "../../context/data-context/data-context";

interface TagEditorDialogProps {
    open: boolean
    onClose: () => void
    product: Product
}

const TagEditorDialog: React.FC<TagEditorDialogProps> = ({open, product, onClose}) => {
    const {id, role, headers} = useLoginContext()
    const {deleteMany, upsertMany, loading} = useDataContext()
    const [chipInput, setChipInput] = useState('');
    const [tagData, setTagData] = useState<Tag[]>([])
    const [scope, setScope] = useState<string>('global')
    const [options, setOptions] = useState<string[]>([])

    const handleDelete = useCallback((chipToDelete: string) => {
        removeTag(product, scope, chipToDelete, deleteMany).then(_x => {
            getTags(product, id, role, headers).then(setTagData)
        })
    }, [deleteMany, headers, id, product, role, scope]);

    useEffect(() => {
        const resource = product?.name.replace('_', '/') || ''
        const body: MongoDbFind = {
            collection: 'tag',
            filter: {resource, scope: {$in: ['global', id, role]}}
        }
        fetch('/api/mongodb/find', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        }).then(response => response.json().then((json: Tag[]) => {
            setTagData(json)
        })).catch()
    }, [id, role, product, headers]);

    useEffect(() => {
        const body: MongoDbFind = {
            collection: 'tag',
            filter: {}
        }
        fetch('/api/mongodb/find', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        }).then(response => response.json().then((json: Tag[]) => {
            setOptions([...new Set(json.map(i => i.tag))])
        })).catch()
    }, [headers]);

    const handleAddChip = useCallback((event: Partial<React.KeyboardEvent<HTMLDivElement>>) => {
        if (event.key === 'Enter' && chipInput) {
            addTag(product, scope, chipInput, upsertMany).then(() => {
                getTags(product, id, role, headers).then(setTagData)
                setChipInput('');
            })
        }
    }, [chipInput, headers, id, product, role, scope, upsertMany]);

    return (
        <Dialog fullWidth={true} onClose={onClose} open={open} title={"Update Tags"}>
            <DialogTitle>Update Tags</DialogTitle>
            <DialogCloseButton onClose={onClose}/>
            <DialogContent>
                <Box>
                    <b>Resource:</b>&nbsp;{product.name.replace('_', ' / ')}
                </Box>
                <hr/>
                <Box>
                    {!loading && tagData.filter((data) => data.scope === scope)
                        .map((data, index) =>
                            <Chip
                                key={index}
                                label={data.tag}
                                onDelete={() => {
                                    handleDelete(data.tag)
                                }}
                            />
                        )}
                    {loading && <CircularProgress/>}
                    {tagData.filter((data) => data.scope === scope).length > 0 && <hr/>}
                    <FormControl component="fieldset">
                        <FormLabel component="legend">Scope</FormLabel>
                        <RadioGroup row value={scope} onChange={(event) => setScope(event.target.value)}>
                            <FormControlLabel value="global" control={<Radio/>} label="Global"/>
                            <FormControlLabel value={id} control={<Radio/>} label={id}/>
                            <FormControlLabel value={role} control={<Radio/>} label={role}/>
                        </RadioGroup>
                    </FormControl>
                    <Autocomplete
                        options={options}
                        value={chipInput}
                        onChange={(event, newValue) => {
                            console.log('Event:', event, 'New Value:', newValue);
                            setChipInput(newValue || '')
                        }}
                        onKeyDown={(event) => handleAddChip(event)}
                        freeSolo
                        renderInput={(params) => (
                            <Box className={styles.tagInputBox}><TextField {...params} label="New Tag"
                                                                           variant="outlined" style={{marginTop: 15}}/>
                                <Button disabled={!chipInput} onClick={() => handleAddChip({key: 'Enter'})}>Add
                                    Tag</Button></Box>
                        )}
                    />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default TagEditorDialog;