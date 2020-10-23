import { AirGapWallet, IACMessageDefinitionObject } from 'airgap-coin-lib';

export interface SignTransactionInfo {
    wallet: AirGapWallet
    signTransactionRequest: IACMessageDefinitionObject 
}
