import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core'
import { Platform } from '@ionic/angular'
import { auditTime } from 'rxjs/operators'

import { TouchEntropyComponent } from '../../components/touch-entropy/touch-entropy.component'
import { Secret } from '../../models/secret'
import { AudioNativeService } from '../../services/audio/audio.native.servive'
import { CameraNativeService } from '../../services/camera/camera.native.service'
import { EntropyService } from '../../services/entropy/entropy.service'
import { ErrorCategory, handleErrorLocal } from '../../services/error-handler/error-handler.service'
import { GyroscopeNativeService } from '../../services/gyroscope/gyroscope.native.service'
import { NavigationService } from '../../services/navigation/navigation.service'
import { PermissionsService, PermissionTypes } from '../../services/permissions/permissions.service'

@Component({
  selector: 'airgap-secret-generate',
  templateUrl: './secret-generate.page.html',
  styleUrls: ['./secret-generate.page.scss']
})
export class SecretGeneratePage implements OnInit {
  public isBrowser: boolean = false

  @ViewChild('videoElement', { static: false })
  public videoElement: ElementRef

  @ViewChild('touchEntropy', { static: true })
  public touchEntropy: TouchEntropyComponent

  public cameraEnabled: boolean = false
  public audioEnabled: boolean = true
  public gyroEnabled: boolean = true
  public touchEnabled: boolean = true

  private readonly ENTROPY_STARTUP_TIME: number = 5
  private startupTimeWaited: boolean = false

  public entropy: { isFull: boolean } = {
    isFull: false
  }

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
    this.isBrowser = !this.platform.is('cordova')
    setTimeout(() => {
      this.startupTimeWaited = true
      this.checkEntropySourceStatus()
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

    const enabledSources: boolean[] = [this.audioEnabled, this.cameraEnabled, this.gyroEnabled, this.touchEnabled]
    const percentageNeeded: number = enabledSources.reduce((previous: number, isEnabled: boolean) => previous + (isEnabled ? 100 : 0), 0)

    if (
      Math.min(100, this.audioService.getCollectedEntropyPercentage()) +
        Math.min(100, this.cameraService.getCollectedEntropyPercentage()) +
        Math.min(100, this.gyroService.getCollectedEntropyPercentage()) +
        Math.min(100, this.touchEntropy.getCollectedEntropyPercentage()) >=
      percentageNeeded
    ) {
      this.entropy.isFull = true
    }
  }

  public ionViewDidLeave(): void {
    this.cameraService.viewDidLeave()
    this.entropyService.stopEntropyCollection().catch(handleErrorLocal(ErrorCategory.ENTROPY_COLLECTION))
  }

  public goToSecretRulesPage(): void {
    this.entropyService
      .getEntropyAsHex()
      .then((hashHex: string) => {
        const secret: Secret = new Secret(hashHex)

        this.navigationService.routeWithState('secret-rules', { secret }).catch(handleErrorLocal(ErrorCategory.IONIC_NAVIGATION))
      })
      .catch(handleErrorLocal(ErrorCategory.ENTROPY_COLLECTION))
  }
}
