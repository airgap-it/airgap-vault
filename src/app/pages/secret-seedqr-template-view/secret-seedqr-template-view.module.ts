import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QRCodeModule } from 'angularx-qrcode'
import { TranslateModule } from '@ngx-translate/core'
import { IonicModule } from '@ionic/angular';

import { SecretSeedqrTemplateViewPageRoutingModule } from './secret-seedqr-template-view-routing.module';

import { SecretSeedqrTemplateViewPage } from './secret-seedqr-template-view.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QRCodeModule,
    TranslateModule,
    SecretSeedqrTemplateViewPageRoutingModule
  ],
  declarations: [SecretSeedqrTemplateViewPage]
})
export class SecretSeedqrTemplateViewPageModule {}
