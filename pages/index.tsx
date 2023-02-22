import { Widget } from '@kyberswap/widgets';
import { Theme } from '@kyberswap/widgets/dist/theme';
import isEqual from 'lodash/isEqualWith';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import {
  widgetDarkTheme,
  widgetLightTheme,
} from '@/constant/style/kyberswap-widget';
import { useAsyncValue } from '@/hooks/base/useAsyncValue';

const Home: NextPage = () => {
  const { connector } = useAccount();
  const { value: provider } = useAsyncValue(async () => {
    const provider = await connector?.getProvider();

    return provider;
  });

  const [theme, setTheme] = useState<Theme>(widgetDarkTheme);

  const [feeSetting, setFeeSetting] = useState({
    feeAmount: 0,
    feeReceiver: '',
    chargeFeeBy: 'currency_in' as 'currency_in' | 'currency_out',
    isInBps: true,
  });

  const [chainId, setChainId] = useState(1);

  useEffect(() => {
    provider?.getNetwork().then((res: any) => {
      return setChainId(res.chainId);
    });
  }, [provider]);

  const defaultTokenOut: { [chainId: number]: string } = {
    1: '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
    137: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    56: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    43114: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    250: '0x049d68029688eAbF473097a2fC38ef61633A3C7A',
    25: '0x66e428c3f67a68878562e79A0234c1F83c208770',
    42161: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
    199: '0x9B5F27f6ea9bBD753ce3793a07CbA3C74644330d',
    106: '0x01445C31581c354b7338AC35693AB2001B50b9aE',
    1313161554: '0x4988a896b1227218e4a686fde5eabdcabd91571f',
    42262: '0x6Cb9750a92643382e020eA9a170AbB83Df05F30B',
    10: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
  };

  const toggleWidgetTheme = useCallback(() => {
    setTheme((pre) => {
      return isEqual(pre, widgetDarkTheme) ? widgetLightTheme : widgetDarkTheme;
    });
  }, []);

  return (
    <>
      <Head>
        <title>Opencord Kyberswap Widgets Plugin</title>
        <meta
          name="description"
          content="opencord plugin for kyberswap widgets"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div>
          <h1 onClick={toggleWidgetTheme}>KyberSwap Widget </h1>
          {/* <div className="card">
            <button
              onClick={() => {
                return wallet ? disconnect(wallet) : connect();
              }}
              className="button"
            >
              {!wallet ? 'Connect Wallet' : 'Disconnect'}
            </button>
          </div> */}

          <p className="title">Charge fee</p>
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
