import type { MultichainCore } from '@metamask/connect-multichain';
import { EventEmitter } from '@metamask/connect-multichain';
import { hexToNumber, numberToHex } from '@metamask/utils';

import { INTERCEPTABLE_METHODS } from './constants';
import { logger } from './logger';
import type {
  Address,
  EIP1193ProviderEvents,
  Hex,
  ProviderRequest,
  ProviderRequestInterceptor,
} from './types';

/**
 * EIP-1193 Provider wrapper around the Multichain SDK.
 */
export class EIP1193Provider extends EventEmitter<EIP1193ProviderEvents> {
  /** The core instance of the Multichain SDK */
  readonly #core: MultichainCore;

  /** Interceptor function to handle specific methods */
  readonly #requestInterceptor: ProviderRequestInterceptor;

  /** The currently permitted accounts */
  #accounts: Address[] = [];

  /** The currently selected chain ID on the wallet */
  #selectedChainId?: Hex | undefined;

  constructor(core: MultichainCore, interceptor: ProviderRequestInterceptor) {
    super();
    this.#core = core;
    this.#requestInterceptor = interceptor;
  }

  /**
   * Performs a EIP-1193 request.
   *
   * @param request - The request object containing the method and params
   * @returns The result of the request
   */
  async request(request: ProviderRequest): Promise<unknown> {
    logger(
      `request: ${request.method} - chainId: ${this.selectedChainId}`,
      request.params,
    );
    /* Some methods require special handling, so we intercept them here
     * and handle them in MetamaskConnectEVM.requestInterceptor method.  */
    if (INTERCEPTABLE_METHODS.includes(request.method)) {
      return this.#requestInterceptor?.(request);
    }

    if (!this.#selectedChainId) {
      // TODO: replace with a better error
      throw new Error('No chain ID selected');
    }

    const chainId = hexToNumber(this.#selectedChainId);

    return this.#core.invokeMethod({
      scope: `eip155:${chainId}`,
      request: {
        method: request.method,
        params: request.params,
      },
    });
  }

  // Getters and setters
  public get selectedAccount(): Promise<Address | undefined> {
    return this.#core.storage.adapter.get('accounts').then((accounts) => {
      console.log('accounts in selectedAccount', accounts);
      if (!accounts) {
        return undefined;
      }
      const parsedAccounts = JSON.parse(accounts) as Address[];
      return parsedAccounts?.[0];
    }).catch((error) => {
      console.error('error in selectedAccount', error);
      return undefined;
    });
  }

  public set accounts(accounts: Address[]) {
    this.#core.storage.adapter.set('accounts', JSON.stringify(accounts));
    this.#accounts = accounts;
  }

  public get accounts(): Promise<Address[] | undefined> {
    return this.#core.storage.adapter.get('accounts').then((accounts) => {
      console.log('accounts in selectedAccount', accounts);
      if (!accounts) {
        return undefined;
      }
      const parsedAccounts = JSON.parse(accounts) as Address[];
      return parsedAccounts;
    }).catch((error) => {
      console.error('error in selectedAccount', error);
      return undefined;
    });
  }

  public get selectedChainId(): Promise<Hex | undefined> {
    const selectedChainId = this.#core.storage.adapter.get('selectedChainId');
    return Promise.resolve(
      selectedChainId ? (selectedChainId as unknown as Hex) : undefined,
    );
  }

  public set selectedChainId(chainId: Hex | number | undefined) {
    const hexChainId =
      chainId && typeof chainId === 'number' ? numberToHex(chainId) : chainId;

    // Don't overwrite the selected chain ID with an undefined value
    if (!hexChainId || typeof hexChainId !== 'string') {
      return;
    }
    this.#core.storage.adapter.set('selectedChainId', hexChainId);
    this.#selectedChainId = hexChainId as Hex;
  }
}
