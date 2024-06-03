import {render} from '@testing-library/react';

import AnomaliesDialog from './anomalies-dialog';

describe('SamplerDialog', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<AnomaliesDialog open={true} onClose={() => {/* ignore */
        }}/>);
        expect(baseElement).toBeTruthy();
    });
});
