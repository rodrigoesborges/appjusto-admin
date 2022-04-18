import { StaffProfile, WithId } from '@appjusto/types';
import { Flex, Text } from '@chakra-ui/react';
import { useStaffs } from 'app/api/staff/useStaffs';
import { CustomButton } from 'common/components/buttons/CustomButton';
import { CustomInput } from 'common/components/form/input/CustomInput';
import PageHeader from 'pages/PageHeader';
import React from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { getDateTime } from 'utils/functions';
import { t } from 'utils/i18n';
import { StaffBaseDrawer } from '../drawers/staff/StaffBaseDrawer';
import { StaffsTable } from './StaffsTable';

const StaffsPage = () => {
  // context
  const { path } = useRouteMatch();
  const history = useHistory();
  const { staffs } = useStaffs();
  // state
  const [dateTime, setDateTime] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [staffsList, setStaffsList] = React.useState<WithId<StaffProfile>[]>();
  // handlers
  const closeDrawerHandler = () => {
    history.replace(path);
  };
  // side effects
  React.useEffect(() => {
    const { date, time } = getDateTime();
    setDateTime(`${date} às ${time}`);
  }, []);
  React.useEffect(() => {
    let found = staffs ?? [];
    if (staffs && search.length > 0) {
      found = staffs.filter((agent) => agent.email.includes(search));
    }
    setStaffsList(found);
  }, [staffs, search]);
  // UI
  return (
    <>
      <PageHeader title={t('Agentes Appjusto')} subtitle={t(`Atualizado ${dateTime}`)} />
      <Flex mt="8">
        <CustomInput
          mt="0"
          minW={{ lg: '260px' }}
          maxW="400px"
          id="search-id"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          label={t('Busca')}
          placeholder={t('Digite o email do agente')}
        />
      </Flex>
      <Flex
        mt="4"
        w="100%"
        pb={{ lg: '2' }}
        justifyContent="flex-end"
        borderBottom="1px solid #C8D7CB"
      ></Flex>
      <Flex
        mt="4"
        flexDir={{ base: 'column', md: 'row' }}
        justifyContent={{ md: 'space-between' }}
        color="black"
      >
        <Text fontSize="lg" fontWeight="700" lineHeight="26px">
          {t(`${staffsList?.length ?? '0'} agentes encontrados`)}
        </Text>
        <CustomButton mt="0" label={t('Adicionar agente')} link={`${path}/new`} />
      </Flex>
      <StaffsTable staffs={staffsList} />
      <Switch>
        <Route path={`${path}/:staffId`}>
          <StaffBaseDrawer isOpen onClose={closeDrawerHandler} />
        </Route>
      </Switch>
    </>
  );
};

export default StaffsPage;
