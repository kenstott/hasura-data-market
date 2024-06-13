import {render} from '@testing-library/react';

import SampleButton from './sample-button';


describe('ProfileButton', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<SampleButton setQuery={() => { /* ignore */
        }}/>);
        expect(baseElement).toBeTruthy();
    });
});
