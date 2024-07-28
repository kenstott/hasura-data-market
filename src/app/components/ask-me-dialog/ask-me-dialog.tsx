import styles from './ask-me-dialog.module.scss'
import React, {useCallback, useEffect, useRef, useState} from 'react';
import Button from '@mui/material/Button';
import {
    Box,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Paper,
    Snackbar,
    TextField,
    Typography
} from "@mui/material";
import {Product} from "../current-product-context/current-product-context";
import SendIcon from '@mui/icons-material/Send';
import {
    ArgumentNode,
    DocumentNode,
    FieldNode,
    GraphQLObjectType,
    isLeafType,
    OperationDefinitionNode,
    print
} from "graphql";
import gql from "graphql-tag";
import {getBaseType} from "../helpers/get-base-type";
import process from "process";
import {useLoginContext} from "../login-context/login-context";
import {GraphQLResponse} from "../helpers/graphql-response";
import DialogTitle from "@mui/material/DialogTitle";
import DialogCloseButton from "../dialog-close-button/dialog-close-button";
import DialogContent from "@mui/material/DialogContent";
import Dialog from "@mui/material/Dialog";
import _ from 'lodash'
import {askMe, Message} from "./ask-me";
import {useDebounce} from "../use-debounce";
import ReactMarkdown from 'react-markdown';
import remarkGfm from "remark-gfm";
import {Writeable} from "../product-table/product-table";

interface AskMeDialogProps {
    open: boolean
    product?: Product
    query?: DocumentNode
    onClose: () => void
}

export const AskMeDialog: React.FC<AskMeDialogProps> = ({onClose, open, query, product}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [sampleQuery, setSampleQuery] = useState<string>('')
    const [dataset, setDataset] = useState<GraphQLResponse>()
    const [title, setTitle] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [sampleSize, setSampleSize] = useState(parseInt(process.env.NEXT_PUBLIC_ANTHROPIC_INITIAL_SAMPLE_SIZE || '10'))
    const {adminSecret, role, id} = useLoginContext()
    const listEndRef = useRef<HTMLLIElement>(null);
    const sendButtonRef = useRef<HTMLButtonElement>(null)
    const debouncedSampleSize = useDebounce<number>(sampleSize, 1000)


    const scrollToBottom = useCallback(() => {
        listEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, []);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            sendButtonRef.current?.click();
        }
    }, []);

    useEffect(() => {
        if (open && dataset && messages.length > 1 && messages[messages.length - 1].role === 'assistant') {
            const template = _.template(process.env.NEXT_PUBLIC_ANTHROPIC_DATASET_PROMPT)
            const newContent = template({dataset: JSON.stringify(dataset)})
            if (messages[0].content !== newContent) {
                setMessages((prev) => {
                    const messages = [...prev].slice(0, -1)
                    messages[0].content = newContent
                    return messages
                })
            }
        }
    }, [dataset, messages, messages.length, open])

    useEffect(() => {
        if (open && sampleQuery && dataset && messages.length === 0) {
            const template = _.template(process.env.NEXT_PUBLIC_ANTHROPIC_DATASET_PROMPT)
            setMessages([{
                role: 'user',
                content: template({dataset: JSON.stringify(dataset)})
            }])
        }
    }, [dataset, messages.length, open, sampleQuery]);

    const handleSend = useCallback(() => {
        if (input.trim() === '') return;
        setMessages((prev) => {
            setInput('')
            return [...prev, {role: 'user', content: input}]
        })
        setTimeout(scrollToBottom, 0)
    }, [input, scrollToBottom]);


    useEffect(() => {
        if (open && sampleQuery && dataset && messages.length > 0 && messages[messages.length - 1].role === 'user') {
            setLoading(true)
            const prompt = messages[messages.length - 1].content
            askMe({prompt, messages: messages.slice(0, -1)}).then((response) => {
                setMessages((prev) => {
                    const content = (response?.content || []).map((i) => i.text).join('\n')
                    setLoading(false)
                    if (content?.length) {
                        return [...prev, {role: 'assistant', content}]
                    } else if (response?.error?.message) {
                        setError(response.error.message)
                    }
                    return prev
                })
            })
        }
    }, [dataset, messages, messages.length, open, query, sampleQuery]);

    useEffect(() => {
        if (open && sampleQuery) {
            setLoading(true)
            const headers = {
                'x-hasura-admin-secret': adminSecret,
                'hasura_cloud_pat': adminSecret,
                'x-hasura-role': process.env.NEXT_PUBLIC_EXPLORER_ROLE || '',
                'x-hasura-user': id,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            }
            const q = gql(sampleQuery)
            const operationName = (q.definitions[0] as OperationDefinitionNode).name?.value || ''
            const body = JSON.stringify({
                operationName,
                query: sampleQuery,
                variables: {}
            })
            fetch(process.env.NEXT_PUBLIC_URI || '', {
                method: 'POST',
                headers,
                body
            }).then((response) => {
                response.json().then((json) => {
                    setLoading(false)
                    setDataset(json)
                })
            }).catch((_error) => {
                setLoading(false)
            })
        }
    }, [adminSecret, id, open, role, sampleQuery]);


    useEffect(() => {
        if (open && query) {
            setSampleQuery(() => {
                const newQuery = query
                const operation = newQuery.definitions[0] as Writeable<OperationDefinitionNode>
                operation.directives = [
                    {
                        kind: "Directive",
                        name: {
                            kind: "Name",
                            value: "sample"
                        },
                        arguments: [
                            {
                                kind: "Argument",
                                name: {
                                    kind: "Name",
                                    value: "count"
                                },
                                value: {
                                    kind: "IntValue",
                                    value: debouncedSampleSize.toString()
                                }
                            }
                        ]
                    }
                ]
                if (operation.directives[0].arguments) {
                    (operation.directives[0].arguments as Writeable<ArgumentNode[]>).push({
                        kind: "Argument",
                        name: {
                            kind: "Name",
                            value: "random"
                        },
                        value: {
                            kind: "BooleanValue",
                            value: true
                        }
                    })
                }
                (operation.selectionSet.selections[0] as Writeable<FieldNode>).arguments = [
                    {
                        "kind": "Argument",
                        "name": {
                            "kind": "Name",
                            "value": "limit"
                        },
                        "value": {
                            "kind": "IntValue",
                            "value": "1000000"
                        }
                    }
                ]
                return print(newQuery)
            })
        }
    }, [debouncedSampleSize, open, query])

    useEffect(() => {
        if (open && product) {
            const baseType = getBaseType(product?.type) as GraphQLObjectType;
            const fields = Object.entries(baseType.getFields() || {})
                .filter(([_, field]) => isLeafType(getBaseType(field.type)))
            const fieldList = fields.map(([name, _]) => name).join(' ')
            const query = `query find__${baseType.name} @sample(count: ${debouncedSampleSize}, random: true) { ${product.name}(limit: 1000000) { ${fieldList} } }`
            setSampleQuery(query)
        }
    }, [product, open, debouncedSampleSize]);

    useEffect(() => {
        if (product) {
            setTitle(product.name)
        } else if (query && sampleQuery) {
            setTitle(sampleQuery.replace('\n', ''))
        }
    }, [product, query, sampleQuery])

    const userStyle: React.CSSProperties = {textAlign: 'right', color: 'blue', fontStyle: 'italic'}
    const assistantStyle: React.CSSProperties = {textAlign: 'left'}

    return (<Dialog fullWidth={true} style={{padding: 0}} maxWidth={'lg'} open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogCloseButton onClose={onClose}/>
            <DialogContent>
                <Box sx={{p: 2, height: '80vh', display: 'flex', flexDirection: 'column'}}>
                    <Paper sx={{p: 2, mb: 2, flex: '1 1 auto', overflowY: 'auto'}}>
                        <List sx={{flex: '1 1 auto'}}>
                            {messages.map((message, index) => (
                                <ListItem key={index}>
                                    <ListItemText
                                        disableTypography
                                        primary={
                                            <ReactMarkdown className={styles.markdown} remarkPlugins={[remarkGfm]}>
                                                {index === 0 ? process.env.NEXT_PUBLIC_ANTHROPIC_ALT_PROMPT : message.content}
                                            </ReactMarkdown>
                                        }
                                        secondary={<Typography
                                            style={{
                                                fontSize: 'small'
                                            }}
                                        >
                                            <hr/>
                                            {message.role === 'user' ? '"You"' : '"Data Research Assistant"'}
                                        </Typography>}
                                        sx={message.role === 'user' ? userStyle : assistantStyle}
                                    />
                                </ListItem>
                            ))}
                            {loading && (
                                <ListItem ref={listEndRef} sx={{justifyContent: 'center'}}>
                                    <CircularProgress/>
                                </ListItem>)}
                        </List>
                    </Paper>
                    <Box sx={{display: 'flex'}}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your message..."
                            value={input}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <TextField
                            sx={{ml: 2}}
                            disabled={loading}
                            type="number"
                            inputProps={{min: "1"}} // Make it a positive number input
                            label="With a sample size of:"
                            variant="outlined"
                            value={sampleSize}
                            onChange={(event) => {
                                setSampleSize(parseInt(event.target.value))
                            }}
                        />
                        <Button sx={{ml: 1, borderRadius: 5}} disabled={loading} ref={sendButtonRef} variant="contained"
                                color="primary"
                                onClick={handleSend}
                                startIcon={<SendIcon/>}>
                            Send
                        </Button>
                    </Box>
                </Box>
            </DialogContent>
            {error && <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={!!error}
                autoHideDuration={6000}
                style={{width: '400px'}}
                onClose={() => setError('')}
                message={error}
            />}
        </Dialog>
    );
}
export default AskMeDialog;

