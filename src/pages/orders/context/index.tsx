import { splitByStatus } from 'app/api/order/selectors';
import { useOrders } from 'app/api/order/useOrders';
import { useContextApi } from 'app/state/api/context';
import { useContextBusiness } from 'app/state/business/context';
import { Business, Issue, Order, OrderItem, OrderStatus, WithId } from 'appjusto-types';
//@ts-ignore
import bellDing from 'common/sounds/bell-ding.mp3';
import React from 'react';
import useSound from 'use-sound';
import { updateLocalStorageOrders, updateLocalStorageOrderTime } from 'utils/functions';

const fakeItem = (price: number, qtd: number): OrderItem => {
  return {
    id: Math.random().toString(),
    product: {
      name: 'Item',
      price: price, // in cents
      id: Math.random().toString(),
      externalId: '',
    },
    quantity: qtd,
    notes: '',
  };
};

const fakeOrder: Order = {
  type: 'food',
  code: `${Math.random().toString().split('', 6).join('').replace('.', '')}`,
  seq: `${Math.random().toString().split('', 4).join('').replace('.', '')}`,
  status: 'confirming',
  // comments: 'cpf',
  consumer: {
    id: 'kW8M4T19IdP8VCrxOwAHJoTzsK33',
    name: 'Renan',
    // cpf: '35214602820',
  },
  courier: {
    id: 'kW8M4T19IdP8VCrxOwAHJoTzsK33',
    name: 'Kelly',
    mode: 'motocycle',
    joined: ('1 de fevereiro de 2021 00:00:00 UTC-3' as unknown) as firebase.firestore.Timestamp,
    location: {
      latitude: -8.0591539,
      longitude: -34.9063069,
    },
  },
  business: {
    id: 'KTqDLkMSAq6vigc0ODDr',
    name: 'Itapuama vegan',
  },
  items: [fakeItem(1200, 1), fakeItem(1600, 2)],
  origin: {
    address: {
      main: 'Rua João Ivo da Silva, 453',
      description: '',
    },
    additionalInfo: '',
    intructions: '',
    location: {
      latitude: -8.0622085,
      longitude: -34.9115396,
    },
  },
  destination: {
    address: {
      main: 'Rua bom pastor, 1485',
      description: '',
    },
    additionalInfo: '',
    intructions: '',
    location: {
      latitude: -8.0502801,
      longitude: -34.9396646,
    },
  },
  route: {
    distance: 4500, // in meters
    duration: 14 * 60, // in seconds
    polyline: '',
    issue: null,
  },
  dispatchingState: 'idle',
};

export type localOrderType = { code: string; time: number };

interface ContextProps {
  business: WithId<Business> | null | undefined;
  ordersByStatus: any;
  getOrderById(id: string): WithId<Order> | undefined;
  createFakeOrder(): void;
  changeOrderStatus(orderId: string, status: OrderStatus): void;
  setOrderCookingTime(orderId: string, cookingTime: number | null): void;
  fetchCancelOptions(): Promise<WithId<Issue>[]>;
  cancelOrder(orderId: string, issue: WithId<Issue>): void;
  //getOrderIssue(orderId: string): void;
}

const OrdersContext = React.createContext<ContextProps>({} as ContextProps);

const options = { active: true, inactive: true };

interface ProviderProps {
  children: React.ReactNode | React.ReactNode[];
}

export const OrdersContextProvider = (props: ProviderProps) => {
  // context
  const api = useContextApi();
  const business = useContextBusiness();
  const hookOrders = useOrders(options, business!.id);

  //state
  const [orders, setOrders] = React.useState<WithId<Order>[]>([]);
  const ordersByStatus = splitByStatus(orders);

  // order sound
  const [playBell] = useSound(bellDing, { volume: 0.25 });

  //Development
  const createFakeOrder = async () => {
    await api.order().createFakeOrder(fakeOrder);
  };

  //handlers
  const getOrderById = (id: string) => {
    const order = orders.find((order: WithId<Order>) => order.id === id);
    return order;
  };

  const changeOrderStatus = async (orderId: string, status: OrderStatus) => {
    if (status === 'preparing') updateLocalStorageOrderTime(orderId);
    // optimistic update to avoid flickering
    setOrders((prevOrders) => {
      let newOrders = prevOrders.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status,
          };
        } else {
          return order;
        }
      });
      return newOrders;
    });
    // firestore update
    await api.order().updateOrder(orderId, { status });
  };

  const setOrderCookingTime = async (orderId: string, cookingTime: number | null) => {
    await api.order().updateOrder(orderId, { cookingTime });
  };

  const fetchCancelOptions = React.useCallback(async () => {
    const options = await api.order().fetchIssues('restaurant-cancel');
    return options;
  }, [api]);

  const cancelOrder = async (orderId: string, issue: WithId<Issue>) => {
    await api.order().updateOrder(orderId, { status: 'canceled' });
    await api.order().setOrderIssue(orderId, issue);
  };

  //const getOrderIssue = async (orderId: string) => {
  // without permission
  //const issues = await api.order().getOrderIssue(orderId);
  //console.log(issues);
  //};

  // side effects
  React.useEffect(() => {
    if (hookOrders) {
      setOrders(hookOrders);
      updateLocalStorageOrders(hookOrders, playBell);
    }
  }, [hookOrders]);

  // provider
  return (
    <OrdersContext.Provider
      value={{
        business,
        ordersByStatus,
        getOrderById,
        createFakeOrder,
        changeOrderStatus,
        setOrderCookingTime,
        fetchCancelOptions,
        cancelOrder,
        //getOrderIssue,
      }}
      {...props}
    />
  );
};

export const useOrdersContext = () => {
  const context = React.useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrdersContext must be used within the OrdersContextProvider');
  }
  return context;
};