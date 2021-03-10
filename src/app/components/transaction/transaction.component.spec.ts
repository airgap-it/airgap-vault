import { SecretsService } from 'src/app/services/secrets/secrets.service'
import { ComponentFixture, TestBed } from '@angular/core/testing'

import { UnitHelper } from '../../../../test-config/unit-test-helper'

import { TransactionComponent } from './transaction.component'
import { SecureStorageService } from 'src/app/services/secure-storage/secure-storage.service'
import { SecureStorageServiceMock } from 'src/app/services/secure-storage/secure-storage.mock'
import { InteractionService } from 'src/app/services/interaction/interaction.service'
import { createAppSpy } from 'test-config/plugins-mocks'
import { APP_PLUGIN, DeeplinkService } from '@airgap/angular-core'

describe('UnsignedTransactionComponent', () => {
  let signedTransactionFixture: ComponentFixture<TransactionComponent>
  let unsignedTransaction: TransactionComponent

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
    signedTransactionFixture = TestBed.createComponent(TransactionComponent)
    unsignedTransaction = signedTransactionFixture.componentInstance
  })

  it('should be created', () => {
    expect(unsignedTransaction instanceof TransactionComponent).toBe(true)
  })
})
