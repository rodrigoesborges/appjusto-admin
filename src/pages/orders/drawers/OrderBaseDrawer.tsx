import { CookingTimeMode, Order, WithId } from '@appjusto/types';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { useBusinessTotalOrdersByConsumer } from 'app/api/order/useBusinessTotalOrdersByConsumer';
import { useContextBusinessId } from 'app/state/business/context';
import { useOrdersContext } from 'app/state/order';
import { CustomButton } from 'common/components/buttons/CustomButton';
import { phoneFormatter } from 'common/components/form/input/pattern-input/formatters';
import { SectionTitle } from 'pages/backoffice/drawers/generics/SectionTitle';
import { getFoodOrderTotal } from 'pages/backoffice/orders/utils';
import React from 'react';
import { MdPrint } from 'react-icons/md';
import { useRouteMatch } from 'react-router-dom';
import { formatCurrency } from 'utils/formatters';
import { getDateAndHour, getHourAndMinute } from 'utils/functions';
import { t } from 'utils/i18n';
import {
  invoiceStatusPTOptions,
  orderStatusPTOptions,
} from '../../backoffice/utils/index';
import { getDatePlusTime, isScheduledMarginValid } from '../utils';

interface BaseDrawerProps {
  order?: WithId<Order> | null;
  cancellator: string;
  isOpen: boolean;
  cancel(): void;
  isCanceling: boolean;
  onClose(): void;
  children: React.ReactNode;
  printOrder?(): void;
  orderPrinting?: boolean;
  cookingTimeMode?: CookingTimeMode;
}

export const OrderBaseDrawer = ({
  order,
  cancellator,
  cancel,
  isCanceling,
  onClose,
  printOrder,
  orderPrinting,
  cookingTimeMode,
  children,
  ...props
}: BaseDrawerProps) => {
  //context
  const { path } = useRouteMatch();
  const businessId = useContextBusinessId();
  const { changeOrderStatus } = useOrdersContext();
  const consumerTotalOrders = useBusinessTotalOrdersByConsumer(
    businessId,
    order?.consumer.id
  );
  // refs
  const bodyRef = React.useRef<HTMLDivElement>(null);
  // helpers
  const consumerOrders =
    consumerTotalOrders === null
      ? 'N/E'
      : consumerTotalOrders === undefined
      ? 'Carregando...'
      : consumerTotalOrders;
  const invoicedAmount = order ? getFoodOrderTotal(order) : 0;
  const isScheduled = order?.scheduledTo && order?.status === 'scheduled';
  const isHistory = path.includes('orders-history');
  const isCookingTimeModeAuto = cookingTimeMode === 'auto';
  const isCurrierArrived = order?.dispatchingState === 'arrived-pickup';
  const cannotCancelOrder =
    typeof order?.courier?.id === 'string' ||
    (order?.dispatchingStatus === 'outsourced' &&
      order.outsourcedBy !== 'business');
  //handlers
  const handlePrint = () => {
    if (printOrder) return printOrder();
    return null;
  };
  const orderConfirmation = () => {
    if (!order) return;
    if (orderPrinting) handlePrint();
    changeOrderStatus(order.id, 'preparing');
    onClose();
  };
  const PrimaryButtonFunction = () => {
    if (order?.status === 'scheduled') changeOrderStatus(order.id, 'confirmed');
    if (order?.status === 'preparing') changeOrderStatus(order.id, 'ready');
    if (order?.status === 'ready' && order.fulfillment === 'delivery')
      changeOrderStatus(order.id, 'dispatching');
    if (order?.status === 'ready' && order.fulfillment !== 'delivery')
      changeOrderStatus(order.id, 'delivered');
    onClose();
  };
  const updateCookingTimeScroll = () => {
    if (!bodyRef.current) return;
    const scrollNumber = bodyRef.current.scrollHeight - 610;
    bodyRef.current.scrollTop = scrollNumber;
  };
  // side effects
  React.useEffect(() => {
    if (isCanceling && bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [isCanceling]);
  //UI conditions
  let orderDispatched = ['dispatching', 'delivered'].includes(
    order?.status ?? 'not_included'
  );
  let PrimaryButtonIsAble =
    (order?.status === 'scheduled' &&
      isScheduledMarginValid(order.scheduledTo, 5400)) ||
    (!(order?.status === 'preparing' && isCookingTimeModeAuto) &&
      (['confirmed', 'preparing'].includes(order?.status ?? 'not_included') ||
        (order?.status === 'ready' && order.fulfillment !== 'delivery') ||
        (order?.status === 'ready' && isCurrierArrived) ||
        order?.dispatchingStatus === 'outsourced'));
  let PrimaryButtonLabel = 'Pedido pronto';
  if (order?.status === 'scheduled') PrimaryButtonLabel = 'Avançar pedido';
  else if (order?.status === 'ready') PrimaryButtonLabel = 'Entregar pedido';
  //UI
  return (
    <Drawer placement="right" size="lg" onClose={onClose} {...props}>
      <DrawerOverlay>
        <DrawerContent mt={isHistory ? { base: '16', lg: '0' } : '0'}>
          <DrawerCloseButton
            bg="green.500"
            mr="12px"
            _focus={{ outline: 'none' }}
          />
          <DrawerHeader pb="2">
            <Flex
              flexDir={{ base: 'column', md: 'row' }}
              justifyContent="space-between"
              alignItems={{ base: 'flex-start', md: 'flex-end' }}
            >
              <Flex flexDir="column">
                <HStack spacing={4}>
                  <Text
                    mt="4"
                    color="black"
                    fontSize="2xl"
                    fontWeight="700"
                    lineHeight="28px"
                    mb="2"
                  >
                    {t('Pedido Nº')} {order?.code}
                  </Text>
                  <Tooltip
                    placement="right"
                    label={t('Imprimir pedido')}
                    aria-label={t('Imprimir pedido')}
                  >
                    <Button
                      mt="4px !important"
                      size="sm"
                      variant="outline"
                      px="2"
                      h="25px"
                      _focus={{ outline: 'none' }}
                      onClick={() => handlePrint()}
                    >
                      <Icon as={MdPrint} w="20px" h="20px" />
                    </Button>
                  </Tooltip>
                </HStack>
                {order?.status === 'canceled' && (
                  <Text
                    fontSize="md"
                    color="red"
                    fontWeight="700"
                    lineHeight="22px"
                  >
                    {t('Pedido cancelado por:')}{' '}
                    <Text as="span">{cancellator}</Text>
                  </Text>
                )}
                <Text
                  fontSize="md"
                  color="gray.600"
                  fontWeight="500"
                  lineHeight="22px"
                >
                  {t('Nome do cliente:')}{' '}
                  <Text as="span" color="black" fontWeight="700">
                    {order?.consumer?.name ?? 'N/E'}
                  </Text>
                </Text>
                {order?.consumer.email && (
                  <Text
                    fontSize="md"
                    color="gray.600"
                    fontWeight="500"
                    lineHeight="22px"
                  >
                    {t('E-mail do cliente:')}{' '}
                    <Text as="span" color="black" fontWeight="700">
                      {order?.consumer.email}
                    </Text>
                  </Text>
                )}
                {order?.consumer?.phone && (
                  <Text
                    fontSize="md"
                    color="gray.600"
                    fontWeight="500"
                    lineHeight="22px"
                  >
                    {t('Fone do cliente:')}{' '}
                    <Text as="span" color="black" fontWeight="700">
                      {phoneFormatter(order.consumer.phone)}
                    </Text>
                  </Text>
                )}
                <Text
                  fontSize="md"
                  color="gray.600"
                  fontWeight="500"
                  lineHeight="22px"
                >
                  {t('Nº de pedidos:')}{' '}
                  <Text as="span" color="black" fontWeight="700">
                    {consumerOrders}
                  </Text>
                </Text>
                <Text
                  fontSize="md"
                  color="gray.600"
                  fontWeight="500"
                  lineHeight="22px"
                >
                  {t('Horário do pedido:')}{' '}
                  <Text as="span" color="black" fontWeight="700">
                    {getDateAndHour(
                      isScheduled
                        ? order?.timestamps.charged
                        : order?.timestamps.confirmed
                    )}
                  </Text>
                </Text>
                <Text
                  fontSize="md"
                  color="gray.600"
                  fontWeight="500"
                  lineHeight="22px"
                >
                  {t('Atualizado às:')}{' '}
                  <Text as="span" color="black" fontWeight="700">
                    {getDateAndHour(order?.updatedOn)}
                  </Text>
                </Text>
                <Text
                  fontSize="md"
                  color="gray.600"
                  fontWeight="500"
                  lineHeight="22px"
                >
                  {t('Tipo de entrega:')}{' '}
                  <Text as="span" color="black" fontWeight="700">
                    {order?.fulfillment === 'take-away'
                      ? 'Para retirar'
                      : 'Delivery'}
                  </Text>
                </Text>
                {order?.status && order?.status !== 'confirmed' && (
                  <Text
                    fontSize="md"
                    color="gray.600"
                    fontWeight="500"
                    lineHeight="22px"
                  >
                    {t('Status:')}{' '}
                    <Text as="span" color="black" fontWeight="700">
                      {order?.status
                        ? orderStatusPTOptions[order.status]
                        : 'N/E'}
                    </Text>
                  </Text>
                )}
                {order?.status === 'delivered' &&
                  order.fare?.business?.status &&
                  order.fare.business?.status !== 'paid' && (
                    <>
                      <Text
                        fontSize="md"
                        color="gray.600"
                        fontWeight="500"
                        lineHeight="22px"
                      >
                        {t('Status da fatura:')}{' '}
                        <Text as="span" color="red" fontWeight="700">
                          {invoiceStatusPTOptions[order.fare.business.status]}
                        </Text>
                      </Text>
                      <Text
                        fontSize="md"
                        color="gray.600"
                        fontWeight="500"
                        lineHeight="22px"
                      >
                        {t('Valor faturado:')}{' '}
                        <Text as="span" color="black" fontWeight="700">
                          {formatCurrency(invoicedAmount)}
                        </Text>
                      </Text>
                    </>
                  )}
                {isScheduled && (
                  <>
                    <Text
                      fontSize="md"
                      color="gray.600"
                      fontWeight="500"
                      lineHeight="22px"
                    >
                      {t('Início do preparo para:')}{' '}
                      <Text as="span" color="black" fontWeight="700">
                        {order?.confirmedScheduledTo
                          ? getDateAndHour(order.confirmedScheduledTo)
                          : 'N/E'}
                      </Text>
                    </Text>
                    <Text
                      fontSize="md"
                      color="gray.600"
                      fontWeight="500"
                      lineHeight="22px"
                    >
                      {t(
                        `Cliente solicitou ${
                          order?.fulfillment === 'take-away'
                            ? 'retirada'
                            : 'entrega'
                        } entre:`
                      )}{' '}
                      <Text as="span" color="black" fontWeight="700">
                        {getHourAndMinute(order?.scheduledTo!)}
                      </Text>
                      <Text as="span" color="black" fontWeight="700">
                        {` e ${getHourAndMinute(
                          getDatePlusTime(order?.scheduledTo)
                        )}`}
                      </Text>
                    </Text>
                  </>
                )}
              </Flex>
              {!isScheduled && (
                <Flex flexDir="column">
                  <CustomButton
                    label="Abrir chat com o cliente"
                    link={`/app/orders/chat/${order?.id}/${order?.consumer?.id}`}
                    size="sm"
                    variant="outline"
                  />
                </Flex>
              )}
            </Flex>
            {order?.status === 'confirmed' && (
              <Flex
                flexDir={{ base: 'column', md: 'row' }}
                justifyContent="space-between"
                mt="6"
                mb="2"
              >
                <Box>
                  <SectionTitle mt="0">{t('Detalhes do pedido')}</SectionTitle>
                  <Flex color="black" fontSize="xs">
                    <Text
                      fontSize="md"
                      color="gray.600"
                      fontWeight="500"
                      lineHeight="22px"
                    >
                      {t('Tempo de preparo:')}
                    </Text>
                    <Text ml="1" fontSize="md" fontWeight="700">
                      {t(
                        `${
                          order?.cookingTime ? order?.cookingTime / 60 : 'N/I'
                        } min`
                      )}
                      <Text
                        ml="2"
                        display={
                          isCookingTimeModeAuto ? 'none' : 'inline-block'
                        }
                        as="span"
                        color="#4EA031"
                        textDecor="underline"
                        cursor="pointer"
                        onClick={updateCookingTimeScroll}
                      >
                        {t('Alterar')}
                      </Text>
                    </Text>
                  </Flex>
                </Box>
                <Button
                  mt={{ base: '4', md: '0' }}
                  width="full"
                  maxW="260px"
                  fontSize="xl"
                  fontWeight="700"
                  letterSpacing="1px"
                  onClick={orderConfirmation}
                >
                  {t('CONFIRMAR PEDIDO')}
                </Button>
              </Flex>
            )}
          </DrawerHeader>
          <DrawerBody pos="relative" pb="28" ref={bodyRef}>
            <Box
              pos="absolute"
              top="0"
              left="0"
              w="100%"
              h={bodyRef.current?.scrollHeight}
              backgroundColor="white"
              zIndex="-100"
            />
            {children}
          </DrawerBody>
          {!isCanceling && !orderDispatched && order?.status !== 'canceled' && (
            <DrawerFooter borderTop="1px solid #F2F6EA">
              <Flex w="full" justifyContent="flex-start">
                <Flex
                  w="full"
                  maxW="607px"
                  pr="12"
                  flexDir="row"
                  justifyContent={
                    order?.status === 'confirmed'
                      ? 'flex-start'
                      : 'space-between'
                  }
                >
                  <Button
                    width="full"
                    maxW="200px"
                    variant="dangerLight"
                    onClick={cancel}
                    isDisabled={cannotCancelOrder}
                  >
                    {t('Cancelar pedido')}
                  </Button>
                  {order?.status !== 'confirmed' && (
                    <Button
                      isDisabled={!PrimaryButtonIsAble}
                      width="full"
                      maxW="200px"
                      onClick={PrimaryButtonFunction}
                    >
                      {t(PrimaryButtonLabel)}
                    </Button>
                  )}
                </Flex>
              </Flex>
            </DrawerFooter>
          )}
          {order?.status === 'dispatching' &&
            order.outsourcedBy === 'business' && (
              <DrawerFooter borderTop="1px solid #F2F6EA">
                <Flex w="full" justifyContent="flex-start">
                  <Flex
                    w="full"
                    maxW="607px"
                    pr="12"
                    flexDir="row"
                    justifyContent="flex-start"
                  >
                    <Button
                      width="full"
                      maxW="200px"
                      variant="dangerLight"
                      onClick={cancel}
                      isDisabled={cannotCancelOrder}
                    >
                      {t('Cancelar pedido')}
                    </Button>
                  </Flex>
                </Flex>
              </DrawerFooter>
            )}
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};
