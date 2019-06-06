import { Component } from '@angular/core'
import { Router } from '@angular/router'

// import { SecretShowPage } from '../secret-show/secret-show'
import { Secret } from '../../models/secret'

import { ErrorCategory, handleErrorLocal } from './../../services/error-handler/error-handler.service'

@Component({
  selector: 'secret-rules',
  templateUrl: './secret-rules.page.html',
  styleUrls: ['./secret-rules.page.scss']
})
export class SecretRulesPage {
  private readonly secret: Secret

  constructor(private readonly router: Router) {
    // this.secret = this.navParams.get('secret')
    this.secret = new Secret('90ac75896c3f57107c4ab0979b7c2ca1790e29ce7d25308b997fbbd53b9829c4', 'asdf') // TODO: Get secret from previous page
  }

  public goToShowSecret() {
    this.router.navigate(['secret-show']).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

    // this.navController.push(SecretShowPage, { secret: this.secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
