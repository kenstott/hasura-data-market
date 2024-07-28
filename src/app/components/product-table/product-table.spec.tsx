import {render} from '@testing-library/react';

import ProductTable from './product-table';

describe('ProductFieldTable', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<ProductTable path={""}/>);
        expect(baseElement).toBeTruthy();
    });
});
