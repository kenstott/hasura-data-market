import {render} from '@testing-library/react';

import MarketPlaceGrid from './market-place-grid';

describe('MarketPlaceGrid', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<MarketPlaceGrid/>);
        expect(baseElement).toBeTruthy();
    });
});
