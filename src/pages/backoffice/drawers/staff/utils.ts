import { UserPermissions } from '@appjusto/types';
import { isEqual } from 'lodash';

export type GenericMode =
  | 'owner'
  | 'orders-manager'
  | 'couriers-manager'
  | 'consumers-manager'
  | 'businesses-manager'
  | 'viewer'
  | 'custom';

const backofficeOwnerObject = {
  orders: ['c', 'r', 'u', 'd'],
  couriers: ['c', 'r', 'u', 'd'],
  consumers: ['c', 'r', 'u', 'd'],
  businesses: ['c', 'r', 'u', 'd'],
  menu: ['c', 'r', 'u', 'd'],
  chats: ['c', 'r', 'u', 'd'],
  invoices: ['c', 'r', 'u', 'd'],
  withdraws: ['c', 'r', 'u', 'd'],
  advances: ['c', 'r', 'u', 'd'],
  managers: ['c', 'r', 'u', 'd'],
  recommendations: ['c', 'r', 'u', 'd'],
  staff: ['c', 'r', 'u', 'd'],
  users: ['c', 'r', 'u', 'd'],
  platform: ['c', 'r', 'u', 'd'],
} as UserPermissions;

const ordersManagerObject = {
  orders: ['r', 'u'],
  couriers: ['r', 'u'],
  consumers: ['r'],
  businesses: ['r', 'u'],
  menu: ['r'],
  chats: ['r'],
  invoices: ['r'],
  withdraws: ['r'],
  advances: ['r'],
  managers: ['r', 'u'],
  recommendations: ['r', 'u'],
  staff: [],
  users: ['r'],
  platform: [],
} as UserPermissions;

const consumersManagerObject = {
  orders: ['r'],
  couriers: [],
  consumers: ['r', 'u'],
  businesses: ['r'],
  menu: ['r'],
  chats: ['r'],
  invoices: ['r'],
  withdraws: ['r'],
  advances: ['r'],
  managers: ['r'],
  recommendations: ['r', 'u'],
  staff: [],
  users: ['r'],
  platform: [],
} as UserPermissions;

const couriersManagerObject = {
  orders: ['r'],
  couriers: ['r', 'u'],
  consumers: [],
  businesses: ['r'],
  menu: ['r'],
  chats: ['r'],
  invoices: ['r'],
  withdraws: ['r'],
  advances: ['r'],
  managers: ['r'],
  recommendations: ['r'],
  staff: [],
  users: ['r'],
  platform: [],
} as UserPermissions;

const businessesManagerObject = {
  orders: ['r'],
  couriers: [],
  consumers: [],
  businesses: ['c', 'r', 'u', 'd'],
  menu: ['c', 'r', 'u', 'd'],
  chats: ['r'],
  invoices: ['r'],
  withdraws: ['r'],
  advances: ['r'],
  managers: ['r'],
  recommendations: ['r', 'u'],
  staff: [],
  users: ['r'],
  platform: [],
} as UserPermissions;

const viewerObject = {
  orders: ['r'],
  couriers: ['r'],
  consumers: ['r'],
  businesses: ['r'],
  menu: ['r'],
  chats: ['r'],
  invoices: ['r'],
  withdraws: ['r'],
  advances: ['r'],
  managers: ['r'],
  recommendations: ['r'],
  staff: ['r'],
  users: ['r'],
  platform: ['r'],
} as UserPermissions;

export const getGenericModePermissions = (mode: GenericMode): UserPermissions => {
  if (mode === 'owner') return backofficeOwnerObject;
  else if (mode === 'orders-manager') return ordersManagerObject;
  else if (mode === 'consumers-manager') return consumersManagerObject;
  else if (mode === 'couriers-manager') return couriersManagerObject;
  else if (mode === 'businesses-manager') return businessesManagerObject;
  else if (mode === 'viewer') return viewerObject;
  else {
    return {
      orders: [],
      couriers: [],
      consumers: [],
      businesses: [],
      menu: [],
      chats: [],
      invoices: [],
      withdraws: [],
      advances: [],
      managers: [],
      recommendations: [],
      staff: [],
      users: [],
      platform: [],
    };
  }
};

export const getGenericModeRole = (permissions: UserPermissions): GenericMode => {
  if (isEqual(permissions, backofficeOwnerObject)) return 'owner';
  else if (isEqual(permissions, ordersManagerObject)) return 'orders-manager';
  else if (isEqual(permissions, consumersManagerObject)) return 'consumers-manager';
  else if (isEqual(permissions, couriersManagerObject)) return 'couriers-manager';
  else if (isEqual(permissions, businessesManagerObject)) return 'businesses-manager';
  else if (isEqual(permissions, viewerObject)) return 'viewer';
  else return 'custom';
};