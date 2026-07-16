import { rpc, TransactionBuilder, Networks, Contract, xdr, Address, nativeToScVal } from "@stellar/stellar-sdk";

export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const CONTRACT_ID = "CAZY3EOFD4KS6FGSDOCVCZC44QQBVKADAU6OJFENJRFARMVIDWWEWVJI"; // MediChain Main Contract (Fresh Deploy)

export const server = new rpc.Server(SOROBAN_RPC_URL);

/**
 * Prepares a transaction to invoke a Soroban smart contract.
 * @param sourceAddress The address of the user signing the transaction.
 * @param functionName The name of the contract function to call.
 * @param args The arguments to pass to the function as ScVals.
 */
export async function prepareContractTransaction(
  sourceAddress: string,
  functionName: string,
  args: xdr.ScVal[] = []
): Promise<string> {
  // Load the user's account to get the current sequence number
  const sourceAccount = await server.getAccount(sourceAddress);

  // Initialize the contract instance
  const contract = new Contract(CONTRACT_ID);

  // Build the basic transaction
  const txBuilder = new TransactionBuilder(sourceAccount, {
    fee: "100", // Basic fee, will be updated during simulation
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  // Add the contract invocation operation
  txBuilder.addOperation(contract.call(functionName, ...args));
  txBuilder.setTimeout(30);

  let tx = txBuilder.build();

  // Simulate the transaction to calculate the exact fee and footprint
  const simulation = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Transaction simulation failed: ${simulation.error}`);
  }

  // Assemble the fully prepared transaction with resources from the simulation
  const preparedTx = rpc.assembleTransaction(tx, simulation).build();
  
  // Return the transaction in XDR format so it can be signed by Freighter
  return preparedTx.toXDR();
}

/**
 * Helper to submit a signed transaction XDR to the Soroban RPC.
 */
export async function submitTransaction(signedTxXdr: string): Promise<rpc.Api.GetTransactionResponse> {
  const tx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
  let response = await server.sendTransaction(tx);
  
  if (response.status === "ERROR") {
    throw new Error(`Transaction submission failed: ${JSON.stringify(response)}`);
  }

  // Poll until the transaction is included in the ledger
  let txResponse = await server.getTransaction(response.hash);
  let retries = 0;
  while (txResponse.status === rpc.Api.GetTransactionStatus.NOT_FOUND && retries < 20) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    txResponse = await server.getTransaction(response.hash);
    retries++;
  }

  if (txResponse.status === rpc.Api.GetTransactionStatus.FAILED) {
    throw new Error(`Transaction failed on chain: ${JSON.stringify(txResponse.resultXdr)}`);
  }

  return txResponse;
}
