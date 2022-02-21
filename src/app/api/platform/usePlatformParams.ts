import { useContextApi } from 'app/state/api/context';
import { PlatformParams } from '@appjusto/types';
import React from 'react';
import { useServerTime } from './useServerTime';
import dayjs from 'dayjs';

export const usePlatformParams = () => {
  // context
  const api = useContextApi();
  const getServerTime = useServerTime(true);
  // state
  const [params, setParams] = React.useState<PlatformParams | null>();
  const [isPlatformLive, setIsPlatformLive] = React.useState(true);
  // side effects
  React.useEffect(() => {
    const unsub = api.platform().observeParams(setParams);
    return () => unsub();
  }, [api]);

  React.useEffect(() => {
    if (!params?.consumer.support) return;
    const { support } = params.consumer;
    const startH = parseInt(support.starts.slice(0, 2));
    const startM = parseInt(support.starts.slice(2));
    const endH = parseInt(support.ends.slice(0, 2));
    const endM = parseInt(support.ends.slice(2));
    const now = getServerTime();
    const start = dayjs().hour(startH).minute(startM).toDate();
    const end = dayjs().hour(endH).minute(endM).toDate();
    if (now > start && now < end) setIsPlatformLive(true);
    else setIsPlatformLive(false);
  }, [getServerTime, params]);
  // result
  return { isPlatformLive };
};