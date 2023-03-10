import { BigNumber, providers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

import erc20ABI from '@/constants/multicall/erc20.json';

import { NATIVE_TOKEN_ADDRESS } from '../../../constants';
import { useContract } from './useContract';
import { useActiveWeb3 } from './useWeb3Provider';

export enum APPROVAL_STATE {
  UNKNOWN = 'unknown',
  PENDING = 'pending',
  APPROVED = 'approved',
  NOT_APPROVED = 'not_approved',
}

function useApproval(
  amountToApprove: BigNumber,
  token: string,
  spender: string,
) {
  const { account, provider } = useActiveWeb3();
  const [loading, setLoading] = useState(false);
  const [approvalState, setApprovalState] = useState(() => {
    return token === NATIVE_TOKEN_ADDRESS
      ? APPROVAL_STATE.APPROVED
      : APPROVAL_STATE.UNKNOWN;
  });
  const contract = useContract(token, erc20ABI);

  const MaxUint256: BigNumber = BigNumber.from(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  );

  const [pendingTx, setPendingTx] = useState('');

  const approve = useCallback(() => {
    if (contract) {
      contract
        .approve(spender, MaxUint256)
        .then((res: providers.TransactionResponse) => {
          setApprovalState(APPROVAL_STATE.PENDING);
          setPendingTx(res.hash);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, spender]);

  useEffect(() => {
    if (pendingTx) {
      const i = setInterval(() => {
        provider?.getTransactionReceipt(pendingTx).then((receipt) => {
          if (receipt) {
            setPendingTx('');
            setApprovalState(APPROVAL_STATE.APPROVED);
          }
        });
      }, 8_000);

      return () => {
        clearInterval(i);
      };
    }
  }, [pendingTx, provider]);

  useEffect(() => {
    if (contract && token !== NATIVE_TOKEN_ADDRESS && account && spender) {
      setLoading(true);
      contract.allowance(account, spender).then((res: any) => {
        if (amountToApprove.lte(res)) {
          setApprovalState(APPROVAL_STATE.APPROVED);
        } else {
          setApprovalState(APPROVAL_STATE.NOT_APPROVED);
        }
        setLoading(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, token, account, spender]);

  return { loading, approvalState, approve };
}

export default useApproval;
