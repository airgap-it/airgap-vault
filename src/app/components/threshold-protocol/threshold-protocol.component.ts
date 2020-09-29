import { UiEventService } from '@airgap/angular-core'
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { CosmosMessageTypeIndex } from 'airgap-coin-lib/dist/protocols/cosmos/cosmos-message/CosmosMessage'
import { SubstrateTransactionType } from 'airgap-coin-lib/dist/protocols/substrate/helpers/data/transaction/SubstrateTransaction'
import { TezosOperationType } from 'airgap-coin-lib/dist/protocols/tezos/types/TezosOperationType'
import { MainProtocolSymbols } from 'airgap-coin-lib/dist/utils/ProtocolSymbols'
import { PeerService } from 'src/app/services/peer/peer.service'
import { ProtocolThresholds, ThresholdService } from 'src/app/services/threshold/threshold.service'

@Component({
  selector: 'airgap-threshold-protocol',
  templateUrl: './threshold-protocol.component.html',
  styleUrls: ['./threshold-protocol.component.scss']
})
export class ThresholdProtocolComponent implements OnInit {
  public protocolTypes: typeof MainProtocolSymbols = MainProtocolSymbols
  public protocols: string[] = Object.values(MainProtocolSymbols)

  @Input() public protocolThresholds: ProtocolThresholds

  @Output() public readonly valueChanged: EventEmitter<void> = new EventEmitter()

  constructor(
    private readonly thresholdService: ThresholdService,
    private readonly peerService: PeerService,
    private readonly uiEventService: UiEventService
  ) {}

  ngOnInit() {}

  public async elementClicked(protocol: string, property: string, type: 'number' | 'stringArray' | 'enum'): Promise<void> {
    if (type === 'number') {
      this.showNumberAlert(protocol, property)
    } else if (type === 'stringArray') {
      this.showStringArrayAlert(protocol, property)
    } else if (type === 'enum') {
      this.showEnumAlert(protocol, property)
    }
  }

  public async setToggle(protocol: string, property: string, event: CustomEvent): Promise<void> {
    const value: boolean = event.detail.checked
    await this.save(protocol, property, value)
  }

  public async save(protocol: string, property: string, value: any): Promise<void> {
    const key: string = `protocol.${protocol}.${property}`
    const sig: {
      signature: string
      publicKey: string
    } = await this.peerService.sign([key, value].join(':'))

    await this.thresholdService.setThreshold(key, value, sig.publicKey, sig.signature)
    this.valueChanged.emit()
  }

  private showNumberAlert(protocol: string, property: string) {
    this.uiEventService
      .showTranslatedAlert({
        header: 'header',
        subHeader: 'subHeader',
        message: 'message',
        inputs: [
          {
            name: 'value',
            type: 'text',
            placeholder: 'Value'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Reset',
            handler: async (): Promise<void> => {
              await this.save(protocol, property, null)
            }
          },
          {
            text: 'Save',
            handler: async (result: any): Promise<void> => {
              const value = result.value ?? null
              const floatValue = parseFloat(value)
              if (!isNaN(floatValue)) {
                await this.save(protocol, property, floatValue)
              }
            }
          }
        ]
      })
      .catch(console.error)
  }

  private showStringArrayAlert(protocol: string, property: string) {
    this.uiEventService
      .showTranslatedAlert({
        header: 'header',
        subHeader: 'subHeader',
        message: 'message',
        inputs: [
          {
            name: 'value',
            type: 'text',
            placeholder: 'Value'
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Reset',
            handler: async (): Promise<void> => {
              await this.save(protocol, property, null)
            }
          },
          {
            text: 'Save',
            handler: async (result: any): Promise<void> => {
              const value = result.value ? result.value.split(',') : null
              await this.save(protocol, property, value)
            }
          }
        ]
      })
      .catch(console.error)
  }
  private showEnumAlert(protocol: string, property: string) {
    const keyValue: [string, any][] =
      protocol === MainProtocolSymbols.XTZ
        ? Object.entries(TezosOperationType)
        : protocol === MainProtocolSymbols.COSMOS
        ? Object.entries(CosmosMessageTypeIndex).filter((x: [string, any]) => isNaN(parseInt(x[0], 10)))
        : protocol === MainProtocolSymbols.KUSAMA || protocol === MainProtocolSymbols.POLKADOT
        ? Object.entries(SubstrateTransactionType).filter((x: [string, any]) => isNaN(parseInt(x[0], 10)))
        : []

    this.uiEventService
      .showTranslatedAlert({
        header: 'header',
        subHeader: 'subHeader',
        message: 'message',
        inputs: keyValue.map((kv) => ({
          name: kv[0],
          type: 'checkbox',
          label: kv[0],
          value: kv[1],
          checked: false
        })),
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel'
          },
          {
            text: 'Reset',
            handler: async (): Promise<void> => {
              await this.save(protocol, property, null)
            }
          },
          {
            text: 'Save',
            handler: async (result: string[]): Promise<void> => {
              await this.save(protocol, property, result)
            }
          }
        ]
      })
      .catch(console.error)
  }
}
