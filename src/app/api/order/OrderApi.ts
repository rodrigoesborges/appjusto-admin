import {
  ChatMessage,
  Issue,
  Order,
  //OrderCancellation,
  OrderChange,
  OrderIssue,
  OrderMatching,
  OrderStatus,
  WithId,
} from 'appjusto-types';
import { documentAs, documentsAs } from 'core/fb';
import firebase from 'firebase/app';
import FirebaseRefs from '../FirebaseRefs';

export type CancellationData = {
  issue: WithId<Issue>;
  canceledById: string;
  comment?: string;
};

export default class OrderApi {
  constructor(private refs: FirebaseRefs) {}

  // firestore
  observeOrders(
    statuses: OrderStatus[],
    resultHandler: (orders: WithId<Order>[]) => void,
    businessId?: string
  ): firebase.Unsubscribe {
    let query = this.refs
      .getOrdersRef()
      .orderBy('createdOn', 'desc')
      .where('status', 'in', statuses);

    if (businessId) {
      query = this.refs
        .getOrdersRef()
        .orderBy('createdOn', 'desc')

        .where('business.id', '==', businessId)
        .where('status', 'in', statuses);
    }
    const unsubscribe = query.onSnapshot(
      (querySnapshot) => {
        resultHandler(documentsAs<Order>(querySnapshot.docs));
      },
      (error) => {
        console.error(error);
      }
    );
    // returns the unsubscribe function
    return unsubscribe;
  }

  observeBusinessCanceledOrders(
    resultHandler: (orders: WithId<Order>[]) => void,
    businessId: string
  ): firebase.Unsubscribe {
    const timeLimit = new Date().getTime() - 86400000;
    const start_time = firebase.firestore.Timestamp.fromDate(new Date(timeLimit));

    let query = this.refs
      .getOrdersRef()
      .orderBy('updatedOn', 'desc')
      .where('updatedOn', '>=', start_time)
      .where('business.id', '==', businessId)
      .where('status', '==', 'canceled');

    const unsubscribe = query.onSnapshot(
      (querySnapshot) => {
        resultHandler(documentsAs<Order>(querySnapshot.docs));
      },
      (error) => {
        console.error(error);
      }
    );
    // returns the unsubscribe function
    return unsubscribe;
  }

  observeOrder(
    orderId: string,
    resultHandler: (order: WithId<Order>) => void
  ): firebase.Unsubscribe {
    let query = this.refs.getOrderRef(orderId);
    const unsubscribe = query.onSnapshot(
      (querySnapshot) => {
        resultHandler(documentAs<Order>(querySnapshot));
      },
      (error) => {
        console.error(error);
      }
    );
    // returns the unsubscribe function
    return unsubscribe;
  }

  observeOrderChat(
    orderId: string,
    partId: string,
    counterpartId: string,
    resultHandler: (orders: WithId<ChatMessage>[]) => void
  ): firebase.Unsubscribe {
    const unsubscribe = this.refs
      .getOrderChatRef(orderId)
      .where('from.id', '==', partId)
      .where('to.id', '==', counterpartId)
      .orderBy('timestamp', 'asc')
      .onSnapshot(
        (querySnapshot) => {
          resultHandler(documentsAs<ChatMessage>(querySnapshot.docs));
        },
        (error) => {
          console.error(error);
        }
      );
    // returns the unsubscribe function
    return unsubscribe;
  }

  observeOrderIssues(
    orderId: string,
    resultHandler: (orderIssues: WithId<OrderIssue>[]) => void
  ): firebase.Unsubscribe {
    let query = this.refs.getOrderIssuesRef(orderId).orderBy('createdOn', 'desc');
    const unsubscribe = query.onSnapshot(
      (querySnapshot) => {
        resultHandler(documentsAs<OrderIssue>(querySnapshot.docs));
      },
      (error) => {
        console.error(error);
      }
    );
    // returns the unsubscribe function
    return unsubscribe;
  }

  async getOrderStatusTimestamp(
    orderId: string,
    status: OrderStatus,
    resultHandler: (timestamp: firebase.firestore.Timestamp | null) => void
  ) {
    const query = this.refs
      .getOrderLogsRef(orderId)
      .where('after.status', '==', status)
      .orderBy('timestamp', 'desc')
      .limit(1);
    const result = await query.get();
    const log = documentsAs<OrderChange>(result.docs).find(() => true);
    return resultHandler((log?.timestamp as firebase.firestore.Timestamp) ?? null);
  }

  observeOrderPrivateMatching(
    orderId: string,
    resultHandler: (matching: OrderMatching | null) => void
  ): firebase.Unsubscribe {
    console.log(orderId);
    let query = this.refs.getOrderMatchingRef(orderId);
    const unsubscribe = query.onSnapshot(
      (querySnapshot) => {
        if (querySnapshot.exists) resultHandler(querySnapshot.data() as OrderMatching);
        else resultHandler(null);
      },
      (error) => {
        console.error(error);
      }
    );
    // returns the unsubscribe function
    return unsubscribe;
  }

  async updateOrderCourierNotified(orderId: string, couriersNotified: string[]) {
    return this.refs.getOrderMatchingRef(orderId).update({ couriersNotified });
  }

  async getOrderIssues(orderId: string) {
    return documentsAs<OrderIssue>(
      (await this.refs.getOrderIssuesRef(orderId).orderBy('createdOn', 'desc').get()).docs
    );
  }

  async fetchOrderById(orderId: string) {
    const data = await this.refs.getOrderRef(orderId).get();
    return data ? { ...data.data(), id: orderId } : null;
  }

  async fetchOrdersByConsumerId(consumerId: string) {
    return documentsAs<Order>(
      (
        await this.refs
          .getOrdersRef()
          .orderBy('createdOn', 'desc')
          .where('consumer.id', '==', consumerId)
          .get()
      ).docs
    );
  }

  async sendMessage(orderId: string, message: Partial<ChatMessage>) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    return this.refs.getOrderChatRef(orderId).add({
      ...message,
      timestamp,
    });
  }

  async createFakeOrder(order: Order) {
    return this.refs.getOrdersRef().add(order);
  }

  async updateOrder(orderId: string, changes: Partial<Order>) {
    const timestamp = firebase.firestore.FieldValue.serverTimestamp();
    await this.refs.getOrderRef(orderId).update({
      ...changes,
      updatedOn: timestamp,
    });
  }

  async cancelOrder(orderId: string, cancellationData: CancellationData) {
    //const { canceledById, issue, comment } = cancellationData;
    // get callable function ref and send data to bakcend
    console.log('cancellation', orderId, cancellationData);
  }
}
