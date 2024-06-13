import React from "react";
import {ToolbarButton} from "@graphiql/react";
import QueryStatsSharpIcon from "@mui/icons-material/QueryStatsSharp";
import {DirectiveNode, DocumentNode, Kind, OperationDefinitionNode, print} from "graphql";
import styles from '../../components.module.scss'

/* eslint-disable-next-line */
interface ProfileButtonProps {
    queryAST?: DocumentNode
    setQuery: (value: (((prevState: (string | undefined)) => (string | undefined)) | string | undefined)) => void
}

function profileClicked(queryAST: DocumentNode | undefined, setQuery: (value: (((prevState: (string | undefined)) => (string | undefined)) | string | undefined)) => void) {
    return () => {
        if (queryAST) {
            const queryList = (queryAST.definitions.filter(a => a.kind === 'OperationDefinition' && a.operation === 'query')) as OperationDefinitionNode[]
            if (queryList.length === 0) {
                alert('No query to profile!')
            } else if (queryList.length > 1) {
                alert('Only supports a single query operation.')
            } else {
                const ast = queryList[0]
                if (ast.directives) {
                    const profileIndex = ast.directives.findIndex(a => a.name.value === 'profile')
                    if (profileIndex !== -1) {
                        const revisedDirectives = [...ast.directives]
                        revisedDirectives.splice(profileIndex, 1)
                        const revisedAST = {...ast, directives: revisedDirectives}
                        const revisedQuery = print(revisedAST)
                        setQuery(revisedQuery)
                        return
                    }
                    const profileDirective: DirectiveNode = {
                        kind: Kind.DIRECTIVE,
                        name: {
                            kind: Kind.NAME,
                            value: 'profile',
                        },
                        arguments: [],
                    }
                    const revisedDirectives = [...new Set([...ast.directives, profileDirective])]
                    const revisedAST = {...ast, directives: revisedDirectives}
                    const revisedQuery = print(revisedAST)
                    setQuery(revisedQuery)
                }
            }
        }
    };
}

export const ProfileButton: React.FC<ProfileButtonProps> = ({queryAST, setQuery}) => {
    return (
        <ToolbarButton label={'Profile Query'} onClick={profileClicked(queryAST, setQuery)}
                       className={styles['toolbar-button']}>
            <QueryStatsSharpIcon className={styles['toolbar-button-icon']}/>
        </ToolbarButton>
    );
}

export default ProfileButton;

