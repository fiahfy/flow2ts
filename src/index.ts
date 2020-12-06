import { PluginItem, PluginObj, transformSync } from '@babel/core'
import {
  isIdentifier,
  isTSAnyKeyword,
  isTSIndexSignature,
  isTSTypeAnnotation,
  isTSTypeParameterInstantiation,
  isTSTypeReference,
  isTSUnionType,
  tsMappedType,
  tsTypeParameter,
} from '@babel/types'
import babelPluginFlowToTypescript from 'babel-plugin-flow-to-typescript'

export const convert = (
  code: string,
  options: {
    dispatchAny?: boolean
    mappedObject?: boolean
    react?: boolean
  } = {}
): string => {
  const { dispatchAny = false, mappedObject = false, react = false } = options

  const plugins: PluginItem[] = [babelPluginFlowToTypescript]
  if (dispatchAny) {
    plugins.push(babelPluginDispatchAny)
  }
  if (mappedObject) {
    plugins.push(babelPluginMappedType)
  }
  if (react) {
    plugins.push(babelPluginReactTypes)
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

const babelPluginMappedType = (): PluginObj => {
  return {
    visitor: {
      TSTypeLiteral(path) {
        const { members } = path.node
        if (members.length === 1 && isTSIndexSignature(members[0])) {
          const { parameters, typeAnnotation: valueTypeAnnotation } = members[0]
          if (isIdentifier(parameters[0]) && valueTypeAnnotation) {
            const { name, typeAnnotation } = parameters[0]
            if (isTSTypeAnnotation(typeAnnotation)) {
              const { typeAnnotation: keyTypeReference } = typeAnnotation
              if (
                isTSTypeReference(keyTypeReference) ||
                isTSUnionType(keyTypeReference)
              ) {
                const typeParameter = tsTypeParameter(
                  keyTypeReference,
                  undefined,
                  name
                )
                const replacement = tsMappedType(
                  typeParameter,
                  valueTypeAnnotation.typeAnnotation
                )
                path.replaceWith(replacement)
              }
            }
          }
        }
      },
    },
  }
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
