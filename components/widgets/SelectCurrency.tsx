import { BigNumber } from 'ethers';
import { formatUnits, isAddress } from 'ethers/lib/utils';
import { useState } from 'react';
import styled, { keyframes } from 'styled-components';

import {
  NATIVE_TOKEN,
  NATIVE_TOKEN_ADDRESS,
  TokenInfo as TokenDetail,
} from '@/constants';
import Loading from '@/public/assets/loader.svg';
import Question from '@/public/assets/question.svg';
import TrashIcon from '@/public/assets/trash.svg';

import { useToken } from './hooks/useToken';
import useTokenBalances from './hooks/useTokenBalances';
import { useImportedTokens, useTokens } from './hooks/useTokens';
import { useActiveWeb3 } from './hooks/useWeb3Provider';
import ImageWithFallback from './image-with-fallback';
import { Button } from './styled';

const Trash = styled(TrashIcon)`
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: ${({ theme }) => {
    return theme.text;
  }};

  :hover {
    color: ${({ theme }) => {
      return theme.error;
    }};
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled(Loading)`
  animation: 2s ${rotate} linear infinite;
  width: 20px;
  height: 20px;
  color: ${({ theme }) => {
    return theme.accent;
  }};

  path {
    stroke-width: 8;
  }
`;

export const Input = styled.input`
  font-size: 0.75rem;
  padding: 0.75rem;
  border-radius: ${({ theme }) => {
    return theme.borderRadius;
  }};
  background: ${({ theme }) => {
    return theme.secondary;
  }};
  outline: none;
  border: none;
  color: ${({ theme }) => {
    return theme.text;
  }};
      ).filter(token => token.address.toLowerCase() === search.trim().toLowerCase() || token.name.includes(search.toLowerCase())),  box-shadow: ${({
        theme,
      }) => {
        return theme.boxShadow;
      }};
`;

const TokenListWrapper = styled.div`
  flex: 1;
  overflow-y: scroll;

  /* width */
  ::-webkit-scrollbar {
    display: unset;
    width: 6px;
    border-radius: 999px;
  }

  /* Track */
  ::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 999px;
  }

  /* Handle */
  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => {
      return `${theme.subText}66`;
    }};
    border-radius: 999px;
  }
`;

const TokenRow = styled.div<{ selected: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;

  background: ${({ theme, selected }) => {
    return selected ? theme.secondary : 'transparent';
  }};

  :hover {
    background: ${({ theme }) => {
      return theme.secondary;
    }};
  }
`;

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 1rem;
`;

const TokenName = styled.div`
  color: ${({ theme }) => {
    return theme.subText;
  }};
  font-size: 0.75rem;
`;

const TokenBalance = styled.div`
  font-size: 1rem;
  overflow: hidden;
  max-width: 6rem;
  text-overflow: ellipsis;
`;

const Tabs = styled.div`
  padding-bottom: 16px;
  border-bottom: 1px solid
    ${({ theme }) => {
      return theme.stroke;
    }};
  display: flex;
  gap: 24px;
  cursor: pointer;
`;

const Tab = styled.div<{ active: boolean }>`
  color: ${({ theme, active }) => {
    return active ? theme.accent : theme.text;
  }};
  hover: ${({ theme }) => {
    return theme.accent;
  }};
  font-size: 14px;
  font-weight: 500;
`;

const NotFound = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${({ theme }) => {
    return theme.subText;
  }};
`;

const ImportToken = ({
  address,
  onImport,
}: {
  address: string;
  onImport: (token: TokenDetail) => void;
}) => {
  const token = useToken(address);

  if (!token) {
    return null;
  }

  return (
    <TokenRow selected={false}>
      <TokenInfo>
        <Question />
        <div style={{ textAlign: 'left' }}>
          <span>{token.symbol}</span>
          <TokenName>{token.name}</TokenName>
        </div>
      </TokenInfo>

      <Button
        style={{ width: 'fit-content', padding: '8px 16px', marginTop: 0 }}
        onClick={() => {
          return onImport(token);
        }}
      >
        Import
      </Button>
    </TokenRow>
  );
};

function SelectCurrency({
  selectedToken,
  onChange,
  onImport,
}: {
  selectedToken: string;
  onChange: (address: string) => void;
  onImport: (token: TokenDetail) => void;
}) {
  const tokens = useTokens();
  const [search, setSearch] = useState('');
  const tokenAddress = tokens.map((item) => {
    return item.address;
  });
  const { balances, loading } = useTokenBalances(tokenAddress);
  const { removeToken } = useImportedTokens();

  const { chainId } = useActiveWeb3();

  const tokenWithBalances = [
    {
      ...NATIVE_TOKEN[chainId],
      balance: balances[NATIVE_TOKEN_ADDRESS],
      formattedBalance: formatUnits(
        balances[NATIVE_TOKEN_ADDRESS] || BigNumber.from(0),
        18,
      ),
    },

    ...tokens
      .map((item) => {
        const balance = balances[item.address];
        const formattedBalance = formatUnits(
          balance || BigNumber.from(0),
          item.decimals,
        );

        return { ...item, balance, formattedBalance };
      })
      .sort((a, b) => {
        return parseFloat(b.formattedBalance) - parseFloat(a.formattedBalance);
      }),
  ].filter((token) => {
    return (
      token.address.toLowerCase() === search.trim().toLowerCase() ||
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.symbol.toLowerCase().includes(search.toLowerCase())
    );
  });

  const [tab, setTab] = useState<'all' | 'imported'>('all');

  return (
    <>
      <Input
        placeholder="Search by token name, token symbol or address"
        value={search}
        onChange={(e) => {
          return setSearch(e.target.value);
        }}
      />

      <Tabs>
        <Tab
          active={tab === 'all'}
          onClick={() => {
            return setTab('all');
          }}
          role="button"
        >
          All
        </Tab>
        <Tab
          active={tab === 'imported'}
          onClick={() => {
            return setTab('imported');
          }}
          role="button"
        >
          Imported
        </Tab>
      </Tabs>
      <TokenListWrapper>
        {!tokenWithBalances.length && isAddress(search.trim()) && (
          <ImportToken address={search.trim()} onImport={onImport} />
        )}

        {!tokenWithBalances.filter((item) => {
          return tab === 'imported' ? item.isImport : true;
        }).length &&
          !isAddress(search.trim()) && <NotFound>No results found</NotFound>}

        {tokenWithBalances
          .filter((item) => {
            return tab === 'imported' ? item.isImport : true;
          })
          .map((token) => {
            return (
              <TokenRow
                selected={token.address === selectedToken}
                key={token.address}
                onClick={() => {
                  onChange(token.address);
                }}
              >
                <TokenInfo>
                  <ImageWithFallback
                    src={token.logoURI}
                    width="24"
                    height="24"
                    alt="logo"
                    style={{
                      borderRadius: '999px',
                    }}
                    fallbackSrc="/assets/question.svg"
                  />
                  <div style={{ textAlign: 'left' }}>
                    <span>{token.symbol}</span>
                    <TokenName>{token.name}</TokenName>
                  </div>
                </TokenInfo>

                {tab === 'imported' ? (
                  <Trash
                    onClick={(e: any) => {
                      e.stopPropagation();
                      removeToken(token);
                    }}
                  />
                ) : loading ? (
                  <Spinner />
                ) : (
                  <TokenBalance>
                    {token.balance &&
                    parseFloat(token.formattedBalance) < 0.000001
                      ? token.formattedBalance
                      : parseFloat(
                          parseFloat(token.formattedBalance).toPrecision(10),
                        )}
                  </TokenBalance>
                )}
              </TokenRow>
            );
          })}
      </TokenListWrapper>
    </>
  );
}

export default SelectCurrency;
