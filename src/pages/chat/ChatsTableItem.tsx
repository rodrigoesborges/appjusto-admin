import { Icon, Td, Text, Tr, VStack } from '@chakra-ui/react';
import { OrderChatGroup } from 'app/api/business/chat/useBusinessChats';
import { CustomButton } from 'common/components/buttons/CustomButton';
import { useOrdersContext } from 'pages/orders/context';
import { useRouteMatch } from 'react-router';
import { t } from 'utils/i18n';

interface ChatsTableItemProps {
  chat: OrderChatGroup;
}

const flavorsPT = {
  courier: 'Entregador',
  consumer: 'Cliente',
};

export const ChatsTableItem = ({ chat }: ChatsTableItemProps) => {
  // context
  const { path } = useRouteMatch();
  const { orders } = useOrdersContext();
  const order = orders ? orders.find((order) => order.id === chat.orderId) : null;

  // helpers
  const newMessage = true;

  const orderCode = order?.code ?? 'N/E';

  const counterpartName = (counterpartId: string) => {
    const isCourier = order?.courier?.id === counterpartId;
    let name = 'N/E';
    if (isCourier) name = order?.courier?.name!;
    else name = order?.consumer.name!;
    return name;
  };

  //  UI
  return (
    <Tr color="black" fontSize="15px" lineHeight="21px">
      <Td>#{orderCode}</Td>
      <Td>
        <VStack spacing={4} alignItems="flex-start">
          {chat.counterParts.map((part) => (
            //@ts-ignore
            <Text key={part.id}>{flavorsPT[part.flavor]}</Text>
          ))}
        </VStack>
      </Td>
      <Td>
        <VStack spacing={4} alignItems="flex-start">
          {chat.counterParts.map((part) => (
            <Text key={part.id}>{counterpartName(part.id)}</Text>
          ))}
        </VStack>
      </Td>
      <Td w={{ lg: '180px' }} textAlign="center">
        <VStack spacing={4}>
          {chat.counterParts.map((part) => (
            <Icon
              key={part.id}
              mt="-2px"
              viewBox="0 0 200 200"
              color={newMessage ? 'green.500' : 'gray.50'}
            >
              <path
                fill="currentColor"
                d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
              />
            </Icon>
          ))}
        </VStack>
      </Td>
      <Td>
        <VStack spacing={4} alignItems="flex-end">
          {chat.counterParts.map((part) => (
            <CustomButton
              key={part.id}
              mt="0"
              w="200px"
              variant="outline"
              label={t('Abrir chat')}
              link={`${path}/${chat.orderId}/${part.id}`}
              size="sm"
            />
          ))}
        </VStack>
      </Td>
    </Tr>
  );
};
