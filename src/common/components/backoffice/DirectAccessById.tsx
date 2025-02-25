import { Box, BoxProps, Button, Icon, Stack, Text } from '@chakra-ui/react';
import { useCustomMutation } from 'app/api/mutation/useCustomMutation';
import { useContextApi } from 'app/state/api/context';
import { useContextFirebaseUser } from 'app/state/auth/context';
import React, { KeyboardEvent } from 'react';
import { VscOpenPreview } from 'react-icons/vsc';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { t } from 'utils/i18n';
import { CustomInput } from '../form/input/CustomInput';
import { Select } from '../form/select/Select';

const orderIdLength = 20;
const businessIdLength = 20;
const courierIdLength = 28;
const consumerIdLength = 28;
// const managerIdLength = 28;

type DataType = 'order' | 'business' | 'courier' | 'consumer' | 'invoice' | 'manager';

export const DirectAccessById = ({ ...props }: BoxProps) => {
  // context
  const api = useContextApi();
  const { userAbility } = useContextFirebaseUser();
  const { url } = useRouteMatch();
  const { push } = useHistory();
  // state
  const [type, setType] = React.useState<DataType>('order');
  const [searchId, setSearchId] = React.useState('');
  // mutations
  const { mutate: getLink, mutationResult: getLinkResult } = useCustomMutation(
    async () => {
      if (type === 'order' && searchId.length < orderIdLength) {
        const orderId = await api.order().getOrderIdByCode(searchId);
        return push(`${url}/${type}/${orderId}`);
      } else if (type === 'business' && searchId.length < businessIdLength) {
        const businessId = await api.business().getBusinessIdByCode(searchId);
        return push(`${url}/${type}/${businessId}`);
      } else if (type === 'courier' && searchId.length < courierIdLength) {
        const courierId = await api.courier().getCourierIdByCode(searchId);
        return push(`${url}/${type}/${courierId}`);
      } else if (type === 'consumer' && searchId.length < consumerIdLength) {
        const consumerId = await api.consumer().getConsumerIdByCode(searchId);
        return push(`${url}/${type}/${consumerId}`);
      } else if (type === 'manager' && searchId.includes('@')) {
        const managerId = await api.manager().getManagerIdByEmail(searchId);
        return push(`${url}/${type}/${managerId}`);
      } else {
        return push(`${url}/${type}/${searchId}`);
      }
    },
    'getLink',
    false
  );
  // handlers
  const getInputLabel = () => {
    if (type === 'invoice') return t('Id:');
    else if (type === 'manager') return t('Id ou e-mail');
    else return t('Id ou código:');
  };
  const handleUserKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      getLink();
    }
  };
  // UI
  return (
    <Box mt="4" border="1px solid #E5E5E5" borderRadius="lg" py="6" px="8" {...props}>
      <Text fontSize="20px" fontWeight="500" color="black">
        {t('Acesso direto:')}
      </Text>
      <Stack mt="2" direction={{ base: 'column', md: 'row' }}>
        <Select
          mt="0"
          maxW={{ md: '140px' }}
          label={t('Tipo de dado:')}
          value={type}
          onChange={(e) => setType(e.target.value as DataType)}
        >
          {userAbility?.can('read', 'orders') && <option value="order">{t('Pedido')}</option>}
          {userAbility?.can('read', 'couriers') && (
            <option value="courier">{t('Entregador')}</option>
          )}
          {userAbility?.can('read', 'businesses') && (
            <option value="business">{t('Restaurante')}</option>
          )}
          {userAbility?.can('read', 'managers') && (
            <option value="manager">{t('Colaborador')}</option>
          )}
          {userAbility?.can('read', 'consumers') && (
            <option value="consumer">{t('Consumidor')}</option>
          )}
          {userAbility?.can('read', 'invoices') && <option value="invoice">{t('Fatura')}</option>}
        </Select>
        <CustomInput
          mt="0"
          maxW={{ md: '220px' }}
          id="direct-access-search"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
          label={getInputLabel()}
          placeholder={t('Digite o valor buscado')}
          onKeyPress={handleUserKeyPress}
        />
        <Button
          w={{ base: '100%', md: 'auto' }}
          h="60px"
          isDisabled={!searchId}
          onClick={() => getLink()}
          isLoading={getLinkResult.isLoading}
          loadingText={t('Buscando...')}
        >
          <Icon as={VscOpenPreview} me="1" />
          {t('Abrir')}
        </Button>
      </Stack>
    </Box>
  );
};
