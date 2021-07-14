import { useContextAgentProfile } from 'app/state/agent/context';
import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { useFirebaseUser } from '../auth/useFirebaseUser';
import * as Sentry from '@sentry/react';

export const useFreshDesk = (businessId?: string, businessName?: string, phone?: string) => {
  // context
  const user = useFirebaseUser();
  const { isBackofficeUser } = useContextAgentProfile();
  const { path } = useRouteMatch();
  // handlers
  const initFreshChat = React.useCallback(() => {
    if (path.includes('/app') && isBackofficeUser === false) {
      try {
        //@ts-ignore
        window.fcWidget.init({
          token: '081766df-fabc-4189-a940-4e701cd3d451',
          host: 'https://wchat.freshchat.com',
          externalId: businessId,
          firstName: businessName,
          email: user?.email,
          phone: phone,
        });
        //@ts-ignore
        window.fcWidget.setExternalId(businessId);
        //@ts-ignore
        //window.fcWidget.user.setFirstName(businessName);
        //@ts-ignore
        //window.fcWidget.user.setEmail(user?.email);
        //@ts-ignore
        //window.fcWidget.user.setPhone(phone);
        //@ts-ignore
        window.fcWidget.user.setProperties({
          firstName: businessName,
          email: user?.email,
          phone: phone,
        });
      } catch (error) {
        Sentry.captureException('Freshdesk widget initial error', error);
      }
    } else {
      try {
        //@ts-ignore
        window.fcWidget.destroy();
      } catch (error) {
        Sentry.captureException('Freshdesk widget destroy error', error);
      }
    }
  }, [path, isBackofficeUser, businessId, businessName, user?.email, phone]);
  // side effects
  React.useEffect(() => {
    initFreshChat();
  }, [initFreshChat]);
  return;
};