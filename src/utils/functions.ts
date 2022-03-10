import {
  BankAccountType,
  BusinessPhone,
  OrderItem,
  OrderItemComplement,
  OrderStatus,
} from '@appjusto/types';
import { AlgoliaCreatedOn } from 'app/api/types';
import { CroppedAreaProps } from 'common/components/ImageCropping';
import { ImageType } from 'common/components/ImageUploads';
import firebase from 'firebase/app';
import I18n from 'i18n-js';
import { round } from 'lodash';
import { useLocation } from 'react-router-dom';
import { formatCurrency, formatDate } from './formatters';

// translation
export const getTranslatedOrderStatus = (status: OrderStatus) => {
  const en = [
    'quote',
    'confirming',
    'confirmed',
    'preparing',
    'ready',
    'dispatching',
    'delivered',
    'canceled',
  ];
  const pt = [
    'Em cotação',
    'Aguardando confirmação',
    'Confirmado',
    'Em preparo',
    'Pedido pronto',
    'Despachando',
    'Entregue',
    'Cancelado',
  ];
  const index = en.indexOf(status);
  return pt[index];
};

//date
export const getDateTime = () => {
  let fullDate = new Date();
  let date = formatDate(fullDate);
  let minutes = fullDate.getMinutes().toString();
  if (minutes.length === 1) minutes = `0${minutes}`;
  let time = `${fullDate.getHours()}:${minutes}`;
  return { date, time };
};

export const getDateAndHour = (
  timestamp?: firebase.firestore.FieldValue | Date,
  onlyDate?: boolean
) => {
  if (!timestamp) return 'N/E';
  try {
    let timeToDate = timestamp;
    if (!(timeToDate instanceof Date)) {
      timeToDate = (timestamp as firebase.firestore.Timestamp).toDate();
    }
    const date = I18n.strftime(timeToDate, '%d/%m/%Y');
    const hour = I18n.strftime(timeToDate, '%H:%M');
    if (onlyDate) return date;
    return `${date} ${hour}`;
  } catch (error) {
    console.log(error);
    return 'N/E';
  }
};

export const getHourAndMinute = (timestamp?: firebase.firestore.FieldValue | Date) => {
  if (!timestamp) return 'N/E';
  try {
    let timeToDate = timestamp;
    if (!(timeToDate instanceof Date)) {
      timeToDate = (timestamp as firebase.firestore.Timestamp).toDate();
    }
    const hour = I18n.strftime(timeToDate, '%H:%M');
    return hour;
  } catch (error) {
    console.log(error);
    return 'N/E';
  }
};

export const getAlgoliaFieldDateAndHour = (timestamp: firebase.firestore.FieldValue | number) => {
  if (typeof timestamp === 'number') {
    try {
      const date = new Date(timestamp).toLocaleDateString();
      const hour = new Date(timestamp).toLocaleTimeString();
      return `${date} - ${hour}`;
    } catch (error) {
      console.log(error);
      return 'Erro';
    }
  } else {
    try {
      const date = new Date(
        ((timestamp as unknown) as AlgoliaCreatedOn)._seconds * 1000
      ).toLocaleDateString();
      const hour = new Date(
        ((timestamp as unknown) as AlgoliaCreatedOn)._seconds * 1000
      ).toLocaleTimeString();
      return `${date} - ${hour}`;
    } catch (error) {
      console.log(error);
      return 'Erro';
    }
  }
};

export const getTimestampMilliseconds = (timestamp?: firebase.firestore.Timestamp) => {
  if (!timestamp) return null;
  return timestamp.seconds * 1000;
};

export const getTimeUntilNow = (serverTime: number, baseTime: number, reverse: boolean = false) => {
  //const now = new Date().getTime();
  if (reverse) {
    let elapsedTime = (baseTime - serverTime) / 1000 / 60;
    if (elapsedTime < 0) elapsedTime = 0;
    return round(elapsedTime, 0);
  }
  const elapsedTime = (serverTime - baseTime) / 1000 / 60;
  return round(elapsedTime, 0);
};

// pricing
const getProductTotalPrice = (price: number, complements: OrderItemComplement[] | undefined) => {
  let complementsPrice = 0;
  if (complements) {
    complementsPrice =
      complements.reduce((n1: number, n2: OrderItemComplement) => n1 + n2.price, 0) || 0;
  }
  return price + complementsPrice;
};

export const getOrderTotalPrice = (items: OrderItem[]) => {
  let total = 0;
  items.map((item: OrderItem) => {
    let priceByquantity = item.quantity * item.product.price;
    return (total += getProductTotalPrice(priceByquantity, item.complements));
  });
  return total;
};

export const getProdTotalPriceToDisplay = (
  price: number,
  complements: OrderItemComplement[] | undefined
) => formatCurrency(getProductTotalPrice(price, complements));

export const getOrderTotalPriceToDisplay = (items: OrderItem[]) =>
  formatCurrency(getOrderTotalPrice(items));

// images
const createImage = (url: string) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getRadianAngle = (degreeValue: number) => {
  return (degreeValue * Math.PI) / 180;
};

export const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: CroppedAreaProps,
  //rotation = 0,
  ratio: number,
  resizedWidth: number,
  imageType: ImageType = 'image/jpeg'
) => {
  const image = (await createImage(imageSrc)) as HTMLImageElement;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));
  // set each dimensions to double largest dimension to allow for a safe area for the
  // image to rotate in without being clipped by canvas context
  canvas.width = safeArea;
  canvas.height = safeArea;
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // translate canvas context to a central location on image to allow rotating around the center.
    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate(getRadianAngle(0));
    ctx.translate(-safeArea / 2, -safeArea / 2);
    // draw rotated image and store data.
    ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);
    const data = ctx.getImageData(0, 0, safeArea, safeArea);
    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    // paste generated rotate image with correct offsets for x,y crop values.
    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );
    // As Base64 string
    // return canvas.toDataURL('image/jpeg');
    // As a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(async (file) => {
        if (!file) return;
        try {
          const url = URL.createObjectURL(file);
          const result = await getResizedImage(url, ratio, resizedWidth, imageType);
          resolve(result);
        } catch (error) {
          console.log('getCroppedImg Error', error);
          reject(null);
        }
      }, imageType);
    });
  }
};

export const getResizedImage = async (
  imageSrc: string,
  ratio: number,
  resizedWidth: number,
  imageType: ImageType = 'image/jpeg'
) => {
  const image = (await createImage(imageSrc)) as HTMLImageElement;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const pixelRatio = window.devicePixelRatio;
  canvas.width = resizedWidth * pixelRatio;
  canvas.height = (resizedWidth / ratio) * pixelRatio;
  if (ctx) {
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, resizedWidth, resizedWidth / ratio);
    //ctx.fillStyle = 'white';
    //ctx.fillRect(0, 0, canvas.width, canvas.height);
    return new Promise((resolve) => {
      canvas.toBlob((file) => {
        resolve(file);
      }, imageType);
    });
  }
};

// geo
type latLng = {
  lat: number;
  lng: number;
};
export const getCoordinatesMidpoint = (origin: latLng, destination: latLng) => {
  try {
    let midLat =
      origin.lat > destination.lat
        ? (origin.lat - destination.lat) / 2 + destination.lat
        : (destination.lat - origin.lat) / 2 + origin.lat;
    let midLng =
      origin.lng > destination.lng
        ? (origin.lng - destination.lng) / 2 + destination.lng
        : (destination.lng - origin.lng) / 2 + origin.lng;
    return { lat: midLat, lng: midLng };
  } catch {
    return undefined;
  }
};

// orders
export const getOrderCancellator = (issueIype?: string) => {
  let cancelator = 'N/E';
  if (issueIype?.includes('restaurant')) cancelator = 'Restaurante';
  if (issueIype?.includes('consumer')) cancelator = 'Cliente';
  if (issueIype?.includes('courier')) cancelator = 'Entregador';
  if (issueIype?.includes('agent')) cancelator = 'Agente Appjusto';
  return cancelator;
};

// url
export const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// Banking > CEF
export const getCEFAccountCode = (
  bankingCode: string,
  personType: 'Pessoa Jurídica' | 'Pessoa Física',
  type: BankAccountType
) => {
  let operation = '';
  if (bankingCode !== '104') return operation;
  if (personType === 'Pessoa Jurídica') {
    if (type === 'Corrente') {
      operation = '0030';
    } else if (type === 'Poupança') {
      operation = '0220';
    }
  } else if (personType === 'Pessoa Física') {
    if (type === 'Corrente') {
      operation = '0010';
    } else if (type === 'Simples') {
      operation = '0020';
    } else if (type === 'Poupança') {
      operation = '0130';
    } else if (type === 'Nova Poupança') {
      operation = '1288';
    }
  }
  return operation;
};

export const slugfyName = (name: string) => {
  return name.toLowerCase().split(' ').join('-');
};

// phones

export const serializePhones = (phones: BusinessPhone[]) => {
  return phones.filter((phone) => phone.number !== '');
};

export const assertPhonesIsValid = (phones: BusinessPhone[]) => {
  console.log('assertPhonesIsValid', phones);
  if (!phones) return false;
  else if (phones.length === 1 && phones[0].number === '') return false;
  else return true;
};
