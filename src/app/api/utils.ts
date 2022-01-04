import { WithId } from 'appjusto-types';
import { documentsAs, documentAs } from 'core/fb';
import firebase from 'firebase/app';
import * as Sentry from '@sentry/react';

interface customSnapshotOptions {
  captureException?: boolean;
  avoidPenddingWrites?: boolean;
}

export const customCollectionSnapshot = <T extends object>(
  query: firebase.firestore.Query<firebase.firestore.DocumentData>,
  resultHandler: (result: WithId<T>[]) => void,
  options: customSnapshotOptions = {
    avoidPenddingWrites: true,
  }
) => {
  return query.onSnapshot(
    (snapshot) => {
      // console.log(`%cGet snapshot | docs: ${snapshot.docs?.length}`, 'color: red');
      if (options?.avoidPenddingWrites) {
        if (!snapshot.metadata.hasPendingWrites) {
          // console.log(`%cCall resultHandler`, 'color: purple');
          resultHandler(documentsAs<T>(snapshot.docs));
        }
      } else {
        // console.log(`%cCall resultHandler`, 'color: purple');
        resultHandler(documentsAs<T>(snapshot.docs));
      }
    },
    (error) => {
      console.error(error);
      if (options?.captureException) Sentry.captureException(error);
    }
  );
};

export const customDocumentSnapshot = <T extends object>(
  query: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
  resultHandler: (result: WithId<T> | null) => void,
  options: customSnapshotOptions = {
    avoidPenddingWrites: true,
  }
) => {
  return query.onSnapshot(
    (snapshot) => {
      if (options?.avoidPenddingWrites) {
        if (!snapshot.metadata.hasPendingWrites) {
          if (snapshot.exists) resultHandler(documentAs<T>(snapshot));
          else resultHandler(null);
        }
      } else {
        if (snapshot.exists) resultHandler(documentAs<T>(snapshot));
        else resultHandler(null);
      }
    },
    (error) => {
      console.error(error);
      if (options?.captureException) Sentry.captureException(error);
    }
  );
};
