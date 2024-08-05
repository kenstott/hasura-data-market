import {render} from '@testing-library/react';
import MarketPlaceCard from './market-place-card';
import {Product} from "../../context/current-product-context/current-product-context";
import {GraphQLScalarType} from 'graphql';

export const GraphQLAny = new GraphQLScalarType({
    name: 'Any',
    serialize: (value) => value,
    parseValue: (value) => value,
    parseLiteral: (ast) => ast,
});

describe('MarketPlaceCard', () => {
    it('should render successfully', () => {
        const product: Product = {
            name: '',
            description: '',
            type: GraphQLAny,
            args: [],
            deprecationReason: '',
            isDeprecated: false,
            extensions: undefined
        }
        const {baseElement} = render(<MarketPlaceCard refresh={() => {/* ignore */
        }} product={product}/>);
        expect(baseElement).toBeTruthy();
    });
});
