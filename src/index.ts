import { PluginItem, PluginObj, transformSync } from '@babel/core'
import {
  TSType,
  isIdentifier,
  isTSAnyKeyword,
  isTSIndexSignature,
  isTSNullKeyword,
  isTSTypeAnnotation,
  isTSTypeParameterInstantiation,
  isTSTypeReference,
  isTSUndefinedKeyword,
  isTSUnionType,
  tsMappedType,
  tsTypeParameter,
  tsUnionType,
} from '@babel/types'
import babelPluginFlowToTypescript from 'babel-plugin-flow-to-typescript'

export const convert = (
  code: string,
  options: {
    dispatchAny?: boolean
    mappedTypes?: boolean
    reactTypes?: boolean
    unionTypes?: boolean
  } = {}
): string => {
  const {
    dispatchAny = false,
    mappedTypes = false,
    reactTypes = false,
    unionTypes = false,
  } = options

  const plugins: PluginItem[] = [babelPluginFlowToTypescript]
  if (dispatchAny) {
    plugins.push(babelPluginDispatchAny)
  }
  if (mappedTypes) {
    plugins.push(babelPluginMappedTypes)
  }
  if (reactTypes) {
    plugins.push(babelPluginReactTypes)
  }
  if (unionTypes) {
    plugins.push(babelPluginUnionTypes)
  }

  const result = transformSync(code, {
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

const babelPluginMappedTypes = (): PluginObj => {
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

const babelPluginUnionTypes = (): PluginObj => {
  return {
    visitor: {
      TSUnionType(path) {
        const { types } = path.node
        if (types.some((type) => isTSUnionType(type))) {
          const flattenTypes = types.reduce((carry, type) => {
            if (isTSUnionType(type)) {
              return [...carry, ...type.types]
            } else {
              return [...carry, type]
            }
          }, [] as TSType[])
          const otherTypes = flattenTypes.filter(
            (type) => !isTSUndefinedKeyword(type) && !isTSNullKeyword(type)
          )
          const undefinedKeywords = flattenTypes.filter((type) =>
            isTSUndefinedKeyword(type)
          )
          const nullKeywords = flattenTypes.filter((type) =>
            isTSNullKeyword(type)
          )
          const replacement = tsUnionType([
            ...otherTypes,
            ...undefinedKeywords,
            ...nullKeywords,
          ])
          path.replaceWith(replacement)
        }
      },
    },
  }
}
