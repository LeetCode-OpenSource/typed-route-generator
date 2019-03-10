import { set } from 'lodash'

import { Routes, VariableName } from './types'
import { recursiveForEach, convert, codeStringify } from './utils'

interface ParseResult {
  staticRoute: { [key: string]: object | string }
  routeFactory: { [key: string]: object | string }
}

export function generateCode(routes: Routes, variableName: VariableName): string {
  const { staticRoute, routeFactory } = parse(routes, variableName)

  return `
import { makePathsFrom, Params, RepeatParams } from "typed-route-generator"

export const ${variableName.staticRoute} = ${codeStringify(staticRoute)};

export const ${variableName.routeFactory} = ${codeStringify(routeFactory)};`
}

function parse(routes: Routes, { staticRoute }: VariableName): ParseResult {
  const result: ParseResult = { staticRoute: {}, routeFactory: {} }

  recursiveForEach(routes, (pathString, currentRefPath) => {
    const { path, paramsType } = convert(pathString)
    const pathRef = [staticRoute, ...currentRefPath].join('.')

    set(result.staticRoute, currentRefPath, `'${path}'`)
    set(result.routeFactory, currentRefPath, `makePathsFrom<${paramsType}>(${pathRef})`)
  })

  return result
}
