#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import meow from 'meow'
import { isJSX } from './detector'
import { convert } from '.'

type Options = {
  dispatchAny: boolean
  ext: string
  mappedObject: boolean
  react: boolean
}

const main = async (): Promise<void> => {
  const cli = meow(
    `
	Usage: flow2ts [options] <source>

	Options:
    -v, --version   output the version number
    -h, --help      output usage information
    --ext           specify converted file extension (default: detect)
    -a, --apply-all apply all following extended options
    --dispatch-any  omit any type on dispatch
    --mapped-object use mapped object type if index signature parameter type is not string or number
    --react         transform react types

	Examples:
    $ flow2ts index.js
    $ flow2ts src/**/*.js
`,
    {
      flags: {
        help: {
          type: 'boolean',
          default: false,
          alias: 'h',
        },
        version: {
          type: 'boolean',
          default: false,
          alias: 'v',
        },
        ext: {
          type: 'string',
          default: 'detect',
        },
        applyAll: {
          type: 'boolean',
          default: false,
          alias: 'a',
        },
        dispatchAny: {
          type: 'boolean',
          default: false,
        },
        mappedObject: {
          type: 'boolean',
          default: false,
        },
        react: {
          type: 'boolean',
          default: false,
        },
      },
    }
  )

  const inputs = cli.input
  const { help, version, ext, applyAll } = cli.flags
  const dispatchAny = applyAll ? true : cli.flags.dispatchAny
  const mappedObject = applyAll ? true : cli.flags.mappedObject
  const react = applyAll ? true : cli.flags.react

  if (version) {
    return cli.showVersion()
  }
  if (help) {
    return cli.showHelp()
  }

  if (!inputs.length) {
    return cli.showHelp()
  }

  if (ext !== 'detect' && !ext?.match(/^(\.\w+)+$/)) {
    console.error('Invalid specified extension')
    process.exitCode = 1
    return
  }

  runFiles(inputs, { ext, dispatchAny, mappedObject, react })
}

const runFiles = (inputs: string[], options: Options): void => {
  for (const input of inputs) {
    runFile(input, options)
  }
}

const runFile = (input: string, options: Options): void => {
  const code = fs.readFileSync(input, 'utf8')

  const converted = convert(code, options)

  const parsed = path.parse(input)
  parsed.base = ''
  parsed.ext = extension(converted, options.ext)
  const dist = path.format(parsed)

  fs.writeFileSync(dist, converted)
  console.log(`Output ${path.resolve(dist)}`)
}

const extension = (code: string, ext: string): string => {
  if (ext === 'detect') {
    return isJSX(code) ? '.tsx' : '.ts'
  }
  return ext
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
