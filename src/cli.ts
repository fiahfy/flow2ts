#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import meow from 'meow'
import { isJSX } from './detector'
import { convert } from '.'

type Options = {
  dispatchAny: boolean
  ext: string
  mappedTypes: boolean
  reactTypes: boolean
  unionTypes: boolean
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
    --mapped-types  use mapped types if index signature parameter type is not string or number
    --react-types   transform react types
    --union-types   flatten union types

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
        mappedTypes: {
          type: 'boolean',
          default: false,
        },
        reactTypes: {
          type: 'boolean',
          default: false,
        },
        unionTypes: {
          type: 'boolean',
          default: false,
        },
      },
    }
  )

  const inputs = cli.input
  const { help, version, ext, applyAll } = cli.flags
  const dispatchAny = applyAll ? true : cli.flags.dispatchAny
  const mappedTypes = applyAll ? true : cli.flags.mappedTypes
  const reactTypes = applyAll ? true : cli.flags.reactTypes
  const unionTypes = applyAll ? true : cli.flags.unionTypes

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
    return process.exit(1)
  }

  runFiles(inputs, { ext, dispatchAny, mappedTypes, reactTypes, unionTypes })
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
  process.exit(1)
})
