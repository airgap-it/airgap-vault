import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { TranslateModule } from '@ngx-translate/core'
import { ZXingScannerModule } from '@zxing/ngx-scanner'

import { SeedQRScanPage } from './seedqr-scan.page'

const routes: Routes = [
  {
    path: '',
    component: SeedQRScanPage
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
  declarations: [SeedQRScanPage]
})
export class SeedQRScanPageModule {}
