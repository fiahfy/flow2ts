#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import meow from 'meow'
import { isJSX } from './detector'
import { convert } from '.'

type Options = {
  ext: string
  reactTypes: boolean
}

const main = async (): Promise<void> => {
  const cli = meow(
    `
	Usage: flow2ts [options] <source>

	Options:
    -v, --version  output the version number
    -h, --help     output usage information
    --ext          specify converted file extension (default: detect)
    --react-types  transform react types

	Examples:
    $ flow2ts index.js
    $ flow2ts src/**/*.js
`,
    {
      flags: {
        help: {
          type: 'boolean',
          alias: 'h',
        },
        version: {
          type: 'boolean',
          alias: 'v',
        },
        ext: {
          type: 'string',
        },
        reactTypes: {
          type: 'boolean',
        },
      },
    }
  )

  const inputs = cli.input
  const { help, version, ext = 'detect', reactTypes = false } = cli.flags

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

  runFiles(inputs, { ext, reactTypes })
}

const runFiles = (inputs: string[], options: Options): void => {
  for (const input of inputs) {
    runFile(input, options)
  }
}

const runFile = (input: string, options: Options): void => {
  const code = fs.readFileSync(input, 'utf8')
  const ext = extension(code, options.ext)

  const parsed = path.parse(input)
  parsed.base = ''
  parsed.ext = ext
  const dist = path.format(parsed)

  const converted = convert(code, { reactTypes: options.reactTypes })

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
