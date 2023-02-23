import { ethers } from 'ethers';
import { useRef } from 'react';
import { Connector } from 'wagmi';

export default function useConnector2Provider(
  connnect: Connector<any, any, any> | undefined,
) {
  const providerRef = useRef<ethers.providers.Web3Provider | undefined>();
  if (connnect) {
    connnect.getProvider().then((walletProvider) => {
      providerRef.current = new ethers.providers.Web3Provider(
        walletProvider,
        'any',
      );
    });
  } else {
    providerRef.current = undefined;
  }

  return providerRef.current;
}
