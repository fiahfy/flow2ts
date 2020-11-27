import { PluginObj, transformSync } from '@babel/core'
import { Identifier } from '@babel/types'
import babelPluginFlowToTypescript from 'babel-plugin-flow-to-typescript'

export const convert = (
  code: string,
  options: { reactTypes: boolean } = { reactTypes: false }
): string => {
  const result = transformSync(code, {
    caller: {
      name: '@fiahfy/flow2ts',
    },
    configFile: false,
    plugins: [
      babelPluginFlowToTypescript,
      ...(options.reactTypes ? [babelPluginReactTypes] : []),
    ],
  })

  return result?.code ?? ''
}

const babelPluginReactTypes = (): PluginObj => {
  return {
    visitor: {
      TSQualifiedName(path) {
        const { left, right } = path.node
        if ((left as Identifier).name === 'React') {
          switch (right.name) {
            case 'Element':
              right.name = 'ReactElement'
              break
            case 'Node':
              right.name = 'ReactNode'
              break
          }
        }
      },
    },
  }
}
