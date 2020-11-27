import { convert } from '../src'

const flowCode = `
// @flow
import * as React from 'react';

type Element = React.Element;
type Node = React.Node;

type Props = {
  title: ?string
};

const MyComponent = ({ title }: Props) => {
  return <div>{title}</div>;
};

export default MyComponent;
`

const tsCode1 = `import * as React from 'react';
type Element = React.Element;
type Node = React.Node;
type Props = {
  title: string | undefined | null;
};

const MyComponent = ({
  title
}: Props) => {
  return <div>{title}</div>;
};

export default MyComponent;`

const tsCode2 = `import * as React from 'react';
type Element = React.ReactElement;
type Node = React.ReactNode;
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
    expect(convert(flowCode)).toBe(tsCode1)
    expect(convert(flowCode, { reactTypes: true })).toBe(tsCode2)
  })
})
