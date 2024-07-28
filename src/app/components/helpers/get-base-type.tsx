import {GraphQLType, isWrappingType} from "graphql";

export const getBaseType = (t?: GraphQLType): GraphQLType | undefined => {
    if (t) {
        if (isWrappingType(t)) {
            return getBaseType(t.ofType)
        }
    }
    return t;
}