import {render} from '@testing-library/react';

import AnomaliesButton from './anomalies-button';


describe('ProfileButton', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<AnomaliesButton setQuery={() => { /* ignore */
        }}/>);
        expect(baseElement).toBeTruthy();
    });
});
