import { transformSync } from '@babel/core'

export const isJSX = (code: string): boolean => {
  let jsx = false

  transformSync(code, {
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
