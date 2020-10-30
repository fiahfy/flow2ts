import fs from 'fs'
import path from 'path'
import * as babel from '@babel/core'
import babelPluginFlowToTypescript from 'babel-plugin-flow-to-typescript'

const isJSX = (filePath: string): boolean => {
  const code = fs.readFileSync(filePath, 'utf8')
  return !!code.match(/import .* from +'react'/)
}

const convertFile = (src: string): void => {
  const jsx = isJSX(src)
  const parsed = path.parse(src)
  parsed.base = ''
  parsed.ext = jsx ? '.tsx' : '.ts'
  const dist = path.format(parsed)

  const result = babel.transformFileSync(src, {
    caller: {
      name: '@fiahfy/flow2ts',
    },
    plugins: [babelPluginFlowToTypescript],
  })

  if (!result) {
    throw new Error('Invalid transform result')
  }

  fs.writeFileSync(dist, result?.code ?? '')
  console.log(`Output ${path.resolve(dist)}`)
}

export const convert = (inputs: string[]): void => {
  for (const input of inputs) {
    convertFile(input)
  }
}
