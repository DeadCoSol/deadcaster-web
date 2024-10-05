import {Transaction, VersionedTransaction} from '@solana/web3.js';

import {PhantomProvider} from './types';

/**
 * Signs an array of transactions
 * @param   {PhantomProvider} provider     a Phantom provider
 * @param   {Transaction | VersionedTransaction}     transaction1 a transaction to sign
 * @param   {Transaction | VersionedTransaction}     transaction2 a transaction to sign
 * @returns {(Transaction | VersionedTransaction)[]}                an array of signed transactions
 */
const signAllTransactions = async (
  provider: PhantomProvider,
  transaction1: Transaction | VersionedTransaction,
  transaction2: Transaction | VersionedTransaction
): Promise<(Transaction | VersionedTransaction)[]> => {
  try {
    return await provider.signAllTransactions([transaction1, transaction2]);
  } catch (error) {
    console.warn(error);
    // @ts-ignore
    throw new Error(error.message);
  }
};

export default signAllTransactions;
