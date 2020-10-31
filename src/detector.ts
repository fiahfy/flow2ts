export const isJSX = (code: string): boolean => {
  return !!code.match(/ from +['"]react['"]/)
}
