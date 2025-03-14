import { AdminRole, ManagerWithRole } from '@appjusto/types';
import {
  Box,
  HStack,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useManagers } from 'app/api/manager/useManagers';
import { useContextFirebaseUser } from 'app/state/auth/context';
import { useContextBusinessBackoffice } from 'app/state/business/businessBOContext';
import React from 'react';
import { t } from 'utils/i18n';
import { ManagersTableItem } from './ManagersTableItem';

export const ManagersTable = () => {
  // context
  const { minVersion } = useContextFirebaseUser();
  const { businessManagers, fetchManagers } = useContextBusinessBackoffice();
  const {
    removeBusinessManager,
    createManager,
    createManagerResult,
    removeResult,
  } = useManagers();
  // state
  const [managers, setManagers] = React.useState<ManagerWithRole[]>();
  const [isLoading, setIsLoading] = React.useState(false);
  // handlers
  const updateMember = (managerEmail: string, role: AdminRole) => {
    setManagers((prev) =>
      prev?.map((manager) => {
        if (manager.email === managerEmail) {
          return { ...manager, role };
        }
        return manager;
      })
    );
    createManager([{ email: managerEmail, permissions: role }]);
  };
  const deleteMember = (managerEmail: string) => {
    removeBusinessManager(managerEmail);
  };
  // side effects
  React.useEffect(() => {
    if (!businessManagers) return;
    setManagers(businessManagers);
  }, [businessManagers]);
  React.useEffect(() => {
    if (!createManagerResult.isLoading && !removeResult.isLoading)
      setIsLoading(false);
    else if (createManagerResult.isLoading || removeResult.isLoading)
      setIsLoading(true);
  }, [createManagerResult.isLoading, removeResult.isLoading]);
  React.useEffect(() => {
    if (!createManagerResult.isSuccess) return;
    fetchManagers();
  }, [createManagerResult.isSuccess, fetchManagers]);
  // UI
  if (!managers) {
    return (
      <Box mt="4">
        <Text fontSize="lg" color="black">
          {t('Carregando colaboradores...')}
        </Text>
      </Box>
    );
  }
  return (
    <Box mt="4">
      <Box overflowX="auto">
        <Table mt="4" size="sm" variant="simple" pos="relative" maxW="624px">
          <Thead>
            <Tr>
              <Th>{t('E-mail')}</Th>
              <Th>{t('Papel')}</Th>
              <Th>{t('Versão (web)/(mob)')}</Th>
              <Th minW="140px"></Th>
            </Tr>
          </Thead>
          <Tbody>
            {managers.length > 0 ? (
              managers.map((manager) => {
                return (
                  <ManagersTableItem
                    key={manager.id}
                    manager={manager}
                    minVersion={minVersion}
                    updateMember={updateMember}
                    updateSuccess={createManagerResult.isSuccess}
                    deleteMember={deleteMember}
                    isLoading={isLoading}
                  />
                );
              })
            ) : (
              <Tr color="black" fontSize="xs" fontWeight="700">
                <Td>{t('Não há colaboradores adicionados.')}</Td>
                <Td></Td>
                <Td></Td>
                <Td></Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
      <HStack mt="4" fontSize="13px">
        <Text>{t('Legenda da versão:')}</Text>
        <HStack>
          <Text>{t('Ativa')}</Text>
          <Icon mt="-2px" viewBox="0 0 200 200" color="black">
            <path
              fill="currentColor"
              d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
            />
          </Icon>
        </HStack>
        <HStack>
          <Text>{t('Inativa')}</Text>
          <Icon mt="-2px" viewBox="0 0 200 200" color="red">
            <path
              fill="currentColor"
              d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
            />
          </Icon>
        </HStack>
      </HStack>
    </Box>
  );
};
