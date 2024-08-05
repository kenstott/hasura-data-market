import {render} from '@testing-library/react';

import {CurrentProductContextProvider} from './current-product-context';

describe('GraphqlSchemaContext', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<CurrentProductContextProvider><></>
        </CurrentProductContextProvider>);
        expect(baseElement).toBeTruthy();
    });
});
