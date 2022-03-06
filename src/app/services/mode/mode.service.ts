import { Injectable } from '@angular/core'

import { AdvancedModeType, VaultStorageKey, VaultStorageService } from '../storage/storage.service'

import { AdvancedModeSerivce } from './strategy/advanced-mode.service'
import { BasicModeService } from './strategy/basic-mode.service'
import { ModeStrategy } from './strategy/ModeStrategy'

@Injectable({
  providedIn: 'root'
})
export class ModeService {
  constructor(
    private readonly storage: VaultStorageService,
    private readonly advancedModeService: AdvancedModeSerivce,
    private readonly basicModeService: BasicModeService
  ) {}

  public async strategy(): Promise<ModeStrategy> {
    const advancedMode: AdvancedModeType = await this.storage.get(VaultStorageKey.ADVANCED_MODE_TYPE)

    return advancedMode === AdvancedModeType.ADVANCED ? this.advancedModeService : this.basicModeService
  }
}
