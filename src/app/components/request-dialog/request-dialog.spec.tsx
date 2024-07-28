import {render} from '@testing-library/react';

import RequestDialog from './request-dialog';

describe('RequestDialog', () => {
    it('should render successfully', () => {
        const {baseElement} = render(<RequestDialog open={true} onCompleted={() => {/*ignore*/
        }} onClose={() => {/* ignore */
        }}/>);
        expect(baseElement).toBeTruthy();
    });
});
