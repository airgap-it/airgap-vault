import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { async, ComponentFixture, TestBed } from '@angular/core/testing'
import { IACMessageType, Serializer } from '@airgap/coinlib-core'

import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { UnsignedTransactionComponent } from './unsigned-transaction.component'
import { MainProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { Message } from '@airgap/coinlib-core/serializer/message'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { SecureStorageServiceMock } from 'src/app/services/secure-storage/secure-storage.mock'
import { InteractionService } from 'src/app/services/interaction/interaction.service'
import { createAppSpy } from 'test-config/plugins-mocks'
import { APP_PLUGIN, DeeplinkService } from '@airgap/angular-core'

describe('UnsignedTransactionComponent', () => {
  let signedTransactionFixture: ComponentFixture<UnsignedTransactionComponent>
  let unsignedTransaction: UnsignedTransactionComponent

  let unitHelper: UnitHelper
  beforeEach(() => {
    const appSpy = createAppSpy()

    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [],
        providers: [
          { provide: SecureStorageService, useClass: SecureStorageServiceMock },
          SecretsService,
          InteractionService,
          DeeplinkService,
          { provide: APP_PLUGIN, useValue: appSpy }
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async () => {
    signedTransactionFixture = TestBed.createComponent(UnsignedTransactionComponent)
    unsignedTransaction = signedTransactionFixture.componentInstance
  })

  it('should be created', () => {
    expect(unsignedTransaction instanceof UnsignedTransactionComponent).toBe(true)
  })

  it('should load the from-to component if a valid tx is given', async(async () => {
    const serializer: Serializer = new Serializer()
    const serializedTxs = await serializer.serialize([
      new Message(
        IACMessageType.TransactionSignResponse,

        MainProtocolSymbols.ETH,
        {
          accountIdentifier: 'test',
          transaction:
            'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
        }
      )
    ])

    expect(unsignedTransaction.airGapTxs).toBe(undefined)
    expect(unsignedTransaction.fallbackActivated).toBe(false)

    const unsignedTxs = await serializer.deserialize(serializedTxs)
    unsignedTransaction.unsignedTxs = unsignedTxs
    await unsignedTransaction.ngOnChanges()
  }))

  it('should load fallback if something about the TX is wrong', async(async () => {
    /*
    const syncProtocol = new SyncProtocolUtils()
    const serializedTx = await syncProtocol.serialize({
      version: 1,
      protocol: 'eth',
      type: EncodedType.SIGNED_TRANSACTION,
      payload: {
        accountIdentifier: 'test',
        transaction:
          'asdasdasdasdsad944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
      }
    })

    expect(signedTransaction.airGapTxs).toBe(undefined)
    expect(signedTransaction.fallbackActivated).toBe(false)

    const signedTx = await syncProtocol.deserialize(serializedTx)

    signedTransaction.signedTx = signedTx
    await signedTransaction.ngOnChanges()

    expect(signedTransaction.airGapTxs).toBeUndefined()
    expect(signedTransaction.fallbackActivated).toBe(true)
    */
  }))
})
