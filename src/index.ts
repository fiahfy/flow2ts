import fs from 'fs'
import path from 'path'
import * as babel from '@babel/core'
import babelPluginFlowToTypescript from 'babel-plugin-flow-to-typescript'
import { isJSX } from './detector'

type Options = {
  ext?: string
}

const extension = (code: string, ext?: string): string => {
  if (!ext || ext === 'detect') {
    return isJSX(code) ? '.tsx' : '.ts'
  }
  return ext
}

const convertFile = (src: string, options: Options): void => {
  const code = fs.readFileSync(src, 'utf8')
  const ext = extension(code, options.ext)

  const parsed = path.parse(src)
  parsed.base = ''
  parsed.ext = ext
  const dist = path.format(parsed)

  const result = babel.transformSync(code, {
    caller: {
      name: '@fiahfy/flow2ts',
    },
    configFile: false,
    plugins: [babelPluginFlowToTypescript],
  })

  if (!result) {
    throw new Error('Invalid transform result')
  }

  fs.writeFileSync(dist, result?.code ?? '')
  console.log(`Output ${path.resolve(dist)}`)
}

export const convert = (inputs: string[], options: Options): void => {
  for (const input of inputs) {
    convertFile(input, options)
  }
}
