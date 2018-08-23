import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretCreatePage } from './secret-create'
import { MaterialIconsModule } from 'ionic2-material-icons'

@NgModule({
  declarations: [
    SecretCreatePage
  ],
  imports: [
    MaterialIconsModule,
    IonicPageModule.forChild(SecretCreatePage)
  ],
  entryComponents: [
    SecretCreatePage
  ]
})
export class SecretCreatePageModule {}
