import { Box, BoxProps, Button, Icon, Link, Stack, Text } from '@chakra-ui/react';
import { useContextApi } from 'app/state/api/context';
import { useContextAppRequests } from 'app/state/requests/context';
import React from 'react';
import { VscOpenPreview } from 'react-icons/vsc';
import { Link as RouterLink, useHistory, useRouteMatch } from 'react-router-dom';
import { t } from 'utils/i18n';
import { CustomInput } from '../form/input/CustomInput';
import { Select } from '../form/select/Select';

type DataType = 'order' | 'business' | 'courier' | 'consumer' | 'invoice';

export const DirectAccessById = ({ ...props }: BoxProps) => {
  // context
  const { url } = useRouteMatch();
  const { push } = useHistory();
  const api = useContextApi();
  const { dispatchAppRequestResult } = useContextAppRequests();
  // state
  const [type, setType] = React.useState<DataType>('order');
  const [searchId, setSearchId] = React.useState('');
  const [dynamicLink, setDynamicLink] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);
  // handlers
  const getOrderIdByOrderCode = React.useCallback(async () => {
    setIsLoading(true);
    const orderId = await api.order().getOrderIdByOrderCode(searchId);
    console.log('orderId', orderId);
    if (orderId) push(`${url}/${type}/${orderId}`);
    else
      dispatchAppRequestResult({
        status: 'error',
        requestId: 'get-order-id-by-code',
        message: { title: 'Não foi possível encontrar um id para o código de pedido informado.' },
      });
    setIsLoading(false);
  }, [api, push, url, type, searchId, dispatchAppRequestResult]);
  // side effects
  React.useEffect(() => {
    if (!type || !searchId) {
      setDynamicLink(undefined);
      return;
    }
    if (type === 'order' && searchId.length < 18) {
      return;
    }
    setDynamicLink(`${type}/${searchId}`);
  }, [api, type, searchId, getOrderIdByOrderCode]);
  console.log('dynamicLink', dynamicLink);
  // UI
  return (
    <Box mt="4" border="1px solid #F6F6F6" borderRadius="lg" py="6" px="8" {...props}>
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
          <option value="order">{t('Pedido')}</option>
          <option value="courier">{t('Entregador')}</option>
          <option value="business">{t('Restaurante')}</option>
          <option value="consumer">{t('Cliente')}</option>
          <option value="invoice">{t('Fatura')}</option>
        </Select>
        <CustomInput
          mt="0"
          maxW={{ md: '220px' }}
          id="direct-access-search"
          value={searchId}
          onChange={(event) => setSearchId(event.target.value)}
          label={type === 'order' ? t('Id ou código:') : t('Id:')}
          placeholder={t('Digite o id')}
        />
        {type === 'order' && searchId.length < 18 ? (
          <Button
            w={{ base: '100%', md: 'auto' }}
            h="60px"
            isDisabled={!searchId}
            isLoading={isLoading}
            onClick={getOrderIdByOrderCode}
          >
            <Icon as={VscOpenPreview} me="1" />
            {t('Abrir')}
          </Button>
        ) : (
          <Link
            as={RouterLink}
            to={dynamicLink ? `${url}/${dynamicLink}` : url}
            _hover={{ textDecor: 'none' }}
          >
            <Button w={{ base: '100%', md: 'auto' }} h="60px" isDisabled={!searchId}>
              <Icon as={VscOpenPreview} me="1" />
              {t('Abrir')}
            </Button>
          </Link>
        )}
      </Stack>
    </Box>
  );
};
