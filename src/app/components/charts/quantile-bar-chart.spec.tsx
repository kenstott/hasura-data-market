import {render} from '@testing-library/react';

import QuantileBarChart from './quantile-bar-chart';

describe('DecileBarChart', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<QuantileBarChart/>);
        expect(baseElement).toBeTruthy();
    });
});
