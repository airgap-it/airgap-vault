import { PermissionsService, PermissionTypes } from '@airgap/angular-core'
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { Platform } from '@ionic/angular'
import { auditTime } from 'rxjs/operators'

import { TouchEntropyComponent } from '../../components/touch-entropy/touch-entropy.component'
import { MnemonicSecret } from '../../models/secret'
import { AudioNativeService } from '../../services/audio/audio.native.servive'
import { CameraNativeService } from '../../services/camera/camera.native.service'
import { EntropyService } from '../../services/entropy/entropy.service'
import { getEntropyCollectionState } from '../../services/entropy/entropy-policy'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { GyroscopeNativeService } from '../../services/gyroscope/gyroscope.native.service'
import { NavigationService } from '../../services/navigation/navigation.service'

@Component({
  selector: 'airgap-secret-generate',
  templateUrl: './secret-generate.page.html',
  styleUrls: ['./secret-generate.page.scss']
})
export class SecretGeneratePage implements OnInit {
  public isBrowser: boolean = false

  @ViewChild('videoElement')
  public videoElement: ElementRef

  @ViewChild('touchEntropy', { static: true })
  public touchEntropy: TouchEntropyComponent

  public cameraEnabled: boolean = true
  public audioEnabled: boolean = true
  public gyroEnabled: boolean = true
  public entropySourceError: boolean = false

  private readonly ENTROPY_STARTUP_TIME: number = 5
  private startupTimeWaited: boolean = false

  public entropy: { isFull: boolean } = {
    isFull: false
  }

  private generatedSecret: MnemonicSecret | null = null

  constructor(
    public readonly gyroService: GyroscopeNativeService,
    public readonly entropyService: EntropyService,
    public readonly cameraService: CameraNativeService,
    public readonly audioService: AudioNativeService,
    private readonly navigationService: NavigationService,
    private readonly platform: Platform,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly permissionsService: PermissionsService
  ) {
    this.isBrowser = !this.platform.is('hybrid')
    if (!this.isBrowser) {
      this.cameraService.setTransparentElementsByTags('ion-toolbar', 'ion-content')
    }
    setTimeout(() => {
      this.startupTimeWaited = true
      this.checkEntropy()
    }, this.ENTROPY_STARTUP_TIME * 1000)
  }

  public checkEntropySourceStatus(): void {
    if (this.startupTimeWaited) {
      this.audioEnabled = this.audioService.getCollectedEntropyPercentage() !== 0
      this.cameraEnabled = this.cameraService.getCollectedEntropyPercentage() !== 0
      this.gyroEnabled = this.gyroService.getCollectedEntropyPercentage() !== 0
      // Touch will never be disabled
    }
  }

  public async ngOnInit(): Promise<void> {
    await this.platform.ready()

    if (this.isBrowser) {
      this.cameraService.setVideoElement(this.videoElement)
    }
    this.cameraService.viewWillEnter()

    await this.permissionsService.requestPermissions([PermissionTypes.CAMERA, PermissionTypes.MICROPHONE])

    this.initEntropy()
  }

  public initEntropy(): void {
    this.entropyService.addEntropySource(this.cameraService)
    this.entropyService.addEntropySource(this.audioService)
    this.entropyService.addEntropySource(this.gyroService)
    this.entropyService.addEntropySource(this.touchEntropy)
    this.entropyService
      .startEntropyCollection()
      .then(() => {
        this.entropyService
          .getEntropyUpdateObservable()
          .pipe(auditTime(200))
          .subscribe(() => {
            this.checkEntropy()
          })
      })
      .catch(handleErrorLocal(ErrorCategory.ENTROPY_COLLECTION))
  }

  public checkEntropy(): void {
    this.changeDetectorRef.detectChanges()
    this.checkEntropySourceStatus()

    if (!this.startupTimeWaited) {
      return
    }

    const collectionState = getEntropyCollectionState([
      { available: this.audioEnabled, percentage: this.audioService.getCollectedEntropyPercentage() },
      { available: this.cameraEnabled, percentage: this.cameraService.getCollectedEntropyPercentage() },
      { available: this.gyroEnabled, percentage: this.gyroService.getCollectedEntropyPercentage() }
    ])
    this.entropySourceError = collectionState.hasNoAvailableSources
    this.entropy.isFull = collectionState.isFull
  }

  public ionViewWillLeave(): void {
    this.cameraService.viewWillLeave()
  }

  public ionViewDidLeave(): void {
    this.entropyService.stopEntropyCollection().catch(handleErrorLocal(ErrorCategory.ENTROPY_COLLECTION))
  }

  public goToSecretRulesPage(): void {
    if (this.generatedSecret) {
      this.navigationService.routeWithState('secret-rules', { secret: this.generatedSecret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))

      return
    }

    this.entropyService
      .getEntropyAsHex()
      .then((hashHex: string) => {
        this.generatedSecret = new MnemonicSecret(hashHex)

        this.navigationService.routeWithState('secret-rules', { secret: this.generatedSecret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(handleErrorLocal(ErrorCategory.ENTROPY_COLLECTION))
  }
}
