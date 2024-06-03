import {render} from '@testing-library/react';

import GraphqlSchemaContext from './search-context';

describe('GraphqlSchemaContext', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<GraphqlSchemaContext/>);
        expect(baseElement).toBeTruthy();
    });
});
