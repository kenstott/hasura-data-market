import React from "react";
import {ToolbarButton} from "@graphiql/react";
import {DirectiveNode, DocumentNode, Kind, OperationDefinitionNode, print} from "graphql";
import MoneyIcon from '@mui/icons-material/Money';
import styles from '../../components.module.scss'

/* eslint-disable-next-line */
interface SampleButtonProps {
    queryAST?: DocumentNode
    setQuery: (value: (((prevState: (string | undefined)) => (string | undefined)) | string | undefined)) => void
}

function sampleClicked(queryAST: DocumentNode | undefined, setQuery: (value: (((prevState: (string | undefined)) => (string | undefined)) | string | undefined)) => void) {
    return () => {
        if (queryAST) {
            const queryList = (queryAST.definitions.filter(a => a.kind === 'OperationDefinition' && a.operation === 'query')) as OperationDefinitionNode[]
            if (queryList.length === 0) {
                alert('No query to sample!')
            } else if (queryList.length > 1) {
                alert('Only supports a single query operation.')
            } else {
                const ast = queryList[0]
                if (ast.directives) {
                    const sampleIndex = ast.directives.findIndex(a => a.name.value === 'sample')
                    if (sampleIndex !== -1) {
                        const revisedDirectives = [...ast.directives]
                        revisedDirectives.splice(sampleIndex, 1)
                        const revisedAST = {...ast, directives: revisedDirectives}
                        const revisedQuery = print(revisedAST)
                        setQuery(revisedQuery)
                        return
                    }
                    const sampleDirective: DirectiveNode = {
                        kind: Kind.DIRECTIVE,
                        name: {
                            kind: Kind.NAME,
                            value: 'sample',
                        },
                        arguments: [{
                            kind: 'Argument',
                            name: {
                                kind: 'Name',
                                value: 'count'
                            },
                            value: {
                                kind: 'IntValue',
                                value: '100'
                            }
                        }],
                    }
                    const revisedDirectives = [...new Set([...ast.directives, sampleDirective])]
                    const revisedAST = {...ast, directives: revisedDirectives}
                    const revisedQuery = print(revisedAST)
                    setQuery(revisedQuery)
                }
            }
        }
    };
}

export const SampleButton: React.FC<SampleButtonProps> = ({queryAST, setQuery}) => {
    return (
        <ToolbarButton label={'Sample Query'} onClick={sampleClicked(queryAST, setQuery)}
                       className={styles['toolbar-button']}>
            <MoneyIcon className={styles['toolbar-button-icon']}/>
        </ToolbarButton>
    );
}

export default SampleButton;

