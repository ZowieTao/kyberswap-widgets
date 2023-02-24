import { Widget } from '@kyberswap/widgets';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import { defaultTokenOut } from '@/constant/kyberswap';
import { widgetLightTheme } from '@/constant/style/kyberswap-widget';
import { banner, bgItem } from '@/public';
import { fadeInDown, staggerContainer } from '@/styles/variants';

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

  useEffect(() => {}, []);

  const [feeSetting, setFeeSetting] = useState({
    feeAmount: 0,
    feeReceiver: '',
    chargeFeeBy: 'currency_in' as 'currency_in' | 'currency_out',
    isInBps: true,
  });

  return (
    <>
      <AppHeader />
      <main
        style={{
          marginLeft: 'auto',
          marginRight: 'auto',
          boxSizing: 'border-box',
          height: '100vh',
          overflow: 'hidden',
          background: 'url("/bg.svg")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <motion.section
          style={{
            height: '100%',
            overflowY: 'scroll',
          }}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <Image
            style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
            }}
            src={bgItem}
            alt="background image"
            height="400"
            width="400"
          />
          <Image
            className="top-banner"
            src={banner}
            alt="opencord banner"
            height="36"
            width="147"
            style={{
              left: '20px',
              top: '20px',
              position: 'fixed',
            }}
          />
          <Image
            height="36"
            width="0"
            src={banner}
            alt="opencord banner"
            className="bottom-banner"
            style={{
              left: '20px',
              bottom: '40px',
              position: 'fixed',
            }}
          />
          <motion.header
            variants={fadeInDown}
            style={{
              position: 'relative',
              marginBottom: '10px',
              padding: '20px 15px 0 30px',
              display: 'flex',
            }}
          >
            <div
              style={{
                flex: '1',
              }}
            />
            <div
              style={{
                display: 'flex',
                height: '40px',
              }}
            >
              <ConnectButton label="Connect wallet" />
            </div>
          </motion.header>
          <motion.div
            variants={fadeInDown}
            style={{
              width: '100vw',
              maxWidth: '100vw',
              padding: '24px',
              display: 'flex',
              justifyContent: 'center',
              boxSizing: 'border-box',
              marginTop: '48px',
            }}
          >
            <div
              style={{
                display: 'none',
              }}
            >
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
            <Widget
              theme={widgetLightTheme}
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
