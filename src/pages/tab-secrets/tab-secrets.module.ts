import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TabSecretsPage } from './tab-secrets'
import { ComponentsModule } from '../../components/components.module'
import { MaterialIconsModule } from 'ionic2-material-icons'

@NgModule({
  declarations: [TabSecretsPage],
  imports: [ComponentsModule, MaterialIconsModule, IonicPageModule.forChild(TabSecretsPage)],
  entryComponents: [TabSecretsPage]
})
export class TabSecretsPageModule {}
