import * as babel from '@babel/core'
import { parse } from '@babel/parser'
import generate from '@babel/generator'
import traverse from '@babel/traverse'
import babelPluginFlowToTypescript from 'babel-plugin-flow-to-typescript'

const convertFlowToTS = (code: string): string => {
  const result = babel.transformSync(code, {
    caller: {
      name: '@fiahfy/flow2ts',
    },
    configFile: false,
    plugins: [babelPluginFlowToTypescript],
  })

  return result?.code ?? ''
}

const visitor: babel.Visitor = {
  VariableDeclaration(path) {
    path.node.kind = 'var'
  },
  TSQualifiedName(path) {
    if (path.node.left.name !== 'React') {
      return
    }
    switch (path.node.right.name) {
      case 'Element':
        path.node.right.name = 'ReactElement'
        break
      case 'Node':
        path.node.right.name = 'ReactNode'
        break
      case 'ChildrenArray':
      // console.log(path.node, path.node.left.name)
    }
  },
  MemberExpression(path) {
    // console.log(path.node)
  },
  TSTypeReference(path) {
    console.log(path.node)
    const typeName = path.node.typeName
    const typeParameters = path.node.typeParameters
    if (
      typeName.type === 'TSQualifiedName' &&
      typeName.left.name === 'React' &&
      typeName.right.name === 'ChildrenArray' &&
      typeParameters
    ) {
      // path.replaceWith({
      //   ...path.node,
      //   typeParameter: undefined,
      //   typeAnnotation: {
      //     types
      //   }
      // })
    }
  },
}

const convertReactTypes = (code: string): string => {
  console.log('###############ORIGIN###################')
  console.log(code)
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })
  console.log(ast.program.body[2].typeAnnotation)
  traverse(ast, visitor)
  const result = generate(ast)
  console.log('###############CONVERTED###################')
  console.log(result.code)
  return result.code
}

export const convert = (code: string): string => {
  const tsCode = convertFlowToTS(code)
  return convertReactTypes(tsCode)
}
