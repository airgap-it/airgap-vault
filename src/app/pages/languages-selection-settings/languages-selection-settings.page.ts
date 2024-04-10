import { Component, OnInit } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { LanguagesType, VaultStorageKey, VaultStorageService } from 'src/app/services/storage/storage.service'

import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-languages-selection-settings',
  templateUrl: './languages-selection-settings.page.html',
  styleUrls: ['./languages-selection-settings.page.scss']
})
export class LanguagesSelectionSettingsPage implements OnInit {
  public languageType: typeof LanguagesType = LanguagesType
  public initialType: LanguagesType | undefined
  public selectedType: LanguagesType | undefined
  public isEdit: boolean = false

  public get languages(): string[] {
    return Object.values(LanguagesType)
  }

  constructor(
    private readonly translateService: TranslateService,
    private readonly navigationService: NavigationService,
    private readonly storageService: VaultStorageService
  ) {}

  public async ngOnInit(): Promise<void> {
    const currentLanguage = await this.getCurrentLanguage()
    this.changeLanguage(currentLanguage)
  }

  public async getCurrentLanguage(): Promise<LanguagesType> {
    const savedLanguage = await this.storageService.get(VaultStorageKey.LANGUAGE_TYPE)
    const deviceLanguage = this.translateService.getBrowserLang()

    return savedLanguage || (deviceLanguage as LanguagesType) || LanguagesType.EN
  }

  public async defaultToDevice() {
    const deviceLanguage = this.translateService.getBrowserLang() as LanguagesType
    this.changeLanguage(deviceLanguage)
  }

  public async changeLanguage(language: LanguagesType): Promise<void> {
    await this.translateService.use(language).toPromise()
    this.selectedType = language
  }

  public goToNextPage(): void {
    if (this.selectedType) {
      this.storageService.set(VaultStorageKey.LANGUAGE_TYPE, this.selectedType)
    }
    this.navigationService.back()
  }
}
