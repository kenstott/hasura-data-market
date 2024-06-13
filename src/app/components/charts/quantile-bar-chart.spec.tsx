import {render} from '@testing-library/react';

import QuantileBarChart from './quantile-bar-chart';

describe('DecileBarChart', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<QuantileBarChart data={{'1': 0, '0.75': 0, '0.5': 0, '0.25': 0}}/>);
        expect(baseElement).toBeTruthy();
    });
});
