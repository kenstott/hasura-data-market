import {render} from '@testing-library/react';

import LoginContext from './login-context';

describe('LoginContext', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<LoginContext/>);
        expect(baseElement).toBeTruthy();
    });
});
