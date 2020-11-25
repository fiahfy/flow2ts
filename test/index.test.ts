import { convert } from '../src'

const flowCode = `
// @flow
import * as React from 'react';

type Props = {
  title: ?string
};

const MyComponent = ({ title }: Props) => {
  return <div>{title}</div>;
};

export default MyComponent;
`

const tsCode = `import * as React from 'react';
type Props = {
  title: string | undefined | null;
};

const MyComponent = ({
  title
}: Props) => {
  return <div>{title}</div>;
};

export default MyComponent;`

describe('convert', () => {
  test('should work', async () => {
    expect(convert(flowCode)).toBe(tsCode)
  })
})
