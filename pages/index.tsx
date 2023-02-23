import { Widget } from '@kyberswap/widgets';
import { Theme } from '@kyberswap/widgets/dist/theme';
import isEqual from 'lodash/isEqualWith';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import {
  useAccount,
  useConnect,
  useDisconnect,
  useEnsAvatar,
  useEnsName,
} from 'wagmi';

import { defaultTokenOut } from '@/constant/kyberswap';
import {
  widgetDarkTheme,
  widgetLightTheme,
} from '@/constant/style/kyberswap-widget';
import { useAsyncValue } from '@/hooks/base/useAsyncValue';

const Home: NextPage = () => {
  const { address, connector, isConnected } = useAccount();
  const { data: ensAvatar } = useEnsAvatar({ address });
  const { data: ensName } = useEnsName({ address });
  const { value: provider } = useAsyncValue(async () => {
    const provider = await connector?.getProvider();

    return provider;
  });

  const [chainId, setChainId] = useState(1);

  useEffect(() => {
    provider?.getNetwork().then((res: any) => {
      return setChainId(res.chainId);
    });
  }, [provider]);

  const [feeSetting, setFeeSetting] = useState({
    feeAmount: 0,
    feeReceiver: '',
    chargeFeeBy: 'currency_in' as 'currency_in' | 'currency_out',
    isInBps: true,
  });

  const [theme, setTheme] = useState<Theme>(widgetDarkTheme);

  const toggleWidgetTheme = useCallback(() => {
    setTheme((pre) => {
      return isEqual(pre, widgetDarkTheme) ? widgetLightTheme : widgetDarkTheme;
    });
  }, []);

  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();

  const { disconnect } = useDisconnect();

  return (
    <>
      <AppHeader />
      <main>
        <div>
          <h1 onClick={toggleWidgetTheme}>KyberSwap Widget</h1>
          {isConnected && connector ? (
            <div>
              {ensAvatar && <Image src={ensAvatar} alt="ENS Avatar" />}
              <div>{ensName ? `${ensName} (${address})` : address}</div>
              <div>Connected to {connector.name}</div>
              <button
                onClick={() => {
                  disconnect();
                }}
              >
                Disconnect
              </button>
            </div>
          ) : (
            connectors.map((connector) => {
              return (
                <div key={connector.id}>
                  <button
                    disabled={!connector.ready}
                    onClick={() => {
                      return connect({ connector });
                    }}
                  >
                    {connector.name}
                    {!connector.ready && ' (unsupported)'}
                    {isLoading &&
                      connector.id === pendingConnector?.id &&
                      ' (connecting)'}
                  </button>
                </div>
              );
            })
          )}

          {error && <div>{error.message}</div>}

          <div>
            <p className="title">Charge fee</p>
          </div>
          <div className="row">
            chargeFeeBy
            <div style={{ display: 'flex' }}>
              <div>
                <input
                  type="radio"
                  id="currency_in"
                  name="chargeFeeBy"
                  value="currency_in"
                  onChange={() => {
                    setFeeSetting({
                      ...feeSetting,
                      chargeFeeBy: 'currency_in',
                    });
                  }}
                />
                <label htmlFor="currency_in">currency_in</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="currency_out"
                  name="chargeFeeBy"
                  value="currency_out"
                  onChange={() => {
                    setFeeSetting({
                      ...feeSetting,
                      chargeFeeBy: 'currency_out',
                    });
                  }}
                />
                <label htmlFor="currency_out"> currency_out</label>
              </div>
            </div>
          </div>

          <div className="row">
            feeReceiver
            <input
              value={feeSetting.feeReceiver}
              onChange={(e) => {
                return setFeeSetting({
                  ...feeSetting,
                  feeReceiver: e.target.value,
                });
              }}
            />
          </div>

          <div className="row">
            feeAmount
            <input
              value={feeSetting.feeAmount}
              onChange={(e) => {
                return setFeeSetting({
                  ...feeSetting,
                  feeAmount: Number(e.target.value),
                });
              }}
            />
          </div>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            <input
              type="checkbox"
              checked={feeSetting.isInBps}
              onChange={(e) => {
                setFeeSetting({ ...feeSetting, isInBps: e.target.checked });
              }}
            />
            <label htmlFor="isInBps">isInBps</label>
          </div>
        </div>
        <Widget
          theme={theme}
          tokenList={[]}
          provider={provider}
          defaultTokenOut={defaultTokenOut[chainId]}
          feeSetting={
            feeSetting.feeAmount && feeSetting.feeReceiver
              ? feeSetting
              : undefined
          }
        />
      </main>
    </>
  );
};

export default Home;

const AppHeader = () => {
  return (
    <Head>
      <title>Opencord Kyberswap Widgets Plugin</title>
      <meta
        name="description"
        content="opencord plugin for kyberswap widgets"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
};
