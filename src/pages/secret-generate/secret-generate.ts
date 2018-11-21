import { ChangeDetectorRef, Component, ViewChild, RendererFactory2, Renderer2, ElementRef } from '@angular/core'
import { NavController, Platform } from 'ionic-angular'
import { SecretRulesPage } from '../secret-rules/secret-rules'
import { Secret } from '../../models/secret'
import { CameraNativeService } from '../../providers/camera/camera.native.service'
import { AudioNativeService } from '../../providers/audio/audio.native.service'
import { EntropyService } from '../../providers/entropy/entropy.service'
import { GyroscopeNativeService } from '../../providers/gyroscope/gyroscope.native.service'
import { TouchEntropyComponent } from '../../components/touch-entropy/touch-entropy'
import { PermissionsProvider, PermissionTypes } from '../../providers/permissions/permissions'

declare var window: any

@Component({
  selector: 'secret-generate',
  templateUrl: 'secret-generate.html'
})
export class SecretGeneratePage {
  public isBrowser = false

  private renderer: Renderer2

  @ViewChild('videoElement')
  videoElement: ElementRef

  @ViewChild('touchEntropy')
  touchEntropy: TouchEntropyComponent

  public cameraEnabled = true
  public audioEnabled = true
  public gyroEnabled = true
  public touchEnabled = true

  private ENTROPY_STARTUP_TIME = 5
  private startupTimeWaited = false

  entropy = {
    isFull: false
  }

  constructor(
    private navController: NavController,
    public gyroService: GyroscopeNativeService,
    public entropyService: EntropyService,
    public cameraService: CameraNativeService,
    public audioService: AudioNativeService,
    private platform: Platform,
    private changeDetectorRef: ChangeDetectorRef,
    private permissionsProvider: PermissionsProvider,
    private rendererFactory: RendererFactory2
  ) {
    this.isBrowser = !this.platform.is('cordova')
    this.renderer = this.rendererFactory.createRenderer(null, null)
    setTimeout(() => {
      this.startupTimeWaited = true
      this.checkEntropySourceStatus()
    }, this.ENTROPY_STARTUP_TIME * 1000)
  }

  checkEntropySourceStatus() {
    if (this.startupTimeWaited) {
      this.audioEnabled = this.audioService.getCollectedEntropyPercentage() !== 0
      this.cameraEnabled = this.cameraService.getCollectedEntropyPercentage() !== 0
      this.gyroEnabled = this.gyroService.getCollectedEntropyPercentage() !== 0
      // Touch will not be disabled
    }
  }

  async ionViewWillEnter() {
    await this.platform.ready()

    if (this.isBrowser) {
      this.cameraService.setVideoElement(this.videoElement)
    }
    this.cameraService.viewWillEnter()
    this.injectCSS()

    await this.permissionsProvider.requestPermissions([PermissionTypes.CAMERA, PermissionTypes.MICROPHONE])

    this.initEntropy()
  }

  private injectCSS() {
    // inject css to html, body, .ion-app, ion-content
    this.renderer.addClass(document.body, 'hide-tabbar')
  }

  private uninjectCSS() {
    // removes injected css
    this.renderer.removeClass(document.body, 'hide-tabbar')
  }

  initEntropy() {
    this.entropyService.addEntropySource(this.cameraService)
    this.entropyService.addEntropySource(this.audioService)
    this.entropyService.addEntropySource(this.gyroService)
    this.entropyService.addEntropySource(this.touchEntropy)
    this.entropyService.startEntropyCollection().then(() => {
      this.entropyService
        .getEntropyUpdateObservable()
        .auditTime(200)
        .subscribe(() => {
          this.checkEntropy()
        })
    })
  }

  checkEntropy() {
    this.changeDetectorRef.detectChanges()
    this.checkEntropySourceStatus()

    const enabledSources = [this.audioEnabled, this.cameraEnabled, this.gyroEnabled, this.touchEnabled]
    const percentageNeeded = enabledSources.reduce((a, b) => a + (b ? 100 : 0), 0)

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

  ionViewDidLeave() {
    this.cameraService.viewDidLeave()
    this.uninjectCSS()
    this.entropyService.stopEntropyCollection()
  }

  goToSecretRulesPage() {
    this.entropyService.getEntropyAsHex().then(hashHex => {
      let secret = new Secret(hashHex)
      this.navController.push(SecretRulesPage, { secret: secret })
    })
  }
}
