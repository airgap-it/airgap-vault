import { NgModule } from '@angular/core'
import { IonicPageModule, Platform } from 'ionic-angular'
import { TabScanPage } from './tab-scan'
import { ComponentsModule } from '../../components/components.module'
import { ScannerProvider } from '../../providers/scanner/scanner'
import { AirGapSchemeProvider } from '../../providers/scheme/scheme.service'

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
    Platform,
    AirGapSchemeProvider
  ],
  entryComponents: [
    TabScanPage
  ]
})

export class TabScanPageModule {}
