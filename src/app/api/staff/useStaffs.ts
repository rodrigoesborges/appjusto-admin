import { StaffProfile, WithId } from '@appjusto/types';
import { useContextApi } from 'app/state/api/context';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import React from 'react';

const initialMap = new Map();

export const useStaffs = () => {
  // contex
  const api = useContextApi();
  // state
  const [staffMap, setStaffMap] =
    React.useState<Map<string | undefined, WithId<StaffProfile>[]>>(initialMap);
  const [staffs, setStaffs] = React.useState<WithId<StaffProfile>[] | null>();
  const [startAfter, setStartAfter] = React.useState<QueryDocumentSnapshot<DocumentData>>();
  const [lastStaff, setLastStaff] = React.useState<QueryDocumentSnapshot<DocumentData>>();
  // handlers
  const fetchNextPage = React.useCallback(() => {
    setStartAfter(lastStaff);
  }, [lastStaff]);
  // side effects
  React.useEffect(() => {
    api.staff().observeStaffs((results, last) => {
      setStaffMap((current) => {
        const value = new Map(current.entries());
        value.set(startAfter?.id, results);
        return value;
      });
      if (last) setLastStaff(last);
    }, startAfter);
  }, [api, startAfter]);
  React.useEffect(() => {
    setStaffs(Array.from(staffMap.values()).reduce((result, staffs) => [...result, ...staffs], []));
  }, [staffMap]);
  // return
  return { staffs, fetchNextPage };
};