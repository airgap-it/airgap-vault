import { NgModule } from '@angular/core'
import { IonicPageModule } from 'ionic-angular'
import { TabSecretsPage } from './tab-secrets'
import { ComponentsModule } from '../../components/components.module'
import { MaterialIconsModule } from 'ionic2-material-icons'
import { TranslateModule } from '@ngx-translate/core'
import { AboutPopoverComponent } from './about-popover/about-popover.component'

@NgModule({
  declarations: [TabSecretsPage, AboutPopoverComponent],
  imports: [ComponentsModule, MaterialIconsModule, IonicPageModule.forChild(TabSecretsPage), TranslateModule],
  entryComponents: [TabSecretsPage, AboutPopoverComponent]
})
export class TabSecretsPageModule {}
