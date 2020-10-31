#!/usr/bin/env node

import meow from 'meow'
import { convert } from '.'

const main = async (): Promise<void> => {
  const cli = meow(
    `
	Usage: flow2ts [options] <source>

	Options:
    -v, --version  output the version number
    -h, --help     output usage information
    --ext          specify converted file extension (default: detect)

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
      },
    }
  )

  if (cli.flags.version) {
    return cli.showVersion()
  }
  if (cli.flags.help) {
    return cli.showHelp()
  }

  const inputs = cli.input

  if (!inputs.length) {
    return cli.showHelp()
  }

  const ext = cli.flags.ext
  if (ext && ext !== 'detect' && !ext?.match(/^(\.\w+)+$/)) {
    console.error('Invalid specified extension')
    process.exitCode = 1
    return
  }

  convert(inputs, { ext })
}

main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
