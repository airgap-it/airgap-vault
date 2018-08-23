export class Serializable {
  fillFromJSON(json: string): this {
    let jsonObj = JSON.parse(json)
    for (let propName in jsonObj) {
      this[propName] = JSON.parse(jsonObj[propName])
    }
    return this
  }

  fillFromObj(jsonObj: Object): this {
    for (let propName in jsonObj) {
      this[propName] = jsonObj[propName]
    }
    return this
  }
}
