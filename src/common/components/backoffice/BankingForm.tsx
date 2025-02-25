import { Bank, BankAccount, WithId } from '@appjusto/types';
import { Box, Flex, Radio, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { useBanks } from 'app/api/business/profile/useBanks';
import { AlertWarning } from 'common/components/AlertWarning';
import { CustomPatternInput } from 'common/components/form/input/pattern-input/CustomPatternInput';
import { hyphenFormatter } from 'common/components/form/input/pattern-input/formatters';
import { numbersAndLettersParser } from 'common/components/form/input/pattern-input/parsers';
import { BankSelect } from 'common/components/form/select/BankSelect';
import {
  BackofficeProfileValidation,
  ProfileBankingFields,
} from 'common/types';
import React from 'react';
import { getBankingAccountPattern } from 'utils/functions';
import { t } from 'utils/i18n';

interface BankingFormProps {
  bankAccount: Partial<BankAccount> | null | undefined;
  handleBankAccountChange(newBankAccount: Partial<WithId<BankAccount>>): void;
  handleContextValidation(
    validation: Partial<BackofficeProfileValidation>
  ): void;
}

export const BankingForm = ({
  bankAccount,
  handleBankAccountChange,
  handleContextValidation,
}: BankingFormProps) => {
  // context
  const banks = useBanks();
  // state
  const [selectedBank, setSelectedBank] = React.useState<Bank>();
  const [validation, setValidation] = React.useState<
    Partial<BackofficeProfileValidation>
  >({
    agency: true,
    account: true,
  });
  // refs
  const nameRef = React.useRef<HTMLSelectElement>(null);
  const agencyRef = React.useRef<HTMLInputElement>(null);
  const accountRef = React.useRef<HTMLInputElement>(null);
  // helpers
  const agencyParser = numbersAndLettersParser(selectedBank?.agencyPattern);
  const agencyFormatter = hyphenFormatter(selectedBank?.agencyPattern);
  const accountPattern = React.useMemo(
    () =>
      getBankingAccountPattern(
        selectedBank,
        bankAccount?.personType,
        bankAccount?.type
      ),
    [selectedBank, bankAccount?.personType, bankAccount?.type]
  );
  const accountParser = numbersAndLettersParser(accountPattern);
  const accountFormatter = hyphenFormatter(accountPattern);
  const bankWarning = selectedBank?.warning
    ? selectedBank?.warning.split(/\n/g)
    : [];
  // handlers
  const handleInputChange = React.useCallback(
    (field: ProfileBankingFields, value: string) => {
      const newBankAccount = {
        ...bankAccount,
        [field]: value,
      } as Partial<BankAccount>;
      if (field === 'agency') {
        newBankAccount.agencyFormatted = agencyFormatter!(value);
      }
      if (field === 'account') {
        newBankAccount.accountFormatted = accountFormatter!(value);
      }
      if (
        newBankAccount.personType === 'Pessoa Jurídica' &&
        newBankAccount.type &&
        !['Corrente', 'Poupança'].includes(newBankAccount.type)
      ) {
        newBankAccount.type = 'Corrente';
      }
      handleBankAccountChange(newBankAccount);
    },
    [bankAccount, handleBankAccountChange, agencyFormatter, accountFormatter]
  );
  const findSelectedBank = React.useCallback(
    (banks: WithId<Bank>[], bankName: string) => {
      const bank = banks?.find((b) => b.name === bankName);
      setSelectedBank(bank);
    },
    []
  );
  const handleAccount = React.useCallback(() => {
    if (accountPattern && bankAccount?.account) {
      const formatted = numbersAndLettersParser(accountPattern, true)!(
        bankAccount.account
      );
      handleInputChange('account', formatted);
    }
  }, [accountPattern, bankAccount?.account, handleInputChange]);

  // side effects
  React.useEffect(() => {
    if (banks && bankAccount?.name) {
      findSelectedBank(banks, bankAccount?.name);
      const newBankAccount = {
        ...bankAccount,
      };
      if (!bankAccount.personType) newBankAccount.personType = 'Pessoa Física';
      if (!bankAccount.type) newBankAccount.type = 'Corrente';
      handleBankAccountChange(newBankAccount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banks, bankAccount?.name, findSelectedBank]);
  React.useEffect(() => {
    if (selectedBank?.code === '341' && bankAccount?.agency === '0500') {
      setValidation((prev) => ({
        ...prev,
        agency: false,
        message:
          'A iugu ainda não aceita contas Itaú - iti. Escolha outra, por favor.',
      }));
    }
  }, [selectedBank?.code, bankAccount?.agency]);
  React.useEffect(() => {
    if (!bankAccount?.type) return;
    handleAccount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bankAccount?.type]);
  React.useEffect(() => {
    handleContextValidation({
      agency: validation.agency,
      account: validation.account,
      message: validation.message,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validation]);
  // UI
  return (
    <Box>
      <Text mt="4">
        <Text as="span" color="red">
          {t('Aviso:')}
        </Text>
        {t(
          ' a conta precisa estar no nome do entregador ou da sua MEI ou empresa. Se o CNPJ for de MEI, precisará ser conta Pessoa Física. Caso contrário, deverá ser conta corrente no nome da Pessoa Jurídica.'
        )}
      </Text>
      <Text mt="4" mb="2" color="black" fontWeight="700">
        {t('Personalidade da conta:')}
      </Text>
      <RadioGroup
        onChange={(value) => handleInputChange('personType', value as string)}
        value={bankAccount?.personType ?? 'Pessoa Física'}
        colorScheme="green"
        color="black"
        fontSize="15px"
        lineHeight="21px"
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          color="black"
          spacing={8}
          fontSize="16px"
          lineHeight="22px"
        >
          <Radio value="Pessoa Física">{t('Pessoa Física')}</Radio>
          <Radio value="Pessoa Jurídica">{t('Pessoa Jurídica')}</Radio>
        </Stack>
      </RadioGroup>
      <BankSelect
        ref={nameRef}
        value={bankAccount?.name ?? ''}
        onChange={(ev) => handleInputChange('name', ev.target.value)}
        isRequired
      />
      {selectedBank?.warning && (
        <AlertWarning icon={false}>
          {bankWarning.length > 1 &&
            bankWarning.map((item) => {
              return <Text key={item}>{item}</Text>;
            })}
        </AlertWarning>
      )}
      <CustomPatternInput
        id="banking-agency"
        ref={agencyRef}
        label={t('Agência *')}
        placeholder={
          (selectedBank?.agencyPattern.indexOf('D') ?? -1) > -1
            ? t('Número da agência com o dígito')
            : t('Número da agência')
        }
        value={bankAccount?.agency ?? ''}
        onValueChange={(value) => handleInputChange('agency', value)}
        mask={selectedBank?.agencyPattern}
        parser={agencyParser}
        formatter={agencyFormatter}
        onBlur={() => {
          if (bankAccount?.agency && bankAccount.agency.length > 0) {
            const padded = numbersAndLettersParser(
              selectedBank?.agencyPattern,
              true
            )!(bankAccount.agency);
            handleInputChange('agency', padded);
          }
        }}
        isRequired
        isDisabled={!selectedBank}
        notifyParentWithValidation={(isInvalid: boolean) => {
          setValidation((prevState) => ({ ...prevState, agency: !isInvalid }));
        }}
      />
      <Flex>
        <CustomPatternInput
          id="banking-account"
          ref={accountRef}
          flex={3}
          label={t('Conta *')}
          placeholder={
            (selectedBank?.accountPattern.indexOf('D') ?? -1) > -1
              ? t('Número da conta com o dígito')
              : t('Número da conta')
          }
          value={bankAccount?.account ?? ''}
          onValueChange={(value) => handleInputChange('account', value)}
          mask={selectedBank?.accountPattern}
          parser={accountParser}
          formatter={accountFormatter}
          onBlur={handleAccount}
          isRequired
          isDisabled={!selectedBank}
          notifyParentWithValidation={(isInvalid: boolean) => {
            setValidation((prevState) => ({
              ...prevState,
              account: !isInvalid,
            }));
          }}
        />
      </Flex>
      <Text mt="4" mb="2" color="black" fontWeight="700">
        {t('Tipo de conta:')}
      </Text>
      <RadioGroup
        onChange={(value) => handleInputChange('type', value as string)}
        value={bankAccount?.type ?? 'Corrente'}
        colorScheme="green"
        color="black"
        fontSize="15px"
        lineHeight="21px"
      >
        {selectedBank?.code === '104' ? (
          bankAccount?.personType === 'Pessoa Jurídica' ? (
            <Stack
              direction="row"
              alignItems="flex-start"
              color="black"
              spacing={8}
              fontSize="16px"
              lineHeight="22px"
            >
              <Radio value="Corrente">{t('003 – Conta Corrente')}</Radio>
              <Radio value="Poupança">{t('022 – Conta Poupança')}</Radio>
            </Stack>
          ) : (
            <Stack
              mt="2"
              direction="column"
              alignItems="flex-start"
              color="black"
              spacing={4}
              fontSize="16px"
              lineHeight="22px"
            >
              <Radio value="Corrente">{t('001 – Conta Corrente')}</Radio>
              <Radio value="Simples">{t('002 – Conta Simples')}</Radio>
              <Radio value="Poupança">{t('013 – Conta Poupança')}</Radio>
              <Radio value="Nova Poupança">
                {t('1288 – Conta Poupança (novo formato)')}
              </Radio>
            </Stack>
          )
        ) : (
          <Stack
            direction="row"
            alignItems="flex-start"
            color="black"
            spacing={8}
            fontSize="16px"
            lineHeight="22px"
          >
            <Radio value="Corrente">{t('Corrente')}</Radio>
            <Radio value="Poupança">{t('Poupança')}</Radio>
          </Stack>
        )}
      </RadioGroup>
    </Box>
  );
};
