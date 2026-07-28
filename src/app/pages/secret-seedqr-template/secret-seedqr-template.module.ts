import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core'
import { IonicModule } from '@ionic/angular';

import { SecretSeedqrTemplatePageRoutingModule } from './secret-seedqr-template-routing.module';

import { SecretSeedqrTemplatePage } from './secret-seedqr-template.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    SecretSeedqrTemplatePageRoutingModule
  ],
  declarations: [SecretSeedqrTemplatePage]
})
export class SecretSeedqrTemplatePageModule {}
