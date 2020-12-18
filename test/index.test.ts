import { convert } from '../src'

const t = (code: string) => {
  return code
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length)
    .join('\n')
}

// supress warnings for existential type in flow
console.warn = jest.fn()

describe('convert', () => {
  test('should work', async () => {
    const code = `
    // @flow
    import * as React from 'react';

    type Props = {
      title: ?string,
    };

    const MyComponent = ({ title }: Props) => {
      return <div>{title}</div>;
    };

    export default MyComponent;`
    const result = `
    import * as React from 'react';

    type Props = {
      title: string | undefined | null;
    };

    const MyComponent = ({
      title
    }: Props) => {
      return <div>{title}</div>;
    };

    export default MyComponent;`
    expect(t(convert(code))).toBe(t(result))
  })
  test('should work with dispatch any option', async () => {
    const code = `
    type D1 = Dispatch<any>;
    type D2 = Dispatch<*>;
    type D3 = Dispatch<DummyAction>;
    type Props = {
      d1: Dispatch<any>,
      d2: Dispatch<*>,
      d3: Dispatch<DummyAction>,
    };`
    const falseResult = `
    type D1 = Dispatch<any>;
    type D2 = Dispatch<any>;
    type D3 = Dispatch<DummyAction>;
    type Props = {
      d1: Dispatch<any>;
      d2: Dispatch<any>;
      d3: Dispatch<DummyAction>;
    };`
    const trueResult = `
    type D1 = Dispatch;
    type D2 = Dispatch;
    type D3 = Dispatch<DummyAction>;
    type Props = {
      d1: Dispatch;
      d2: Dispatch;
      d3: Dispatch<DummyAction>;
    };`
    expect(t(convert(code, { dispatchAny: false }))).toBe(t(falseResult))
    expect(t(convert(code, { dispatchAny: true }))).toBe(t(trueResult))
  })
  test('should work with react types option', async () => {
    const code = `
    type T11 = {
      [x: string]: any
    };
    type T12 = {
      [string]: any
    };
    type T21 = {
      [x: number]: any
    };
    type T22 = {
      [number]: any
    };
    type T31 = {
      [x: 'a'|'b']: any
    };
    type T32 = {
      ['a'|'b']: any
    };
    type Key = 'key';
    type T41 = {
      [x: Key]: any
    };
    type T42 = {
      [Key]: any
    };`
    const falseResult = `
    type T11 = {
      [x: string]: any;
    };
    type T12 = {
      [x: string]: any;
    };
    type T21 = {
      [x: number]: any;
    };
    type T22 = {
      [x: number]: any;
    };
    type T31 = {
      [x: "a" | "b"]: any;
    };
    type T32 = {
      [x: "a" | "b"]: any;
    };
    type Key = "key";
    type T41 = {
      [x: Key]: any;
    };
    type T42 = {
      [x: Key]: any;
    };`
    const trueResult = `
    type T11 = {
      [x: string]: any;
    };
    type T12 = {
      [x: string]: any;
    };
    type T21 = {
      [x: number]: any;
    };
    type T22 = {
      [x: number]: any;
    };
    type T31 = { [x in "a" | "b"]: any };
    type T32 = { [x in "a" | "b"]: any };
    type Key = "key";
    type T41 = { [x in Key]: any };
    type T42 = { [x in Key]: any };`
    expect(t(convert(code, { mappedObject: false }))).toBe(t(falseResult))
    expect(t(convert(code, { mappedObject: true }))).toBe(t(trueResult))
  })
  test('should work with react types option', async () => {
    const code = `
    type E = React.Element;
    type N = React.Node;
    type Props = {
      e: React.Element,
      n: React.Node,
    };`
    const falseResult = `
    type E = React.Element;
    type N = React.Node;
    type Props = {
      e: React.Element;
      n: React.Node;
    };`
    const trueResult = `
    type E = React.ReactElement;
    type N = React.ReactNode;
    type Props = {
      e: React.ReactElement;
      n: React.ReactNode;
    };`
    expect(t(convert(code, { react: false }))).toBe(t(falseResult))
    expect(t(convert(code, { react: true }))).toBe(t(trueResult))
  })
})
