import { useContextApi } from 'app/state/api/context';
import React from 'react';
import * as Sentry from '@sentry/react';

interface DeltaInfo {
  delta: number;
  updatedOn: Date;
}
const KEY = 'server-time';
const THRESHOLD = 1000 * 60 * 60 * 24; // day
const retrieve = () => {
  try {
    const value = window.localStorage.getItem(KEY);
    if (value) {
      const info = JSON.parse(value) as DeltaInfo;
      return { ...info, updatedOn: new Date(info.updatedOn) } as DeltaInfo;
    }
  } catch (error: any) {}
  return null;
};

const store = (delta: number) => {
  try {
    const now = new Date();
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        delta,
        updatedOn: now,
      } as DeltaInfo)
    );
  } catch (error: any) {}
};

const expired = (info: DeltaInfo | null) => {
  if (!info) return true;
  const now = new Date();
  return now.getTime() - info.updatedOn.getTime() > THRESHOLD;
};

export const useServerTime = (loggedUser: boolean) => {
  // context
  const api = useContextApi();
  // state
  const [delta, setDelta] = React.useState<number>(0);
  // handlers
  const getServerTime = React.useCallback(() => new Date(new Date().getTime() + delta), [delta]);
  // side effects
  React.useEffect(() => {
    if (!loggedUser) return;
    (async () => {
      try {
        const info = retrieve();
        if (expired(info)) {
          const serverTime = await api.platform().getServerTime();
          const newDelta = serverTime - new Date().getTime();
          console.log('Atualizando o sever time com delta de ', newDelta);
          store(newDelta);
          setDelta(newDelta);
        } else {
          console.log('Recuperando o delta de server time', info!.delta);
          setDelta(info!.delta);
        }
      } catch (error) {
        console.log('Erro ao acessar o delta de server time:', error);
        Sentry.captureException(error);
      }
    })();
  }, [api, loggedUser]);
  // result
  return getServerTime;
};
