import { isJSX } from '../src/detector'

const jsxCode1 = `
import * as React from 'react';
`
const jsxCode2 = `
import React from 'react';
`
const jsxCode3 = `
import * as react from 'react'
`
const jsxCode4 = `
import * as react from "react";
`
const jsxCode5 = `
import { useEffect } from 'react';
`
const jsxCode6 = `
import {
  useEffect
} from 'react';
`
const jsxCode7 = `
import   *   as   React   from   'react'   ;
`
const notJSXCode = `
import * as ReactDOM from 'react-dom';
`

describe('isJSX', () => {
  test('should work', async () => {
    expect(isJSX(jsxCode1)).toBe(true)
    expect(isJSX(jsxCode2)).toBe(true)
    expect(isJSX(jsxCode3)).toBe(true)
    expect(isJSX(jsxCode4)).toBe(true)
    expect(isJSX(jsxCode5)).toBe(true)
    expect(isJSX(jsxCode6)).toBe(true)
    expect(isJSX(jsxCode7)).toBe(true)
    expect(isJSX(notJSXCode)).toBe(false)
  })
})
