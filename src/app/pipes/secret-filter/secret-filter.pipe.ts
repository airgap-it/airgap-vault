import { Pipe, PipeTransform } from '@angular/core'
import { MnemonicSecret } from 'src/app/models/secret'

@Pipe({
    name: 'secretFilter',
    standalone: false
})
export class SecretFilterPipe implements PipeTransform {
  public transform(items: MnemonicSecret[], args: any): MnemonicSecret[] {
    if (items === null || items?.length === 0) {
      return []
    }

    const label: string | undefined = args?.label

    if (!label) {
      return items
    } else {
      return items.filter((secret: MnemonicSecret) => {
        return secret.label.toLowerCase().includes(label)
      })
    }
  }
}
