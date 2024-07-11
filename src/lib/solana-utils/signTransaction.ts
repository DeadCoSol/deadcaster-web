import {Transaction, VersionedTransaction} from '@solana/web3.js';

import {PhantomProvider} from './types';

/**
 * Signs a transaction
 * @param   {PhantomProvider} provider    a Phantom Provider
 * @param   {Transaction | VersionedTransaction}     transaction a transaction to sign
 * @returns {Transaction | VersionedTransaction}                 a signed transaction
 */
const signTransaction = async (
  provider: PhantomProvider,
  transaction: Transaction | VersionedTransaction
): Promise<Transaction | VersionedTransaction> => {
  try {
    return await provider.signTransaction(transaction);
  } catch (error) {
    console.warn(error);
    // @ts-ignore
    throw new Error(error.message);
  }
};

export default signTransaction;
