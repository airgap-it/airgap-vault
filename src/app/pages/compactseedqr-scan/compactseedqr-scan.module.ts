import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { ZXingScannerModule } from '@zxing/ngx-scanner'

import { CompactSeedQRScanPage } from './compactseedqr-scan.page'

const routes: Routes = [
  {
    path: '',
    component: CompactSeedQRScanPage
  }
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ZXingScannerModule
  ],
  declarations: [CompactSeedQRScanPage]
})
export class CompactSeedQRScanPageModule {}
