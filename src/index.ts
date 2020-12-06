import { PluginItem, PluginObj, transformSync } from '@babel/core'
import {
  isIdentifier,
  isTSAnyKeyword,
  isTSTypeParameterInstantiation,
} from '@babel/types'
import babelPluginFlowToTypescript from 'babel-plugin-flow-to-typescript'

export const convert = (
  code: string,
  options: { dispatchAny?: boolean; reactTypes?: boolean } = {}
): string => {
  const { dispatchAny = false, reactTypes = false } = options

  const plugins: PluginItem[] = [babelPluginFlowToTypescript]
  if (reactTypes) {
    plugins.push(babelPluginReactTypes)
  }
  if (dispatchAny) {
    plugins.push(babelPluginDispatchAny)
  }

  const result = transformSync(code, {
    caller: {
      name: '@fiahfy/flow2ts',
    },
    configFile: false,
    plugins,
  })

  return result?.code ?? ''
}

const babelPluginReactTypes = (): PluginObj => {
  return {
    visitor: {
      TSQualifiedName(path) {
        const { left, right } = path.node
        if (isIdentifier(left) && left.name === 'React') {
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

const babelPluginDispatchAny = (): PluginObj => {
  return {
    visitor: {
      TSTypeReference(path) {
        const { typeName, typeParameters } = path.node
        if (
          isIdentifier(typeName) &&
          typeName.name === 'Dispatch' &&
          isTSTypeParameterInstantiation(typeParameters) &&
          isTSAnyKeyword(typeParameters.params[0])
        ) {
          path.node.typeParameters = null
        }
      },
    },
  }
}
