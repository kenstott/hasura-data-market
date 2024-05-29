import {render} from '@testing-library/react';

import DialogCloseButton from './dialog-close-button';

describe('DialogCloseButton', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<DialogCloseButton onClose={() => {/* ignore */
        }}/>);
        expect(baseElement).toBeTruthy();
    });
});
