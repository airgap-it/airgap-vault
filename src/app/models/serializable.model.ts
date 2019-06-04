export class Serializable {
  public fillFromJSON(json: string): this {
    const jsonObj = JSON.parse(json)
    for (const propName in jsonObj) {
      this[propName] = JSON.parse(jsonObj[propName])
    }

    return this
  }

  public fillFromObj(jsonObj: Object): this {
    for (const propName in jsonObj) {
      this[propName] = jsonObj[propName]
    }

    return this
  }
}
