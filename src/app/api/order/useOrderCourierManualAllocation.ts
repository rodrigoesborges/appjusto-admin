import { useContextApi } from 'app/state/api/context';
import { useCustomMutation } from '../mutation/useCustomMutation';

interface AllocationData {
  orderId: string;
  courierId: string;
  comment: string;
}

export const useOrderCourierManualAllocation = () => {
  // context
  const api = useContextApi();
  // mutations
  const {
    mutateAsync: courierManualAllocation,
    mutationResult: allocationResult,
  } = useCustomMutation(async (data: AllocationData) =>
    api.order().courierManualAllocation(data.orderId, data.courierId, data.comment)
  );
  // return
  return { courierManualAllocation, allocationResult };
};
