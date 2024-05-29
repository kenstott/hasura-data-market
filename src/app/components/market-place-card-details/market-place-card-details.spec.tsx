import {render} from '@testing-library/react';

import MarketPlaceCardDetails from './market-place-card-details';

describe('MarketPlaceCardDetails', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<MarketPlaceCardDetails anchor={'left'}/>);
        expect(baseElement).toBeTruthy();
    });
});
