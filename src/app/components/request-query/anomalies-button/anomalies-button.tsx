import React from "react";
import {ToolbarButton} from "@graphiql/react";
import {DirectiveNode, DocumentNode, Kind, OperationDefinitionNode, print} from "graphql";
import BugReportIcon from '@mui/icons-material/BugReport';
import styles from '../../components.module.scss'

/* eslint-disable-next-line */
interface SampleButtonProps {
    queryAST?: DocumentNode
    setQuery: (value: (((prevState: (string | undefined)) => (string | undefined)) | string | undefined)) => void
}

function anomalyClicked(queryAST: DocumentNode | undefined, setQuery: (value: (((prevState: (string | undefined)) => (string | undefined)) | string | undefined)) => void) {
    return () => {
        if (queryAST) {
            const queryList = (queryAST.definitions.filter(a => a.kind === 'OperationDefinition' && a.operation === 'query')) as OperationDefinitionNode[]
            if (queryList.length === 0) {
                alert('No query to anomaly!')
            } else if (queryList.length > 1) {
                alert('Only supports a single query operation.')
            } else {
                const ast = queryList[0]
                if (ast.directives) {
                    const anomalyIndex = ast.directives.findIndex(a => a.name.value === 'anomalies')
                    if (anomalyIndex !== -1) {
                        const revisedDirectives = [...ast.directives]
                        revisedDirectives.splice(anomalyIndex, 1)
                        const revisedAST = {...ast, directives: revisedDirectives}
                        const revisedQuery = print(revisedAST)
                        setQuery(revisedQuery)
                        return
                    }
                    const anomalyDirective: DirectiveNode = {
                        kind: Kind.DIRECTIVE,
                        name: {
                            kind: Kind.NAME,
                            value: 'anomalies',
                        },
                    }
                    const revisedDirectives = [...new Set([...ast.directives, anomalyDirective])]
                    const revisedAST = {...ast, directives: revisedDirectives}
                    const revisedQuery = print(revisedAST)
                    setQuery(revisedQuery)
                }
            }
        }
    };
}

export const AnomaliesButton: React.FC<SampleButtonProps> = ({queryAST, setQuery}) => {
    return (
        <ToolbarButton label={'Anomalies Query'} onClick={anomalyClicked(queryAST, setQuery)}
                       className={styles['toolbar-button']}>
            <BugReportIcon className={styles['toolbar-button-icon']}/>
        </ToolbarButton>
    );
}

export default AnomaliesButton;

