import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'

import { UnitHelper } from '../../../../test-config/unit-test-helper'
import { SignedTransactionComponent } from './signed-transaction.component'
import { MainProtocolSymbols } from '@airgap/coinlib-core/utils/ProtocolSymbols'
import { IACMessageType, Message, Serializer } from '@airgap/serializer'
import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { SecureStorageServiceMock } from 'src/app/services/secure-storage/secure-storage.mock'
import { ISOLATED_PROTOCOL_PLUGIN, WebIsolatedProtocol } from '@airgap/angular-core'

describe('SignedTransactionComponent', () => {
  let signedTransactionFixture: ComponentFixture<SignedTransactionComponent>
  let signedTransaction: SignedTransactionComponent

  let unitHelper: UnitHelper
  beforeEach(() => {
    unitHelper = new UnitHelper()
    TestBed.configureTestingModule(
      unitHelper.testBed({
        declarations: [],
        providers: [
          { provide: SecureStorageService, useClass: SecureStorageServiceMock },
          { provide: ISOLATED_PROTOCOL_PLUGIN, useValue: new WebIsolatedProtocol() },
          SecretsService
        ]
      })
    )
      .compileComponents()
      .catch(console.error)
  })

  beforeEach(async () => {
    signedTransactionFixture = TestBed.createComponent(SignedTransactionComponent)
    signedTransaction = signedTransactionFixture.componentInstance
  })

  it('should be created', () => {
    expect(signedTransaction instanceof SignedTransactionComponent).toBe(true)
  })

  it(
    'should load the from-to component if a valid tx is given',
    waitForAsync(async () => {
      const serializer: Serializer = new Serializer()
      const serializedTxs = await serializer.serialize([
        new Message(IACMessageType.TransactionSignResponse, MainProtocolSymbols.ETH, {
          accountIdentifier: 'test',
          transaction:
            'f86c808504a817c800825208944a1e1d37462a422873bfccb1e705b05cc4bd922e880de0b6b3a76400008026a00678aaa8f8fd478952bf46044589f5489e809c5ae5717dfe6893490b1f98b441a06a82b82dad7c3232968ec3aa2bba32879b3ecdb877934915d7e65e095fe53d5d'
        })
      ])

      expect(signedTransaction.airGapTxs).toBe(undefined)
      expect(signedTransaction.fallbackActivated).toBe(false)

      const signedTxs = await serializer.deserialize(serializedTxs)
      signedTransaction.signedTxs = signedTxs as any
      await signedTransaction.ngOnChanges()

      expect(signedTransaction.airGapTxs).toBeDefined()
      expect(signedTransaction.fallbackActivated).toBe(false)
    })
  )

  it(
    'should load fallback if something about the TX is wrong',
    waitForAsync(async () => {
      /*
    const syncProtocol = new SyncProtocolUtils()
    const serializedTx = await syncProtocol.serialize({
      version: 1,
      protocol: MainProtocolSymbols.ETH,
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
    })
  )
})
