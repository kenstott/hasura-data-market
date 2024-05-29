import {render} from '@testing-library/react';

import RequestQuery from './request-query';

describe('RequestQuery', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<RequestQuery/>);
        expect(baseElement).toBeTruthy();
    });
});
