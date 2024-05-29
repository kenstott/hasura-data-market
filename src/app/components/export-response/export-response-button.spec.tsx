import {render} from '@testing-library/react';

import ExportResponseButton, {FileFormat} from './export-response-button';

describe('ExportResponseButton', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ExportResponseButton  format={FileFormat.CSV}/>);
    expect(baseElement).toBeTruthy();
  });
});
