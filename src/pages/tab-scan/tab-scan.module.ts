import { NgModule } from '@angular/core'
import { IonicPageModule, Platform } from 'ionic-angular'
import { TabScanPage } from './tab-scan'
import { ComponentsModule } from '../../components/components.module'
import { ScannerProvider } from '../../providers/scanner/scanner'

@NgModule({
  declarations: [
    TabScanPage
  ],
  imports: [
    ComponentsModule,
    IonicPageModule.forChild(TabScanPage)
  ],
  providers: [
    ScannerProvider,
    Platform
  ],
  entryComponents: [
    TabScanPage
  ]
})

export class TabScanPageModule {}
