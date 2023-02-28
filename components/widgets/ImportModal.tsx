import { useEffect, useState } from 'react';
import styled from 'styled-components';

import { SCAN_LINK, TokenInfo as Token } from '@/constants';
import Copy from '@/public/assets/copy.svg';
import ErrorIcon from '@/public/assets/error.svg';
import External from '@/public/assets/external.svg';
import Question from '@/public/assets/question.svg';
import SuccessSVG from '@/public/assets/success.svg';
import { copyToClipboard } from '@/utils';

import { Checkbox } from './DexesSetting';
import useTheme from './hooks/useTheme';
import { useImportedTokens } from './hooks/useTokens';
import { useActiveWeb3 } from './hooks/useWeb3Provider';
import { Button } from './styled';

const Success = styled(SuccessSVG)`
  width: 14px;
  height: 14px;
  circle {
    stroke-width: 6;
  }

  path {
    stroke-width: 6;
  }
`;

const Error = styled(ErrorIcon)`
  width: 24px;
  height: 24px;

  circle {
    stroke-width: 6;
  }

  path {
    stroke-width: 6;
  }
`;

const TokenInfo = styled.div`
  padding: 1.25rem;
  gap: 12px;
  border-radius: ${({ theme }) => {
    return theme.borderRadius;
  }};
  background: ${({ theme }) => {
    return theme.secondary;
  }};
  display: flex;
  align-items: flex-start;
`;

const TokenName = styled.div`
  color: ${({ theme }) => {
    return theme.subText;
  }};
  font-size: 14px;
  text-align: left;
`;

const TokenSymbol = styled.div`
  font-weight: 500;
  text-align: left;
  font-size: 20px;
`;

const AddressRow = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-top: 8px;
  gap: 4px;
  a {
    line-height: 0;
  }
`;

const Warning = styled.div`
  border-radius: ${({ theme }) => {
    return theme.borderRadius;
  }};
  background: ${({ theme }) => {
    return `${theme.error}44`;
  }};
  padding: 20px;
`;

const WarningTitle = styled.div`
  display: flex;
  font-size: 20px;
  color: ${({ theme }) => {
    return theme.error;
  }};
  gap: 8px;
`;

const WarningContent = styled.div`
  font-size: 14px;
  margin-top: 16px;
  line-height: 20px;
  text-align: left;
`;

const CheckboxRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
`;

function ImportModal({
  token,
  onImport,
}: {
  token: Token;
  onImport: () => void;
}) {
  const { chainId } = useActiveWeb3();

  const [checked, setChecked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { addToken } = useImportedTokens();
  const theme = useTheme();

  useEffect(() => {
    if (isCopied) {
      const hide = setTimeout(() => {
        setIsCopied(false);
      }, 2000);

      return () => {
        clearTimeout(hide);
      };
    }
  }, [isCopied]);

  return (
    <>
      <TokenInfo>
        <Question style={{ width: '44px', height: '44px' }} />
        <div>
          <TokenSymbol>{token.symbol}</TokenSymbol>
          <TokenName>{token.symbol}</TokenName>

          <AddressRow>
            Address: {token.address.substring(0, 6)}...
            {token.address.substring(36)}
            {isCopied ? (
              <Success />
            ) : (
              <Copy
                style={{
                  cursor: 'pointer',
                  width: '14px',
                  height: '14px',
                  color: theme.text,
                }}
                role="button"
                onClick={() => {
                  copyToClipboard(token.address);
                  setIsCopied(true);
                }}
              />
            )}
            <a
              href={`${SCAN_LINK[chainId]}/address/${token.address}`}
              target="_blank"
              rel="noopener norefferer noreferrer"
            >
              <External style={{ width: '12px', height: '12px' }} />
            </a>
          </AddressRow>
        </div>
      </TokenInfo>
      <Warning>
        <WarningTitle>
          <Error />
          <div>Trade at your own risk!</div>
        </WarningTitle>
        <WarningContent>
          Anyone can create a token, including creating fake versions of
          existing tokens that claim to represent projects
          <br />
          <br />
          If you purchase this token, you may not be able to sell it back
        </WarningContent>

        <CheckboxRow>
          <Checkbox
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              return setChecked(e.currentTarget.checked);
            }}
          />{' '}
          I understand
        </CheckboxRow>
      </Warning>

      <Button
        style={{ marginTop: 'auto' }}
        disabled={!checked}
        onClick={() => {
          addToken(token);
          onImport();
        }}
      >
        Import
      </Button>
    </>
  );
}

export default ImportModal;
