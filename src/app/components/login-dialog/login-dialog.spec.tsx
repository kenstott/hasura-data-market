import {render} from '@testing-library/react';

import LoginDialog from './login-dialog';

describe('LoginDialog', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<LoginDialog open={true} onClose={() => {/* ignore */
        }}/>);
        expect(baseElement).toBeTruthy();
    });
});
