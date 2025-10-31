import type { InternalScopesObject } from '@metamask/chain-agnostic-permission';
import {
  getPermittedEthChainIds as _getPermittedEthChainIds,
  getEthAccounts as _getEthAccounts,
} from '@metamask/chain-agnostic-permission';
import type { SessionData } from '@metamask/connect-multichain';

import type { Address, Hex } from '../types';

/**
 * Get the Ethereum accounts from the session data
 *
 * @param sessionScopes - The session scopes
 * @returns The Ethereum accounts
 */
export const getEthAccounts = (
  sessionScopes: SessionData['sessionScopes'] | undefined,
): Address[] => {
  if (!sessionScopes) {
    return [];
  }

  return _getEthAccounts({
    requiredScopes: sessionScopes as InternalScopesObject,
    optionalScopes: sessionScopes as InternalScopesObject,
  });
};

/**
 * Get the permitted Ethereum chain IDs from the session scopes.
 * Wrapper around getPermittedEthChainIds from @metamask/chain-agnostic-permission
 *
 * @param sessionScopes - The session scopes
 * @returns The permitted Ethereum chain IDs
 */
export const getPermittedEthChainIds = (
  sessionScopes: SessionData['sessionScopes'] | undefined,
): Hex[] => {
  if (!sessionScopes) {
    return [];
  }

  return _getPermittedEthChainIds({
    requiredScopes: sessionScopes as InternalScopesObject,
    optionalScopes: sessionScopes as InternalScopesObject,
  });
};
