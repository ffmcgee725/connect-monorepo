import type { ProviderRequest } from '../types';

/**
 * Type guard for connect-like requests:
 * - wallet_requestPermissions
 * - eth_requestAccounts
 *
 * @param req - The request object to check
 * @returns True if the request is a connect-like request, false otherwise
 */
export function isConnectRequest(req: ProviderRequest): req is Extract<
  ProviderRequest,
  {
    method: 'wallet_requestPermissions' | 'eth_requestAccounts';
  }
> {
  return (
    req.method === 'wallet_requestPermissions' ||
    req.method === 'eth_requestAccounts'
  );
}

/**
 * Type guard for wallet_switchEthereumChain request.
 *
 * @param req - The request object to check
 * @returns True if the request is a wallet_switchEthereumChain request, false otherwise
 */
export function isSwitchChainRequest(
  req: ProviderRequest,
): req is Extract<ProviderRequest, { method: 'wallet_switchEthereumChain' }> {
  return req.method === 'wallet_switchEthereumChain';
}

/**
 * Type guard for wallet_addEthereumChain request.
 *
 * @param req - The request object to check
 * @returns True if the request is a wallet_addEthereumChain request, false otherwise
 */
export function isAddChainRequest(
  req: ProviderRequest,
): req is Extract<ProviderRequest, { method: 'wallet_addEthereumChain' }> {
  return req.method === 'wallet_addEthereumChain';
}

/**
 * Type guard for generic accounts request:
 * - eth_accounts
 * - eth_coinbase
 *
 * @param req - The request object to check
 * @returns True if the request is a generic accounts request, false otherwise
 */
export function isAccountsRequest(
  req: ProviderRequest,
): req is Extract<
  ProviderRequest,
  { method: 'eth_accounts' | 'eth_coinbase' }
> {
  return req.method === 'eth_accounts' || req.method === 'eth_coinbase';
}
