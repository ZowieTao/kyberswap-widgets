import { Widget } from '@kyberswap/widgets';
import { Theme } from '@kyberswap/widgets/dist/theme';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import isEqual from 'lodash/isEqualWith';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { defaultTokenOut } from '@/constant/kyberswap';
import {
  widgetDarkTheme,
  widgetLightTheme,
} from '@/constant/style/kyberswap-widget';
import { banner, bgItem } from '@/public';

const Home: NextPage = () => {
  const { connector } = useAccount();
  const [chainId, setChainId] = useState(1);
  const [provider, setProvider] = useState<
    ethers.providers.Web3Provider | undefined
  >(undefined);

  useEffect(() => {
    if (connector) {
      console.log(connector, 'will get provider');
      connector.getProvider().then((walletProvider) => {
        const web3Provider = new ethers.providers.Web3Provider(
          walletProvider,
          'any',
        );
        setProvider(web3Provider);
      });
    } else {
      setProvider(undefined);
    }
  }, [connector]);

  useEffect(() => {
    provider &&
      provider.getNetwork().then((res: any) => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleWidgetTheme = useCallback(() => {
    setTheme((pre) => {
      return isEqual(pre, widgetDarkTheme) ? widgetLightTheme : widgetDarkTheme;
    });
  }, []);

  return (
    <>
      <AppHeader />
      <main
        className="overflow-hidden h-screen max-w-[1600px] mx-auto bg-no-repeat bg-page"
        // style={{
        //   backgroundImage: 'url("/bg.svg")',
        // }}
      >
        <motion.div>
          <Image width="200" height="100" src={banner} alt="opencord" />
          <Image width="200" height="100" src={bgItem} alt="opencord" />
          <ConnectButton label="Sign in" />

          <motion.div>
            <p className="">Charge Fee</p>
          </motion.div>
          <motion.div className="">
            chargeFeeBy
            <motion.div>
              <motion.div>
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
              </motion.div>
              <motion.div>
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
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div className="">
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
          </motion.div>

          <motion.div className="">
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
          </motion.div>

          <motion.div className="" style={{ justifyContent: 'flex-end' }}>
            <input
              type="checkbox"
              checked={feeSetting.isInBps}
              onChange={(e) => {
                setFeeSetting({ ...feeSetting, isInBps: e.target.checked });
              }}
            />
            <label htmlFor="isInBps">isInBps</label>
          </motion.div>
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
        </motion.div>
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
