import { Injectable } from '@angular/core'
import { ErrorCategory, handleErrorLocal } from '../../error-handler/error-handler.service'
import { NavigationService } from '../../navigation/navigation.service'
import { ModeStrategy } from './ModeStrategy'

@Injectable({
  providedIn: 'root'
})
export class AdvancedModeSerivce implements ModeStrategy {
  constructor(private readonly navigationService: NavigationService) {}

  public async syncAll(): Promise<void> {
    await this.navigationService.route('/account-share-select').catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
  }
}
