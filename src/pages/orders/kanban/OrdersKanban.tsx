import { Box, Stack, Switch, Text } from '@chakra-ui/react';
import { useBusinessProfile } from 'app/api/business/profile/useBusinessProfile';
import { splitByStatus } from 'app/api/order/selectors';
import { useOrders } from 'app/api/order/useOrders';
import { useContextBusiness } from 'app/state/business/context';
import React from 'react';
import { t } from 'utils/i18n';
import { OrdersKanbanList } from './OrdersKanbanList';

export const OrdersKanban = () => {
  // context
  const business = useContextBusiness();
  //state
  const { updateBusinessProfile } = useBusinessProfile();
  const orders = useOrders();
  const ordersByStatus = splitByStatus(orders);
  // UI
  return (
    <Box>
      <Text mt="9" fontSize="3xl" fontWeight="700" color="black">
        {t('Gerenciador de pedidos')}
      </Text>
      <Switch
        mt="5"
        isChecked={business?.status === 'open'}
        onChange={(ev) => {
          ev.stopPropagation();
          updateBusinessProfile({ status: ev.target.checked ? 'open' : 'closed' });
        }}
      />
      <Stack direction={['column', 'column', 'row']} mt="8" spacing="4">
        {/* <OrdersKanbanList
          title={t('Não confirmados')}
          orders={ordersByStatus['confirming']}
          details={t('Aqui você verá os novos pedidos. Aceite-os para confirmar o preparo.')}
        /> */}
        <OrdersKanbanList
          title={t('Confirmados')}
          orders={ordersByStatus['confirmed']}
          details={t(
            'Aqui você verá os pedidos confirmados que ainda não começaram a ser preparados.'
          )}
        />
        <OrdersKanbanList
          title={t('Em preparação')}
          orders={ordersByStatus['preparing']}
          details={t(
            'Aqui você verá os pedidos que estão sendo preparados por você. Quando clicar em "Pedido pronto” ou o tempo expirar, o entregador estará esperando para buscá-lo.'
          )}
        />
        <OrdersKanbanList
          title={t('Aguardando retirada')}
          orders={ordersByStatus['ready']}
          details={t('Aqui você verá os pedidos aguardando retirada pelo entregador.')}
        />
        <OrdersKanbanList
          title={t('À caminho')}
          orders={ordersByStatus['dispatching']}
          details={t('Aqui você verá os pedidos que estão à caminho da entrega pela entregador.')}
        />
      </Stack>
    </Box>
  );
};