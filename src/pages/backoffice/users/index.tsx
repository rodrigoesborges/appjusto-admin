import { UserType } from '@appjusto/types';
import { ArrowDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useObserveUsers } from 'app/api/users/useObserveUsers';
import { UsersSearchType } from 'app/api/users/UsersApi';
import { ClearFiltersButton } from 'common/components/backoffice/ClearFiltersButton';
import { FilterText } from 'common/components/backoffice/FilterText';
//import Checkbox from 'common/components/form/Checkbox';
import { CustomDateFilter } from 'common/components/form/input/CustomDateFilter';
import { CustomInput } from 'common/components/form/input/CustomInput';
import React from 'react';
import { Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { getDateTime } from 'utils/functions';
import { t } from 'utils/i18n';
import PageHeader from '../../PageHeader';
import { UserBaseDrawer } from '../drawers/user/UserBaseDrawer';
import { UsersTable } from './UsersTable';

const UsersPage = () => {
  // context
  const { path } = useRouteMatch();
  const history = useHistory();
  // state
  const [dateTime, setDateTime] = React.useState('');
  const [loggedAt, setLoggedAt] = React.useState<UserType[]>([
    'manager',
    'courier',
    'consumer',
  ]);
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [searchType, setSearchType] = React.useState<UsersSearchType>('email');
  const [search, setSearch] = React.useState('');
  const [searchFrom, setSearchFrom] = React.useState('');
  const [searchTo, setSearchTo] = React.useState('');
  const [clearDateNumber, setClearDateNumber] = React.useState(0);
  const { users, fetchNextPage } = useObserveUsers(
    loggedAt,
    isBlocked,
    searchType,
    search,
    searchFrom,
    searchTo
  );
  // handlers
  const closeDrawerHandler = () => {
    history.replace(path);
  };
  const clearFilters = () => {
    setClearDateNumber((prev) => prev + 1);
    setLoggedAt(['manager', 'courier', 'consumer']);
    setIsBlocked(false);
    setSearchType('email');
    setSearch('');
    setSearchFrom('');
    setSearchTo('');
  };
  // side effects
  React.useEffect(() => {
    const { date, time } = getDateTime();
    setDateTime(`${date} às ${time}`);
  }, []);
  // UI
  return (
    <Box>
      <PageHeader
        title={t('Usuários')}
        subtitle={t(`Atualizado ${dateTime}`)}
      />
      <Flex mt="8" flexDirection={{ base: 'column', md: 'row' }}>
        <Text mb="1" color="black" fontWeight="500">
          {t('Buscar por:')}
        </Text>
        <RadioGroup
          onChange={(value) => setSearchType(value as UsersSearchType)}
          value={searchType}
          colorScheme="green"
          color="black"
          fontSize="15px"
          lineHeight="21px"
        >
          <HStack
            direction="row"
            alignItems="flex-start"
            color="black"
            spacing={4}
            fontSize="16px"
            lineHeight="22px"
          >
            <Radio value="email">{t('E-mail')}</Radio>
            <Radio value="phone">{t('Fone')}</Radio>
            <Radio value="cpf">{t('CPF')}</Radio>
          </HStack>
        </RadioGroup>
      </Flex>
      <Flex mt="2">
        <Stack spacing={4} direction={{ base: 'column', md: 'row' }}>
          <CustomInput
            mt="0"
            minW={{ lg: '260px' }}
            id="search-id"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            label={t('Busca')}
            placeholder={t('Digite email, fone ou CPF')}
          />
          <CustomDateFilter
            getStart={setSearchFrom}
            getEnd={setSearchTo}
            clearNumber={clearDateNumber}
          />
        </Stack>
      </Flex>
      <Flex
        mt="8"
        w="100%"
        justifyContent="space-between"
        borderBottom="1px solid #C8D7CB"
      >
        <HStack spacing={4} overflowX="auto">
          <FilterText
            isActive={!isBlocked}
            label={t('Todos')}
            onClick={() => setIsBlocked(false)}
          />
          <FilterText
            isActive={isBlocked}
            label={t('Bloqueados')}
            onClick={() => setIsBlocked(true)}
          />
        </HStack>
        <ClearFiltersButton clearFunction={clearFilters} />
      </Flex>
      <HStack mt="6" spacing={8} color="black">
        <Text fontSize="lg" fontWeight="700" lineHeight="26px">
          {t(`${users?.length ?? '0'} usuários na lista`)}
        </Text>
        {/*<CheckboxGroup
          colorScheme="green"
          value={loggedAt}
          onChange={(values: UserType[]) => setLoggedAt(values)}
        >
          <HStack
            alignItems="flex-start"
            color="black"
            spacing={8}
            fontSize="16px"
            lineHeight="22px"
          >
            <Checkbox value="manager">{t('Manager')}</Checkbox>
            <Checkbox value="courier">{t('Entregador')}</Checkbox>
            <Checkbox value="consumer">{t('Consumidor')}</Checkbox>
          </HStack>
        </CheckboxGroup>*/}
      </HStack>
      <UsersTable users={users} />
      <Button mt="8" variant="secondary" onClick={fetchNextPage}>
        <ArrowDownIcon mr="2" />
        {t('Carregar mais')}
      </Button>
      <Switch>
        <Route path={`${path}/:userId`}>
          <UserBaseDrawer isOpen onClose={closeDrawerHandler} />
        </Route>
      </Switch>
    </Box>
  );
};

export default UsersPage;
