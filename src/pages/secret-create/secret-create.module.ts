import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { SecretCreatePage } from './secret-create'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { TranslateModule } from '@ngx-translate/core'

@NgModule({
  declarations: [SecretCreatePage],
  imports: [MaterialIconsModule, IonicPageModule.forChild(SecretCreatePage), TranslateModule],
  entryComponents: [SecretCreatePage]
})
export class SecretCreatePageModule {}
