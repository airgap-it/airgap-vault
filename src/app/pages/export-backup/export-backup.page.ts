import { Component, OnInit } from '@angular/core'
import { Observable } from 'rxjs'
import { Secret } from 'src/app/models/secret'

import { PgpService } from 'src/app/services/pgp/pgp.service'
import { SecretsService } from 'src/app/services/secrets/secrets.service'

@Component({
  selector: 'airgap-export-backup',
  templateUrl: './export-backup.page.html',
  styleUrls: ['./export-backup.page.scss']
})
export class ExportBackupPage implements OnInit {
  public masterSecret: Secret | undefined

  public secrets: Observable<Secret[]>

  public selectedSecrets: Secret[] = []

  constructor(private readonly pgpService: PgpService, private readonly secretsService: SecretsService) {
    this.secrets = this.secretsService.getSecretsObservable()
  }

  ngOnInit() {}

  async encrypt() {
    if (this.masterSecret) {
    }

    const result = await this.pgpService.encryptTextWithPassword('test', 'secret')

    console.log('RESULT', result)

    const conv1 = await this.pgpService.convertBinaryToArmored(result)
    const conv2 = await this.pgpService.convertArmoredToBinary(conv1)
    console.log('RESULTS', conv1, conv2, result)
  }
}
