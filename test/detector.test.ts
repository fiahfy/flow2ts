import { isJSX } from '../src/detector'

const jsxCode1 = `
import * as React from 'react';

const div = <div>dummy</div>;
`
const jsxCode2 = `
import * as React from 'react';

const obj = {
  element: <div>dummy</div>
}
`
const jsxCode3 = `
import * as React from 'react';

const Component: React.FC = () => <div>dummy</div>;
`
const notJSXCode1 = `
const n = 1;
`
const notJSXCode2 = `
import * as React from 'react';
`
const notJSXCode3 = `
import * as React from 'react';

type Element = JSX.Element;
`

describe('isJSX', () => {
  test('should work', async () => {
    expect(isJSX(jsxCode1)).toBe(true)
    expect(isJSX(jsxCode2)).toBe(true)
    expect(isJSX(jsxCode3)).toBe(true)
    expect(isJSX(notJSXCode1)).toBe(false)
    expect(isJSX(notJSXCode2)).toBe(false)
    expect(isJSX(notJSXCode3)).toBe(false)
  })
})
