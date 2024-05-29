import {render} from '@testing-library/react';

import SamplerDialog from './sampler-dialog';

describe('SamplerDialog', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<SamplerDialog open={true} onClose={() => {/* ignore */
        }}/>);
        expect(baseElement).toBeTruthy();
    });
});
