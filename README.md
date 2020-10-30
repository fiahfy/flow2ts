# flow2ts

![badge](https://github.com/fiahfy/flow2ts/workflows/Node.js%20Package/badge.svg)

> CLI to convert [Flow](https://github.com/facebook/flow) code into [TypeScript](https://github.com/Microsoft/TypeScript) with [babel-plugin-flow-to-typescript](https://github.com/Kiikurage/babel-plugin-flow-to-typescript).

## Installation

```bash
npm install @fiahfy/flow2ts
```

## Usage

```js
import { convert } from '@fiahfy/flow2ts'

convert(['index.js'])
```

## CLI

```bash
npm install -g @fiahfy/flow2ts
flow2ts index.js
```

or use via npx

```bash
npx @fiahfy/flow2ts index.js
```
