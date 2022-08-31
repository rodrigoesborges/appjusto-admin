import { Invoice, WithId } from '@appjusto/types';
import { formatCurrency } from 'utils/formatters';

export type InvoicesCosts = { value: number; fee: number };

export const formatCents = (value: string) =>
  parseInt(value.replace(/\D+/g, ''));

export const formatIuguValueToDisplay = (value: string) => {
  if (value.includes('R$')) return value;
  else return formatCurrency(formatCents(value));
};

export const formatIuguDateToDisplay = (date: string) => {
  const dateArr = date.split('-');
  return `${dateArr[2]}/${dateArr[1]}/${dateArr[0]}`;
};

// export const calculateAppJustoCosts = (amount: number) => {
//   const fee = 0.05;
//   const value = amount * fee;
//   return { value, fee };
// };
export const calculateAppJustoCosts = (
  amount: number,
  invoices: WithId<Invoice>[]
) => {
  const value = invoices.reduce((total, invoice) => {
    return (total += invoice.fare?.commission ?? 0);
  }, 0);
  const fee = value / amount;
  return { value, fee };
};

export const calculateIuguValue = (invoices: WithId<Invoice>[]) => {
  const value = invoices.reduce((total, invoice) => {
    return (total += invoice.fare?.processing?.value ?? 0);
  }, 0);
  return value;
};

export const calculateIuguCosts = (amount: number, iuguValue: number) => {
  const fee = iuguValue / amount;
  return { value: iuguValue, fee };
};
