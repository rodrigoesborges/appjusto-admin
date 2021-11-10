import { useContextApi } from 'app/state/api/context';
import { WithId, ProfileNote } from 'appjusto-types';
import React from 'react';
import { useMutation } from 'react-query';

export const useObserveCourierProfileNotes = (courierId?: string) => {
  // contex
  const api = useContextApi();
  // state
  const [profileNotes, setProfileNotes] = React.useState<WithId<ProfileNote>[]>([]);
  // mutations
  const [updateNote, updateResult] = useMutation(
    async (data: { changes: Partial<ProfileNote>; id?: string }) => {
      if (!data.id) return await api.courier().createProfileNote(courierId!, data.changes);
      else return await api.courier().updateProfileNote(courierId!, data.id, data.changes);
    }
  );
  const [deleteNote, deleteResult] = useMutation(
    async (profileNoteId: string) =>
      await api.courier().deleteProfileNote(courierId!, profileNoteId)
  );
  // side effects
  React.useEffect(() => {
    if (!courierId) return;
    const unsub = api.courier().observeCourierProfileNotes(courierId, setProfileNotes);
    return () => unsub();
  }, [api, courierId]);
  // return
  return { profileNotes, updateNote, updateResult, deleteNote, deleteResult };
};