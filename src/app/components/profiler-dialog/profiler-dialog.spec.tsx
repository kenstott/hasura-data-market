import {render} from '@testing-library/react';

import ProfilerDialog from './profiler-dialog';

describe('SamplerDialog', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<ProfilerDialog open={true} onClose={() => {/* ignore */
        }}/>);
        expect(baseElement).toBeTruthy();
    });
});
