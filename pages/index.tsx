import { Widget } from '@kyberswap/widgets';
import { Theme } from '@kyberswap/widgets/dist/theme';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import isEqual from 'lodash/isEqualWith';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { defaultTokenOut } from '@/constant/kyberswap';
import {
  widgetDarkTheme,
  widgetLightTheme,
} from '@/constant/style/kyberswap-widget';
import { banner, bgItem } from '@/public';
import { fadeInDown, fadeInUp, staggerContainer } from '@/styles/variants';

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

  const [theme, setTheme] = useState<Theme>(widgetLightTheme);

  return (
    <>
      <AppHeader />
      <main className="mx-auto box-content h-screen overflow-hidden bg-bg bg-cover bg-no-repeat">
        <motion.section
          className="h-full overflow-y-scroll"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Image
            className="absolute bottom-0 right-0"
            src={bgItem}
            alt="background image"
            height="400"
            width="400"
          />
          <motion.header
            variants={fadeInDown}
            className=" relative mb-5 flex pl-7 pt-5 pr-3"
          >
            <Image
              className=""
              onClick={() => {
                setTheme((pre) => {
                  return isEqual(pre, widgetDarkTheme)
                    ? widgetLightTheme
                    : widgetDarkTheme;
                });
              }}
              src={banner}
              alt="opencord banner"
              height="200"
              width="200"
            />
            <div className=" flex-1" />
            <div className="ty:hidden sm:inline">
              <ConnectButton label="Sign in" />
            </div>
          </motion.header>

          <motion.div
            variants={fadeInDown}
            className=" w-1/1 flex justify-center"
          >
            <div className=" lg:flex">
              <div className=" hidden w-96 rounded-2xl bg-white">
                <div>
                  <p>Charge Fee</p>
                </div>
                <div>
                  chargeFeeBy
                  <div>
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
                <div>
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
                <div>
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
                <div>
                  <input
                    type="checkbox"
                    checked={feeSetting.isInBps}
                    onChange={(e) => {
                      setFeeSetting({
                        ...feeSetting,
                        isInBps: e.target.checked,
                      });
                    }}
                  />
                  <label htmlFor="isInBps">isInBps</label>
                </div>
              </div>
              <div className="">
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
              </div>
            </div>
          </motion.div>
          <motion.div
            variants={fadeInUp}
            className=" bottom-0 flex h-20 w-screen justify-end bg-white ty:fixed sm:hidden"
          >
            <div className="absolute right-0 pt-3 pr-3">
              <ConnectButton label="Sign in" accountStatus="full" showBalance />
            </div>
          </motion.div>
        </motion.section>
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
