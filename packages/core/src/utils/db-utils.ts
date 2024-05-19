type ObjectWithKey<T> = T extends object ? T : never
type ObjectWithStringifiedProperty<T extends object, K extends keyof T> = T & { [Property in K]: string }

export function withInsertJsonValue<T extends object, K extends keyof T>(
  originalObject: ObjectWithKey<T>,
  propertyToConvert: K
): ObjectWithStringifiedProperty<T, K> {
  const stringifiedPropertyValue = JSON.stringify(originalObject[propertyToConvert])

  return {
    ...originalObject,
    [propertyToConvert]: stringifiedPropertyValue,
  }
}
