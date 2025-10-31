// Basic types redefined to avoid importing @metamask/utils due to Buffer dependency
import type { MultichainCore } from '@metamask/connect-multichain';

import type { EIP1193Provider } from './provider';

export type Hex = `0x${string}`;
export type Address = Hex;
export type CaipAccountId = `${string}:${string}:${string}`;

export type MinimalEventEmitter = Pick<EIP1193Provider, 'on' | 'off' | 'emit'>;

export type EIP1193ProviderEvents = {
  connect: [{ chainId?: Hex }];
  disconnect: [];
  accountsChanged: [Address[]];
  chainChanged: [Hex];
};

export type EventHandlers = {
  connect: (result: { chainId?: Hex }) => void;
  disconnect: () => void;
  accountsChanged: (accounts: Address[]) => void;
  chainChanged: (chainId: Hex) => void;
};

export type MetamaskConnectEVMOptions = {
  core: MultichainCore;
  eventHandlers?: EventHandlers;
  notificationQueue?: unknown[];
};

export type AddEthereumChainParameter = {
  chainId?: string;
  chainName?: string;
  nativeCurrency?: {
    name?: string;
    symbol?: string;
    decimals?: number;
  };
  rpcUrls?: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
};

// Specific provider request types
type ConnectRequest = {
  method: 'wallet_requestPermissions' | 'eth_requestAccounts';
  params: [chainId?: number, account?: string];
};

type RevokePermissionsRequest = {
  method: 'wallet_revokePermissions';
  params: unknown[];
};

type SwitchEthereumChainRequest = {
  method: 'wallet_switchEthereumChain';
  params: [{ chainId: string }];
};

type AddEthereumChainRequest = {
  method: 'wallet_addEthereumChain';
  params: [AddEthereumChainParameter];
};

type GenericProviderRequest = {
  method: Exclude<
    string,
    | 'wallet_requestPermissions'
    | 'eth_requestAccounts'
    | 'eth_accounts'
    | 'eth_coinbase'
    | 'wallet_revokePermissions'
    | 'wallet_switchEthereumChain'
    | 'wallet_addEthereumChain'
  >;
  params: unknown;
};

// Discriminated union for provider requests
export type ProviderRequest =
  | ConnectRequest
  | RevokePermissionsRequest
  | SwitchEthereumChainRequest
  | AddEthereumChainRequest
  | GenericProviderRequest;

export type ProviderRequestInterceptor = (
  req: ProviderRequest,
) => Promise<unknown>;
