import * as cpfutils from '@fnando/cpf';
import { useBusinessBankAccount } from 'app/api/business/profile/useBusinessBankAccount';
import { useBusinessProfile } from 'app/api/business/profile/useBusinessProfile';
import { useUpdateManagerProfile } from 'app/api/manager/useUpdateManagerProfile';
import { BankAccount, Business, ManagerProfile, WithId } from 'appjusto-types';
import { SuccessAndErrorHandler } from 'common/components/SuccessAndErrorHandler';
import { isEmpty } from 'lodash';
import React, { Dispatch, SetStateAction } from 'react';
import { useParams } from 'react-router';
import { useContextManagerProfile } from '../manager/context';
import { businessBOReducer, businessBOState } from './businessBOReducer';
import { useContextBusiness } from './context';

const bankAccountSet = (bankAccount: BankAccount): boolean => {
  return (
    !isEmpty(bankAccount.name) && !isEmpty(bankAccount.agency) && !isEmpty(bankAccount.account)
  );
};

type Validation = {
  cpf: boolean;
  phone: boolean;
  agency: boolean;
  account: boolean;
};

interface BusinessBOContextProps {
  manager?: WithId<ManagerProfile> | null;
  bankAccount?: WithId<BankAccount> | null;
  business?: WithId<Business> | null;
  contextValidation: Validation;
  isLoading: boolean;
  handleBusinessStatusChange(key: string, value: any): void;
  handleManagerProfileChange(key: string, value: any): void;
  handleBankingInfoChange(key: string, value: any): void;
  setContextValidation: Dispatch<SetStateAction<Validation>>;
  handleSave(): void;
}

const BusinessBOContext = React.createContext<BusinessBOContextProps>({} as BusinessBOContextProps);

interface Props {
  children: React.ReactNode | React.ReactNode[];
}

type Params = {
  businessId: string;
};

export const BusinessBOProvider = ({ children }: Props) => {
  // context
  const { businessId } = useParams<Params>();
  const { setBusinessId, business } = useContextBusiness();
  const { manager, setManagerEmail } = useContextManagerProfile();
  const {
    bankAccount,
    updateBankAccount,
    updateResult: BankAccountResult,
  } = useBusinessBankAccount();
  const { updateBusinessProfile, updateResult: BusinessProfileResult } = useBusinessProfile();
  const { updateProfile, updateResult: ManagerProfileResult } = useUpdateManagerProfile();

  // state
  const [state, dispatch] = React.useReducer(businessBOReducer, {} as businessBOState);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState({ status: false, error: {} as unknown, message: '' });
  const [contextValidation, setContextValidation] = React.useState({
    cpf: true,
    phone: true,
    agency: true,
    account: true,
  });

  // refs
  const submission = React.useRef(0);

  // helpers
  const getResult = React.useCallback(() => {
    if (
      ManagerProfileResult.isLoading ||
      BankAccountResult.isLoading ||
      BusinessProfileResult.isLoading
    )
      setIsLoading(true);
    else setIsLoading(false);

    if (
      ManagerProfileResult.isSuccess &&
      BankAccountResult.isSuccess &&
      BusinessProfileResult.isSuccess
    )
      setIsSuccess(true);
    else setIsSuccess(false);

    if (ManagerProfileResult.error)
      setError({
        status: true,
        error: ManagerProfileResult.error,
        message: 'Não foi possível acessar o servidor',
      });
    if (BankAccountResult.error)
      setError({
        status: true,
        error: BankAccountResult.error,
        message: 'Não foi possível acessar o servidor',
      });
    if (BusinessProfileResult.error)
      setError({
        status: true,
        error: BusinessProfileResult.error,
        message: 'Não foi possível acessar o servidor',
      });
  }, [ManagerProfileResult, BankAccountResult, BusinessProfileResult]);

  // handlers
  const handleBusinessStatusChange = (key: string, value: any) => {
    dispatch({ type: 'update_business', payload: { [key]: value } });
  };

  const handleManagerProfileChange = (key: string, value: any) => {
    dispatch({ type: 'update_manager', payload: { [key]: value } });
  };

  const handleBankingInfoChange = (key: string, value: any) => {
    dispatch({ type: 'update_banking', payload: { [key]: value } });
  };

  const handleSave = () => {
    submission.current += 1;
    const { cpf, phone, agency, account } = contextValidation;
    if (!cpf) return setError({ status: true, error: {}, message: 'O CPF informado não é válido' });
    if (!phone)
      return setError({ status: true, error: {}, message: 'O cecular informado não é válido' });
    if (!agency)
      return setError({ status: true, error: {}, message: 'A agência informada não é válida' });
    if (!account)
      return setError({ status: true, error: {}, message: 'A agência informada não é válida' });
    if (state.manager !== manager) updateProfile(state.manager);
    if (state.bankingInfo !== bankAccount) updateBankAccount(state.bankingInfo);
    if (state.businessProfile !== business) updateBusinessProfile(state.businessProfile);
  };

  // side effects
  React.useEffect(() => {
    if (businessId) setBusinessId(businessId);
  }, [businessId]);

  React.useEffect(() => {
    if (business && business?.managers) {
      setManagerEmail(business?.managers[0] ?? null);
    } else setManagerEmail(null);
  }, [business, setManagerEmail]);

  React.useEffect(() => {
    if (manager) dispatch({ type: 'update_manager', payload: manager });
  }, [manager]);

  React.useEffect(() => {
    if (bankAccount && bankAccountSet(bankAccount))
      dispatch({ type: 'update_banking', payload: bankAccount });
  }, [bankAccount]);

  React.useEffect(() => {
    if (business) dispatch({ type: 'update_business', payload: business });
  }, [business]);

  React.useEffect(() => {
    getResult();
  }, [ManagerProfileResult, BankAccountResult, BusinessProfileResult, getResult]);

  React.useEffect(() => {
    if (state?.manager?.phone)
      setContextValidation((prev) => ({ ...prev, phone: state.manager.phone?.length === 11 }));
    if (state?.manager?.cpf)
      setContextValidation((prev) => ({ ...prev, cpf: cpfutils.isValid(state.manager.cpf!) }));
  }, [state?.manager?.phone, state?.manager?.cpf]);

  // UI
  return (
    <BusinessBOContext.Provider
      value={{
        manager: state.manager,
        bankAccount: state.bankingInfo,
        business: state.businessProfile,
        contextValidation,
        isLoading,
        handleBusinessStatusChange,
        handleManagerProfileChange,
        handleBankingInfoChange,
        setContextValidation,
        handleSave,
      }}
    >
      {children}
      <SuccessAndErrorHandler
        submission={submission.current}
        isSuccess={isSuccess}
        isError={error.status}
        error={error.error}
        errorMessage={{ title: error.message }}
      />
    </BusinessBOContext.Provider>
  );
};

export const useContextBusinessBackoffice = () => {
  return React.useContext(BusinessBOContext);
};
