import { useContextFirebaseUser } from 'app/state/auth/context';
import { Loading } from 'common/components/Loading';
import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { isAccessGranted } from 'utils/access';

export const BOAccessRoute = (props: RouteProps) => {
  // context
  const { isBackofficeUser, backofficePermissions } = useContextFirebaseUser();
  const path = props.path as string;
  // redirects
  if (!isBackofficeUser) return <Redirect to="/404" push />;
  if (path && backofficePermissions) {
    if (
      path === '/backoffice' ||
      isAccessGranted({ type: 'backoffice', path, backofficePermissions })
    )
      return <Route {...props} />;
    else return <Redirect to="/backoffice" push />;
  }
  // loading
  return <Loading />;
};
