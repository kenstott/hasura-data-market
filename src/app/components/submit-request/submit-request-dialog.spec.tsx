import { render } from '@testing-library/react';

import SubmitRequestDialog from './submit-request-dialog';

describe('SubmitRequestDialog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SubmitRequestDialog />);
    expect(baseElement).toBeTruthy();
  });
});
