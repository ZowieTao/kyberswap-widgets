import { BigNumber } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { StrictMode, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';

import {
  NATIVE_TOKEN,
  NATIVE_TOKEN_ADDRESS,
  SUPPORTED_NETWORKS,
  TokenInfo,
  ZIndex,
} from '@/constants';
import AlertIcon from '@/public/assets/alert.svg';
import BackIcon from '@/public/assets/back1.svg';
import DropdownIcon from '@/public/assets/dropdown.svg';
import KyberSwapLogo from '@/public/assets/kyberswap.svg';
import SettingIcon from '@/public/assets/setting.svg';
import SwapIcon from '@/public/assets/swap.svg';
import SwitchIcon from '@/public/assets/switch.svg';
import WalletIcon from '@/public/assets/wallet.svg';

import Confirmation from './Confirmation';
import DexesSetting from './DexesSetting';
import useApproval, { APPROVAL_STATE } from './hooks/useApproval';
import useSwap from './hooks/useSwap';
import useTheme from './hooks/useTheme';
import useTokenBalances from './hooks/useTokenBalances';
import { TokenListProvider, useTokens } from './hooks/useTokens';
import { useActiveWeb3, Web3Provider } from './hooks/useWeb3Provider';
import ImageWithFallback from './image-with-fallback';
import ImportModal from './ImportModal';
import InfoHelper from './InfoHelper';
import RefreshBtn from './RefreshBtn';
import SelectCurrency from './SelectCurrency';
import Settings from './Settings';
import {
  AccountBalance,
  BalanceRow,
  Button,
  Detail,
  DetailLabel,
  DetailRight,
  DetailRow,
  DetailTitle,
  Divider,
  Dots,
  Input,
  InputRow,
  InputWrapper,
  MaxHalfBtn,
  MiddleLeft,
  MiddleRow,
  ModalHeader,
  ModalTitle,
  Rate,
  SelectTokenBtn,
  SettingBtn,
  SwitchBtn,
  Title,
  Wrapper,
} from './styled';
import { defaultTheme, Theme } from './theme';

export const DialogWrapper = styled.div`
  background-color: ${({ theme }: { theme: Record<string, any> }) => {
    return theme.dialog;
  }};
  border-radius: ${({ theme }: { theme: Record<string, any> }) => {
    return theme.borderRadius;
  }};
  position: absolute;
  left: 0;
  top: 0;
  width: calc(100% - 2rem);
  height: calc(100% - 2rem);
  padding: 1rem;
  overflow: hidden;
  z-index: ${ZIndex.DIALOG};
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @supports (overflow: clip) {
    overflow: clip;
  }

  transition: 0.25s ease-in-out;

  &.open {
    transform: translateX(0);
  }

  &.close {
    transform: translateX(100%);
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: scroll;

  ::-webkit-scrollbar {
    display: none;
  }
`;

const SelectTokenText = styled.span`
  font-size: 16px;
  width: max-content;
`;

const PoweredBy = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: ${({ theme }: { theme: Record<string, any> }) => {
    return theme.subText;
  }};
  font-size: 12px;
  margin-top: 1rem;
`;

enum ModalType {
  SETTING = 'setting',
  CURRENCY_IN = 'currency_in',
  CURRENCY_OUT = 'currency_out',
  REVIEW = 'review',
  DEXES_SETTING = 'dexes_setting',
  IMPORT_TOKEN = 'import_token',
}

interface FeeSetting {
  chargeFeeBy: 'currency_in' | 'currency_out';
  feeReceiver: string;
  // BPS: 10_000
  // 10 means 0.1%
  feeAmount: number;
  isInBps: boolean;
}

export interface WidgetProps {
  provider?: any;
  tokenList?: TokenInfo[];
  theme?: Theme;
  defaultTokenIn?: string;
  defaultTokenOut?: string;
  feeSetting?: FeeSetting;
}

const Widget = ({
  defaultTokenIn,
  defaultTokenOut,
  feeSetting,
}: {
  defaultTokenIn?: string;
  defaultTokenOut?: string;
  feeSetting?: FeeSetting;
}) => {
  const [showModal, setShowModal] = useState<ModalType | null>(null);
  const { chainId } = useActiveWeb3();
  const isUnsupported = !SUPPORTED_NETWORKS.includes(chainId.toString());

  const tokens = useTokens();
  const {
    loading,
    error,
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    inputAmout,
    setInputAmount,
    trade: routeTrade,
    slippage,
    setSlippage,
    getRate,
    deadline,
    setDeadline,
    allDexes,
    excludedDexes,
    setExcludedDexes,
    setTrade,
  } = useSwap({
    defaultTokenIn,
    defaultTokenOut,
    feeSetting,
  });

  const trade = isUnsupported ? null : routeTrade;

  const [inverseRate, setInverseRate] = useState(false);

  const { balances, refetch } = useTokenBalances(
    tokens.map((item) => {
      return item.address;
    }),
  );

  const tokenInInfo =
    tokenIn === NATIVE_TOKEN_ADDRESS
      ? NATIVE_TOKEN[chainId]
      : tokens.find((item) => {
          return item.address === tokenIn;
        });

  const tokenOutInfo =
    tokenOut === NATIVE_TOKEN_ADDRESS
      ? NATIVE_TOKEN[chainId]
      : tokens.find((item) => {
          return item.address === tokenOut;
        });

  const amountOut = trade?.outputAmount
    ? formatUnits(trade.outputAmount, tokenOutInfo?.decimals).toString()
    : '';

  let minAmountOut = '';

  if (amountOut) {
    minAmountOut = (Number(amountOut) * (1 - slippage / 10_000))
      .toPrecision(8)
      .toString();
  }

  const tokenInBalance = balances[tokenIn] || BigNumber.from(0);
  const tokenOutBalance = balances[tokenOut] || BigNumber.from(0);

  const tokenInWithUnit = formatUnits(
    tokenInBalance,
    tokenInInfo?.decimals || 18,
  );
  const tokenOutWithUnit = formatUnits(
    tokenOutBalance,
    tokenOutInfo?.decimals || 18,
  );

  const rate =
    trade?.inputAmount &&
    trade?.outputAmount &&
    parseFloat(formatUnits(trade.outputAmount, tokenOutInfo?.decimals || 18)) /
      parseFloat(inputAmout);

  const formattedTokenInBalance = parseFloat(
    parseFloat(tokenInWithUnit).toPrecision(10),
  );

  const formattedTokenOutBalance = parseFloat(
    parseFloat(tokenOutWithUnit).toPrecision(10),
  );

  const theme = useTheme();

  const priceImpact = !trade?.amountOutUsd
    ? -1
    : ((-trade.amountOutUsd + trade.amountInUsd) * 100) / trade.amountInUsd;

  const modalTitle = (() => {
    switch (showModal) {
      case ModalType.SETTING:
        return 'Settings';
      case ModalType.CURRENCY_IN:
        return 'Select a token';
      case ModalType.CURRENCY_OUT:
        return 'Select a token';
      case ModalType.DEXES_SETTING:
        return 'Liquidity Sources';
      case ModalType.IMPORT_TOKEN:
        return 'Import Token';

      default:
        return null;
    }
  })();

  const [tokenToImport, setTokenToImport] = useState<TokenInfo | null>(null);
  const [importType, setImportType] = useState<'in' | 'out'>('in');

  const modalContent = (() => {
    switch (showModal) {
      case ModalType.SETTING:
        return (
          <Settings
            slippage={slippage}
            setSlippage={setSlippage}
            deadline={deadline}
            setDeadline={setDeadline}
            allDexes={allDexes}
            excludedDexes={excludedDexes}
            onShowSource={() => {
              return setShowModal(ModalType.DEXES_SETTING);
            }}
          />
        );
      case ModalType.CURRENCY_IN:
        return (
          <SelectCurrency
            selectedToken={tokenIn}
            onChange={(address) => {
              if (address === tokenOut) {
                setTokenOut(tokenIn);
              }
              setTokenIn(address);
              setShowModal(null);
            }}
            onImport={(token: TokenInfo) => {
              setTokenToImport(token);
              setShowModal(ModalType.IMPORT_TOKEN);
              setImportType('in');
            }}
          />
        );
      case ModalType.CURRENCY_OUT:
        return (
          <SelectCurrency
            selectedToken={tokenOut}
            onChange={(address) => {
              if (address === tokenIn) {
                setTokenIn(tokenOut);
              }
              setTokenOut(address);
              setShowModal(null);
            }}
            onImport={(token: TokenInfo) => {
              setTokenToImport(token);
              setShowModal(ModalType.IMPORT_TOKEN);
              setImportType('out');
            }}
          />
        );
      case ModalType.REVIEW:
        if (rate && tokenInInfo && trade && tokenOutInfo) {
          return (
            <Confirmation
              trade={trade}
              tokenInInfo={tokenInInfo}
              amountIn={inputAmout}
              tokenOutInfo={tokenOutInfo}
              amountOut={amountOut}
              rate={rate}
              priceImpact={priceImpact}
              slippage={slippage}
              onClose={() => {
                setShowModal(null);
                refetch();
              }}
            />
          );
        }

        return null;
      case ModalType.DEXES_SETTING:
        return (
          <DexesSetting
            allDexes={allDexes}
            excludedDexes={excludedDexes}
            setExcludedDexes={setExcludedDexes}
          />
        );

      case ModalType.IMPORT_TOKEN:
        if (tokenToImport) {
          return (
            <ImportModal
              token={tokenToImport}
              onImport={() => {
                if (importType === 'in') {
                  setTokenIn(tokenToImport.address);
                  setShowModal(null);
                } else {
                  setTokenOut(tokenToImport.address);
                  setShowModal(null);
                }
              }}
            />
          );
        }

        return null;
      default:
        return null;
    }
  })();

  const {
    loading: checkingAllowance,
    approve,
    approvalState,
  } = useApproval(
    BigNumber.from(trade?.inputAmount || 0),
    tokenIn,
    trade?.routerAddress || '',
  );

  return (
    <Wrapper>
      <DialogWrapper className={showModal ? 'open' : 'close'}>
        {showModal !== ModalType.REVIEW && (
          <ModalHeader>
            <ModalTitle
              onClick={() => {
                return showModal === ModalType.DEXES_SETTING
                  ? setShowModal(ModalType.SETTING)
                  : setShowModal(null);
              }}
              role="button"
            >
              <BackIcon style={{ color: theme.subText }} />
              {modalTitle}
            </ModalTitle>
          </ModalHeader>
        )}
        <ContentWrapper>{modalContent}</ContentWrapper>
        <PoweredBy style={{ marginTop: '0' }}>
          Powered By
          <KyberSwapLogo />
        </PoweredBy>
      </DialogWrapper>
      <Title>
        Swap
        <SettingBtn
          onClick={() => {
            return setShowModal(ModalType.SETTING);
          }}
        >
          <SettingIcon />
        </SettingBtn>
      </Title>
      <InputWrapper>
        <BalanceRow>
          <div>
            <MaxHalfBtn
              onClick={() => {
                return setInputAmount(tokenInWithUnit);
              }}
            >
              Max
            </MaxHalfBtn>
            {/* <MaxHalfBtn>Half</MaxHalfBtn> */}
          </div>
          <AccountBalance>
            <WalletIcon />
            {formattedTokenInBalance}
          </AccountBalance>
        </BalanceRow>

        <InputRow>
          <Input
            value={inputAmout}
            onChange={(e: any) => {
              const value = e.target.value.replace(/,/g, '.');
              const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group
              if (
                value === '' ||
                inputRegex.test(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
              ) {
                setInputAmount(value);
              }
            }}
            inputMode="decimal"
            autoComplete="off"
            autoCorrect="off"
            type="text"
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder="0.0"
            minLength={1}
            maxLength={79}
            spellCheck="false"
          />

          {!!trade?.amountInUsd && (
            <span
              style={{
                fontSize: '12px',
                marginRight: '4px',
                color: theme.subText,
              }}
            >
              ~
              {trade.amountInUsd.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          )}

          <SelectTokenBtn
            onClick={() => {
              return !isUnsupported && setShowModal(ModalType.CURRENCY_IN);
            }}
          >
            {tokenInInfo ? (
              <>
                <ImageWithFallback
                  alt=""
                  width="20"
                  height="20"
                  src={tokenInInfo?.logoURI}
                  style={{ borderRadius: '50%' }}
                  fallbackSrc="/assets/question.svg"
                />
                <div style={{ marginLeft: '0.375rem' }}>
                  {tokenInInfo?.symbol}
                </div>
              </>
            ) : (
              <SelectTokenText>Select a token</SelectTokenText>
            )}
            <DropdownIcon />
          </SelectTokenBtn>
        </InputRow>
      </InputWrapper>

      <MiddleRow>
        <MiddleLeft>
          <RefreshBtn
            loading={loading}
            onRefresh={() => {
              getRate();
            }}
            trade={trade}
          />
          <Rate>
            {(() => {
              if (!rate) {
                return '--';
              }

              return !inverseRate
                ? `1 ${tokenInInfo?.symbol} = ${+rate.toPrecision(10)} ${
                    tokenOutInfo?.symbol
                  }`
                : `1 ${tokenOutInfo?.symbol} = ${+(1 / rate).toPrecision(10)} ${
                    tokenInInfo?.symbol
                  }`;
            })()}
          </Rate>

          {!!rate && (
            <SettingBtn
              onClick={() => {
                return setInverseRate((prev) => {
                  return !prev;
                });
              }}
            >
              <SwapIcon />
            </SettingBtn>
          )}
        </MiddleLeft>

        <SwitchBtn
          onClick={() => {
            setTrade(null);
            setTokenIn(tokenOut);
            setTokenOut(tokenIn);
          }}
        >
          <SwitchIcon />
        </SwitchBtn>
      </MiddleRow>

      <InputWrapper>
        <BalanceRow>
          <div />
          <AccountBalance>
            <WalletIcon />
            {formattedTokenOutBalance}
          </AccountBalance>
        </BalanceRow>

        <InputRow>
          <Input disabled value={+Number(amountOut).toPrecision(8)} />

          {!!trade?.amountOutUsd && (
            <span
              style={{
                fontSize: '12px',
                marginRight: '4px',
                color: theme.subText,
              }}
            >
              ~
              {trade.amountOutUsd.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
            </span>
          )}
          <SelectTokenBtn
            onClick={() => {
              return !isUnsupported && setShowModal(ModalType.CURRENCY_OUT);
            }}
          >
            {tokenOutInfo ? (
              <>
                <ImageWithFallback
                  alt=""
                  width="20"
                  height="20"
                  src={tokenOutInfo?.logoURI}
                  style={{ borderRadius: '50%' }}
                  fallbackSrc="/assets/question.svg"
                />
                <div style={{ marginLeft: '0.375rem' }}>
                  {tokenOutInfo?.symbol}
                </div>
              </>
            ) : (
              <SelectTokenText>Select a token</SelectTokenText>
            )}
            <DropdownIcon />
          </SelectTokenBtn>
        </InputRow>
      </InputWrapper>

      <Detail style={{ marginTop: '1rem' }}>
        <DetailTitle>More information</DetailTitle>
        <Divider />
        <DetailRow>
          <DetailLabel>
            Minimum Received
            <InfoHelper
              text={`Minimum amount you will receive or your transaction will revert`}
            />
          </DetailLabel>
          <DetailRight>
            {minAmountOut ? `${minAmountOut} ${tokenOutInfo?.symbol}` : '--'}
          </DetailRight>
        </DetailRow>

        <DetailRow>
          <DetailLabel>
            Gas Fee{' '}
            <InfoHelper text="Estimated network fee for your transaction" />
          </DetailLabel>
          <DetailRight>
            {trade?.gasUsd ? `$${trade.gasUsd.toPrecision(4)}` : '--'}
          </DetailRight>
        </DetailRow>

        <DetailRow>
          <DetailLabel>
            Price Impact
            <InfoHelper text="Estimated change in price due to the size of your transaction" />
          </DetailLabel>
          <DetailRight
            style={{
              color:
                priceImpact > 15
                  ? theme.error
                  : priceImpact > 5
                  ? theme.warning
                  : theme.text,
            }}
          >
            {priceImpact === -1
              ? '--'
              : priceImpact > 0.01
              ? `${priceImpact.toFixed(3)}%`
              : '< 0.01%'}
          </DetailRight>
        </DetailRow>
      </Detail>

      <Button
        disabled={
          !!error ||
          loading ||
          checkingAllowance ||
          approvalState === APPROVAL_STATE.PENDING ||
          isUnsupported
        }
        onClick={async () => {
          if (approvalState === APPROVAL_STATE.NOT_APPROVED) {
            approve();
          } else {
            setShowModal(ModalType.REVIEW);
          }
        }}
      >
        {isUnsupported ? (
          <PoweredBy style={{ fontSize: '16px', marginTop: '0' }}>
            <AlertIcon style={{ width: '24px', height: '24px' }} />
            Unsupported network
          </PoweredBy>
        ) : loading ? (
          <Dots>Calculate best route</Dots>
        ) : error ? (
          error
        ) : checkingAllowance ? (
          <Dots>Checking Allowance</Dots>
        ) : approvalState === APPROVAL_STATE.NOT_APPROVED ? (
          'Approve'
        ) : approvalState === APPROVAL_STATE.PENDING ? (
          <Dots>Approving</Dots>
        ) : (
          'Swap'
        )}
      </Button>

      <PoweredBy>
        Powered By
        <KyberSwapLogo />
      </PoweredBy>
    </Wrapper>
  );
};

const _Widget = ({
  provider,
  tokenList,
  theme,
  defaultTokenIn,
  defaultTokenOut,
  feeSetting,
}: WidgetProps) => {
  return (
    <StrictMode>
      <ThemeProvider theme={theme || defaultTheme}>
        <Web3Provider provider={provider}>
          <TokenListProvider tokenList={tokenList}>
            <Widget
              defaultTokenIn={defaultTokenIn}
              defaultTokenOut={defaultTokenOut}
              feeSetting={feeSetting}
            />
          </TokenListProvider>
        </Web3Provider>
      </ThemeProvider>
    </StrictMode>
  );
};

export default _Widget;
