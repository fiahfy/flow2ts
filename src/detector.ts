import { transformSync } from '@babel/core'

export const isJSX = (code: string): boolean => {
  let jsx = false

  transformSync(code, {
    ast: true,
    configFile: false,
    plugins: [
      ['@babel/plugin-transform-typescript', { isTSX: true }],
      {
        visitor: {
          JSXElement() {
            jsx = true
          },
        },
      },
    ],
  })

  return jsx
}
