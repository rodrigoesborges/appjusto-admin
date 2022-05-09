import { Business, DeleteBusinessPayload } from '@appjusto/types';
import * as Sentry from '@sentry/react';
import { useCustomMutation } from 'app/api/mutation/useCustomMutation';
import { useContextApi } from 'app/state/api/context';
import { useContextFirebaseUser } from 'app/state/auth/context';
import { useContextBusiness } from 'app/state/business/context';
import React from 'react';
import { useQuery } from 'react-query';

export const useBusinessProfile = (isOnboarding: boolean = false) => {
  // context
  const api = useContextApi();
  const { business, setBusinessId } = useContextBusiness();
  const businessId = business?.id;
  const { refreshUserToken } = useContextFirebaseUser();
  // queries
  const getBusinessLogoURL = () =>
    businessId ? api.business().getBusinessLogoURL(businessId!) : null;
  const { data: logo } = useQuery(['business:logo', businessId], getBusinessLogoURL);
  const getBusinessCoverURL = () =>
    businessId ? api.business().getBusinessCoverURL(businessId!, '1008x360') : null;
  const { data: cover } = useQuery(['business:cover', businessId], getBusinessCoverURL);
  // mutations
  const { mutateAsync: createBusinessProfile } = useCustomMutation(
    async () => {
      const business = await api.business().createBusinessProfile();
      setBusinessId(business.id);
      if (refreshUserToken) refreshUserToken(business.id);
    },
    'createBusinessProfile',
    false
  );
  const { mutateAsync: updateBusinessProfile, mutationResult: updateResult } = useCustomMutation(
    async (changes: Partial<Business>) =>
      api.business().updateBusinessProfile(businessId!, changes),
    'updateBusinessProfile',
    !isOnboarding
  );
  const { mutateAsync: updateBusinessProfileWithImages, mutationResult: updateWithImagesResult } =
    useCustomMutation(
      async (data: {
        changes: Partial<Business>;
        logoFileToSave: File | null;
        coverFilesToSave: File[] | null;
      }) =>
        api
          .business()
          .updateBusinessProfileWithImages(
            businessId!,
            data.changes,
            data.logoFileToSave,
            data.coverFilesToSave
          ),
      'updateBusinessProfileWithImages',
      !isOnboarding
    );
  const { mutateAsync: deleteBusinessProfile, mutationResult: deleteResult } = useCustomMutation(
    async (survey: Partial<DeleteBusinessPayload>) =>
      api.business().deleteBusinessProfile({ businessId, ...survey }),
    'deleteBusinessProfile',
    false
  );
  const { mutateAsync: cloneBusiness, mutationResult: cloneResult } = useCustomMutation(
    async (isFromScratch?: boolean) => {
      const newBusiness = await api.business().cloneBusiness(businessId!, isFromScratch);
      if (refreshUserToken && newBusiness?.id) refreshUserToken(newBusiness.id);
      return newBusiness;
    },
    'cloneBusiness'
  );
  const { mutateAsync: cloneComplementsGroup, mutationResult: cloneGroupResult } =
    useCustomMutation(async (data: { groupId: string; name?: string }) => {
      const newGroupId = await api
        .business()
        .cloneComplementsGroup(businessId!, data.groupId, data.name);
      return newGroupId;
    }, 'cloneComplementsGroup');
  const sendBusinessKeepAlive = React.useCallback(() => {
    if (!business?.id || business.status !== 'open') return;
    try {
      api.business().sendBusinessKeepAlive(business.id);
    } catch (error) {
      Sentry.captureException(error);
    }
  }, [api, business]);
  const { mutateAsync: updateBusinessSlug, mutationResult: updateSlugResult } = useCustomMutation(
    async (data: { businessId: string; slug: string }) =>
      await api.business().updateBusinessSlug(data),
    'updateBusinessSlug'
  );
  // return
  return {
    logo,
    cover,
    createBusinessProfile,
    updateBusinessProfile,
    updateBusinessProfileWithImages,
    updateBusinessSlug,
    deleteBusinessProfile,
    cloneBusiness,
    cloneComplementsGroup,
    updateResult,
    updateWithImagesResult,
    updateSlugResult,
    deleteResult,
    cloneResult,
    cloneGroupResult,
    sendBusinessKeepAlive,
  };
};
