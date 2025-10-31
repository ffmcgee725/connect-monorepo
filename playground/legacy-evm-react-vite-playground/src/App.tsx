import { useEffect, useState } from 'react';
import {
  MetamaskConnectEVM,
  createMetamaskConnectEVM,
} from '@metamask/connect-evm';
import './App.css';
import { send_eth_signTypedData_v4, send_personal_sign } from './SignHelpers';
import type { EIP1193Provider } from '@metamask/connect-evm';

function useSDK() {
  const [sdk, setSDK] = useState<MetamaskConnectEVM>();
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [provider, setProvider] = useState<EIP1193Provider>();
  const [chainId, setChainId] = useState<string>();
  const [account, setAccount] = useState<string>();
  const [balance, setBalance] = useState<string>();

  useEffect(() => {
    const setupSDK = async () => {
      const clientSDK = await createMetamaskConnectEVM({
        dapp: {
          name: 'NEXTJS demo',
          url: 'https://localhost:3000',
        },
      });
      const provider = await clientSDK.getProvider();

      setChainId(await clientSDK.getChainId());
      setAccount(await clientSDK.getAccount());

      if (provider) {
        provider.on('connect', () => {
          setConnected(true);
        });

        provider.on('disconnect', () => {
          setConnected(false);
        });

        provider.on('chainChanged', (chainId: string) => {
          setChainId(chainId);
        });

        provider.on('accountsChanged', (accounts: string[]) => {
          setAccount(accounts[0]);
        });

        setSDK(clientSDK);
        setProvider(provider);
      }
    };

    if (!sdk) {
      setupSDK();
    }
  }, [sdk]);

  return { sdk, connected, connecting, provider, chainId, account, balance };
}

export const App = () => {
  const [response, setResponse] = useState<unknown>('');
  const { sdk, connected, connecting, provider, chainId, account, balance } =
    useSDK();

  // TODO: Do we need language support?
  // const languages = sdk?.availableLanguages ?? ['en'];

  // const [currentLanguage, setCurrentLanguage] = useState(
  //   localStorage.getItem('MetaMaskSDKLng') || 'en',
  // );

  // const changeLanguage = async (currentLanguage: string) => {
  //   localStorage.setItem('MetaMaskSDKLng', currentLanguage);
  //   window.location.reload();
  // };

  // const handleLanguageChange = (
  //   event: React.ChangeEvent<HTMLSelectElement>,
  // ) => {
  //   setCurrentLanguage(event.target.value);

  //   changeLanguage(event.target.value).then(() => {
  //     console.debug(`language changed to ${event.target.value}`);
  //   });
  // };

  const connectAndSign = async () => {
    try {
      const signResult = await sdk?.connectAndSign({
        msg: 'Connect + Sign message',
      });
      setResponse(signResult);
    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  };

  const connect = async () => {
    try {
      const response = await sdk?.connect();
      console.log('connect response', response);
    } catch (err) {
      console.warn(`failed to connect..`, err);
    }
  };

  const readOnlyCalls = async () => {
    // if (!sdk?.hasReadOnlyRPCCalls() && !provider) {
    //   setResponse(
    //     'readOnlyCalls are not set and provider is not set. Please set your infuraAPIKey in the SDK Options',
    //   );
    //   return;
    // }
    // try {
    //   const result = await provider?.request({
    //     method: 'eth_blockNumber',
    //     params: [],
    //   });
    //   const gotFrom = sdk?.hasReadOnlyRPCCalls()
    //     ? 'infura'
    //     : 'MetaMask provider';
    //   setResponse(`(${gotFrom}) ${result}`);
    // } catch (e) {
    //   console.log(`error getting the blockNumber`, e);
    //   setResponse('error getting the blockNumber');
    // }
  };

  const addEthereumChain = () => {
    if (!provider) {
      throw new Error(`invalid ethereum provider`);
    }

    provider
      .request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x89',
            chainName: 'Polygon',
            blockExplorerUrls: ['https://polygonscan.com'],
            nativeCurrency: { symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com/'],
          },
        ],
      })
      .then((res) => console.log('add', res))
      .catch((e) => console.log('ADD ERR', e));
  };

  const sendTransaction = async () => {
    const to = '0x0000000000000000000000000000000000000000';
    const transactionParameters = {
      to, // Required except during contract publications.
      from: await sdk?.getAccount(), // must match user's active address.
      value: '0x5AF3107A4000', // Only required to send ether to the recipient from the initiating external account.
    };
    console.log('transactionParameters', transactionParameters);

    try {
      // txHash is a hex string
      // As with any RPC call, it may throw an error
      const txHash = (await provider?.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      })) as string;

      setResponse(txHash);
    } catch (e) {
      console.log(e);
    }
  };

  const eth_signTypedData_v4 = async () => {
    if (!provider) {
      setResponse(`invalid ethereum provider`);
      return;
    }
    const result = await send_eth_signTypedData_v4(
      provider,
      await sdk?.getChainId() ?? '',
    );
    setResponse(result);
  };

  const eth_personal_sign = async () => {
    if (!provider) {
      setResponse(`invalid ethereum provider`);
      return;
    }
    const result = await send_personal_sign(provider);
    setResponse(result);
  };

  const terminate = () => {
    sdk?.terminate();
  };

  const changeNetwork = async (hexChainId: string) => {
    console.debug(`switching to network chainId=${hexChainId}`);
    try {
      const response = await provider?.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexChainId }], // chainId must be in hexadecimal numbers
      });
      console.debug(`response`, response);
    } catch (err) {
      console.error(err);
    }
  };

  const eth_accounts = async () => {
    if (!provider) {
      setResponse(`invalid ethereum provider`);
      return;
    }
    const response = await provider?.request({
      method: 'eth_accounts',
      params: [],
    });
    console.log('eth_accounts response', response);
  };

  return (
    <div className="App">
      <h1>Vite React MMSDK Example</h1>
      <div className={'Info-Status'}>
        <p>{`Connected chain: ${chainId}`}</p>
        <p>{`Connected account: ${account}`}</p>
        <p>{`Account balance: ${balance}`}</p>
        <p>{`Last request response: ${response}`}</p>
        <p>{`Connected: ${connected}`}</p>
      </div>

      <div className="sdkConfig">
        {connecting && (
          <div>Waiting for Metamask to link the connection...</div>
        )}
      </div>
      {/* <div className="language-dropdown">
        <label htmlFor="language-select">Language: </label>
        <select
          id="language-select"
          value={currentLanguage}
          onChange={handleLanguageChange}
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div> */}

      {connected ? (
        <div>
          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={eth_accounts}
          >
            eth_accounts
          </button>

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={eth_signTypedData_v4}
          >
            eth_signTypedData_v4
          </button>

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={eth_personal_sign}
          >
            personal_sign
          </button>

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={sendTransaction}
          >
            Send transaction
          </button>

          {chainId === '1' ? (
            <button
              className={'Button-Normal'}
              style={{ padding: 10, margin: 10 }}
              onClick={() => changeNetwork('0x5')}
            >
              Switch to Goerli
            </button>
          ) : (
            <button
              className={'Button-Normal'}
              style={{ padding: 10, margin: 10 }}
              onClick={() => changeNetwork('0x1')}
            >
              Switch to Mainnet
            </button>
          )}

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={() => changeNetwork('0x89')}
          >
            Switch to Polygon
          </button>

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={addEthereumChain}
          >
            Add Polygon Chain
          </button>

          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={readOnlyCalls}
          >
            readOnlyCalls
          </button>
        </div>
      ) : (
        <div>
          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={connect}
          >
            Connect
          </button>
          <button
            className={'Button-Normal'}
            style={{ padding: 10, margin: 10 }}
            onClick={connectAndSign}
          >
            Connect w/ Sign
          </button>
        </div>
      )}

      <button
        className={'Button-Danger'}
        style={{ padding: 10, margin: 10 }}
        onClick={terminate}
      >
        Terminate
      </button>
    </div>
  );
};

export default App;
