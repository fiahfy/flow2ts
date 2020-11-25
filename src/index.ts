import * as babel from '@babel/core'
import babelPluginFlowToTypescript from 'babel-plugin-flow-to-typescript'

export const convert = (code: string): string => {
  const result = babel.transformSync(code, {
    caller: {
      name: '@fiahfy/flow2ts',
    },
    configFile: false,
    plugins: [babelPluginFlowToTypescript],
  })

  return result?.code ?? ''
}
