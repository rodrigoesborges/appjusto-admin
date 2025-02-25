import {
  Business,
  BusinessPhone,
  Fulfillment,
  PreparationMode,
} from '@appjusto/types';
import {
  Badge,
  Box,
  Flex,
  Switch as ChakraSwitch,
  Text,
  useBreakpoint,
} from '@chakra-ui/react';
import * as cnpjutils from '@fnando/cnpj';
import { useBusinessProfile } from 'app/api/business/profile/useBusinessProfile';
import { useContextFirebaseUser } from 'app/state/auth/context';
import { useContextBusiness } from 'app/state/business/context';
import { useContextAppRequests } from 'app/state/requests/context';
import { CurrencyInput } from 'common/components/form/input/currency-input/CurrencyInput';
import { CustomInput as Input } from 'common/components/form/input/CustomInput';
import { CustomNumberInput as NumberInput } from 'common/components/form/input/CustomNumberInput';
import { CustomTextarea as Textarea } from 'common/components/form/input/CustomTextarea';
import { CustomPatternInput as PatternInput } from 'common/components/form/input/pattern-input/CustomPatternInput';
import {
  cnpjFormatter,
  cnpjMask,
} from 'common/components/form/input/pattern-input/formatters';
import { numbersOnlyParser } from 'common/components/form/input/pattern-input/parsers';
import { CuisineSelect } from 'common/components/form/select/CuisineSelect';
import { ImageUploads } from 'common/components/ImageUploads';
import {
  coverRatios,
  coverResizedWidth,
  logoRatios,
  logoResizedWidth,
} from 'common/imagesDimensions';
import { SectionTitle } from 'pages/backoffice/drawers/generics/SectionTitle';
import { OnboardingProps } from 'pages/onboarding/types';
import PageFooter from 'pages/PageFooter';
import PageHeader from 'pages/PageHeader';
import React from 'react';
import { useQueryClient } from 'react-query';
import {
  Redirect,
  Route,
  Switch,
  useHistory,
  useRouteMatch,
} from 'react-router-dom';
import { assertPhonesIsValid, serializePhones } from 'utils/functions';
import { t } from 'utils/i18n';
import { BusinessPhoneField, BusinessPhones } from './business-phones';
import { BusinessDeleteDrawer } from './BusinessDeleteDrawer';
import { BusinessFulfillment } from './BusinessFulfillment';
import { BusinessPreparationModes } from './BusinessPreparationModes';
import { CloneBusiness } from './CloneBusiness';

const defaultPhone = {
  type: 'desk',
  number: '',
  calls: true,
  whatsapp: true,
} as BusinessPhone;

const initialState = [defaultPhone];

const BusinessProfile = ({ onboarding, redirect }: OnboardingProps) => {
  // context
  const { dispatchAppRequestResult } = useContextAppRequests();
  const { business } = useContextBusiness();
  const queryClient = useQueryClient();
  const { path } = useRouteMatch();
  const history = useHistory();
  const { isBackofficeUser, userAbility } = useContextFirebaseUser();
  // state
  const devCNPJ = ['dev', 'staging'].includes(
    process.env.REACT_APP_ENVIRONMENT ?? ''
  )
    ? cnpjutils.generate()
    : '';
  const [cnpj, setCNPJ] = React.useState(business?.cnpj ?? devCNPJ);
  const [name, setName] = React.useState(business?.name ?? '');
  const [companyName, setCompanyName] = React.useState(
    business?.companyName ?? ''
  );
  //const [phone, setPhone] = React.useState(business?.phone ?? '');
  const [phones, setPhones] = React.useState(business?.phones ?? initialState);
  const [cuisineName, setCuisineName] = React.useState(business?.cuisine ?? '');
  const [description, setDescription] = React.useState(
    business?.description ?? ''
  );
  const [minimumOrder, setMinimumOrder] = React.useState(
    business?.minimumOrder ?? 0
  );
  const [enabled, setEnabled] = React.useState(business?.enabled ?? false);
  const [status, setStatus] = React.useState(business?.status ?? 'closed');
  const [maxOrdersPerHour, setMaxOrdersPerHour] = React.useState(
    String(business?.maxOrdersPerHour ?? '0')
  );
  const [minHoursForScheduledOrders, setMinHoursForScheduledOrders] =
    React.useState(String(business?.minHoursForScheduledOrders ?? '0'));
  const [preparationModes, setPreparationModes] = React.useState<
    PreparationMode[]
  >(['realtime', 'scheduled']);
  const [fulfillment, setFulfillment] = React.useState<Fulfillment[]>([
    'delivery',
  ]);
  const [logoExists, setLogoExists] = React.useState(false);
  const [coverExists, setCoverExists] = React.useState(false);
  const [logoFiles, setLogoFiles] = React.useState<File[] | null>(null);
  const [coverFiles, setCoverFiles] = React.useState<File[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  // refs
  const cnpjRef = React.useRef<HTMLInputElement>(null);
  //const phoneRef = React.useRef<HTMLInputElement>(null);
  const minimumOrderRef = React.useRef<HTMLInputElement>(null);
  const isMountedRef = React.useRef(false);
  // helpers
  const isOnboarding = typeof onboarding === 'string';
  const blockImagesOnLoading = isOnboarding && isLoading;
  // queries & mutations
  const {
    createBusinessProfile,
    updateBusinessProfileWithImages,
    logo,
    cover,
    updateWithImagesResult,
  } = useBusinessProfile(business?.id, isOnboarding);
  const { isSuccess } = updateWithImagesResult;
  // handlers
  const openDrawerHandler = () => history.push(`${path}/delete`);
  const closeDrawerHandler = () => history.replace(path);
  const isCNPJValid = () => cnpjutils.isValid(cnpj);
  const handleEnabled = (enabled: boolean) => {
    if (enabled) setEnabled(enabled);
    else {
      setStatus('closed');
      setEnabled(false);
    }
  };
  const addPhone = () => setPhones((prev) => [...prev, defaultPhone]);
  const removePhone = (stateIndex: number) => {
    setPhones((prevState) => {
      return prevState.filter((item, index) => index !== stateIndex);
    });
  };
  const handlePhoneUpdate = (
    stateIndex: number,
    field: BusinessPhoneField,
    value: any
  ) => {
    setPhones((prevState) => {
      const newState = prevState.map((phone, index) => {
        if (index === stateIndex) {
          return { ...phone, [field]: value };
        } else {
          return phone;
        }
      });
      return newState;
    });
  };
  const onSubmitHandler = async () => {
    //if (minimumOrder === 0) return minimumOrderRef.current?.focus();
    if (!isCNPJValid()) {
      dispatchAppRequestResult({
        status: 'error',
        requestId: 'BusinessProfile-valid-cnpj',
        message: { title: 'O CNPJ informado não é válido.' },
      });
      return cnpjRef?.current?.focus();
    }
    const serializedPhones = serializePhones(phones);
    if (!assertPhonesIsValid(serializedPhones)) {
      dispatchAppRequestResult({
        status: 'error',
        requestId: 'BusinessProfile-valid-phone',
        message: { title: 'Um ou mais telefones informados não são válidos.' },
      });
      return;
    }
    setIsLoading(true);
    const changes = {
      name: name.trim(),
      companyName: companyName.trim(),
      //phone,
      phones: serializedPhones,
      cnpj,
      description,
      minimumOrder,
      enabled,
      status,
      cuisine: cuisineName,
      maxOrdersPerHour: parseInt(maxOrdersPerHour, 10),
      minHoursForScheduledOrders: parseInt(minHoursForScheduledOrders, 10),
      preparationModes,
      fulfillment,
      logoExists: logoExists,
      coverImageExists: coverExists,
    } as Partial<Business>;
    const logoFileToSave = logoFiles ? logoFiles[0] : null;
    const coverFilesToSave = coverFiles ?? null;
    try {
      if (business === null) {
        await createBusinessProfile();
      }
      await updateBusinessProfileWithImages({
        changes,
        logoFileToSave,
        coverFilesToSave,
      });
      setIsLoading(false);
      // invalidate logo query
      if (logoFiles)
        queryClient.invalidateQueries(['business:logo', business?.id]);
    } catch (error) {
      setIsLoading(false);
    }
  };
  const clearDropImages = React.useCallback((type: string) => {
    if (type === 'logo') {
      setLogoExists(false);
      setLogoFiles(null);
    } else {
      setCoverExists(false);
      setCoverFiles(null);
    }
  }, []);
  const getLogoFiles = React.useCallback(async (files: File[]) => {
    setLogoExists(true);
    setLogoFiles(files);
  }, []);
  const getCoverFiles = React.useCallback(async (files: File[]) => {
    setCoverExists(true);
    setCoverFiles(files);
  }, []);
  // side effects
  React.useEffect(() => {
    isMountedRef.current = true;
    const unmount = () => {
      isMountedRef.current = false;
    };
    return unmount;
  }, []);
  React.useEffect(() => {
    if (isOnboarding) window?.scrollTo(0, 0);
    cnpjRef?.current?.focus();
  }, [isOnboarding]);
  React.useEffect(() => {
    if (business) {
      setEnabled(business.enabled ?? false);
      if (business.cnpj) setCNPJ(business.cnpj);
      setName(business.name ?? '');
      setCompanyName(business.companyName ?? '');
      if (business.phones) setPhones(business.phones);
      setDescription(business.description ?? '');
      setMinimumOrder(business.minimumOrder ?? 0);
      setCuisineName(business.cuisine ?? '');
      if (business.maxOrdersPerHour)
        setMaxOrdersPerHour(String(business.maxOrdersPerHour));
      if (business.minHoursForScheduledOrders)
        setMinHoursForScheduledOrders(
          String(business.minHoursForScheduledOrders)
        );
      if (business.preparationModes)
        setPreparationModes(business.preparationModes);
      if (business.fulfillment) setFulfillment(business.fulfillment);
      if (business.logoExists && logo) setLogoExists(true);
      if (business.coverImageExists && cover) setCoverExists(true);
    }
  }, [business, cover, logo]);
  // UI
  const breakpoint = useBreakpoint();
  const coverWidth =
    breakpoint === 'base' ? 328 : breakpoint === 'md' ? 420 : 536;
  if (isSuccess && redirect) return <Redirect to={redirect} push />;
  return (
    <Box>
      {!isOnboarding && (
        <PageHeader
          title={t('Perfil do restaurante')}
          subtitle={t('Inclua os dados do seu restaurante')}
        />
      )}
      <Box maxW={{ base: '760px', lg: '833px' }}>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            onSubmitHandler();
          }}
        >
          {isOnboarding ? (
            <PageHeader
              title={t('Sobre o restaurante')}
              subtitle={t('Essas informações serão vistas por seus visitantes')}
            />
          ) : (
            <Box>
              <SectionTitle>{t('Sobre o restaurante')}</SectionTitle>
              <Text fontSize="md">
                {t('Essas informações serão vistas por seus visitantes')}
              </Text>
            </Box>
          )}
          <Box maxW="400px">
            <PatternInput
              isRequired
              isDisabled={business?.situation === 'approved'}
              ref={cnpjRef}
              id="business-cnpj"
              label={t('CNPJ *')}
              placeholder={t('CNPJ do seu estabelecimento')}
              mask={cnpjMask}
              parser={numbersOnlyParser}
              formatter={cnpjFormatter}
              value={cnpj}
              onValueChange={(value) => setCNPJ(value)}
              externalValidation={{ active: true, status: isCNPJValid() }}
            />
            <Input
              isRequired
              id="business-name"
              label={t('Nome do restaurante *')}
              placeholder={t('Digite o nome do restaurante')}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            <Input
              isRequired
              id="business-company-name"
              label={t('Razão social *')}
              placeholder={t('Apenas para conferência')}
              value={companyName}
              onChange={(ev) => setCompanyName(ev.target.value)}
            />
            <CuisineSelect
              isRequired
              value={cuisineName}
              onChange={(ev) => setCuisineName(ev.target.value)}
            />
            <Textarea
              isRequired={!isOnboarding}
              id="business-description"
              label={t(`Descrição ${!isOnboarding ? '*' : ''}`)}
              placeholder={t('Descreva seu restaurante')}
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
            />
            {isBackofficeUser && (
              <CurrencyInput
                ref={minimumOrderRef}
                isRequired
                id="business-min-price"
                label={t('Valor mínimo do pedido')}
                placeholder={t('R$ 0,00')}
                value={minimumOrder}
                onChangeValue={(value) => setMinimumOrder(value)}
                maxLength={8}
              />
            )}
          </Box>
          <BusinessPhones
            phones={phones}
            handlePhoneUpdate={handlePhoneUpdate}
            addPhone={addPhone}
            removePhone={removePhone}
            isOnboarding={isOnboarding}
          />
          {!isOnboarding && (
            <>
              {/* preparation modes */}
              <BusinessPreparationModes
                preparationModes={preparationModes}
                handleChange={setPreparationModes}
              />
              {/* maxOrdersPerHour */}
              <Text mt="8" fontSize="xl" color="black">
                {t('Máximo de pedidos')}
                <Badge
                  ml="2"
                  mt="-12px"
                  px="8px"
                  py="2px"
                  bgColor="#FFBE00"
                  color="black"
                  borderRadius="16px"
                  fontSize="11px"
                  lineHeight="18px"
                  fontWeight="700"
                >
                  {t('NOVIDADE')}
                </Badge>
              </Text>
              <Text mt="2" fontSize="md">
                {t(
                  'Caso aplicável, informe a quantidade máxima de pedidos que o restaurante aceita no intervalo de 1h (0 = desativado)'
                )}
              </Text>
              <NumberInput
                id="business-max-order-per-hour"
                maxW="400px"
                label={t('Número de pedidos por hora')}
                value={maxOrdersPerHour}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                  setMaxOrdersPerHour(ev.target.value)
                }
                isRequired
              />
              {/* minHoursForScheduledOrders */}
              <Text mt="8" fontSize="xl" color="black">
                {t('Mínimo de horas de antecedência para pedidos agendados')}
                <Badge
                  ml="2"
                  mt="-12px"
                  px="8px"
                  py="2px"
                  bgColor="#FFBE00"
                  color="black"
                  borderRadius="16px"
                  fontSize="11px"
                  lineHeight="18px"
                  fontWeight="700"
                >
                  {t('NOVIDADE')}
                </Badge>
              </Text>
              <Text mt="2" fontSize="md">
                {t(
                  'Caso aplicável, informe o número mínimo de horas de antecedência para que o consumidor possa realizar um pedido agendado (0 = desativado)'
                )}
              </Text>
              <NumberInput
                id="business-min-hours-for-scheduled-orders"
                maxW="400px"
                label={t('Número mínimo de horas')}
                value={minHoursForScheduledOrders}
                onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                  setMinHoursForScheduledOrders(ev.target.value)
                }
                isRequired
              />
              {/* fulfillment */}
              <BusinessFulfillment
                fulfillment={fulfillment}
                handleChange={setFulfillment}
              />
            </>
          )}
          {/* logo */}
          <Text mt="8" fontSize="xl" color="black">
            {t('Logo do estabelecimento')}
          </Text>
          <Text mt="2" fontSize="md">
            {t(
              'Para o logo do estabelecimento recomendamos imagens no formato quadrado (1:1) com no mínimo 200px de largura'
            )}
          </Text>
          <ImageUploads
            key={logo ?? 'logo'}
            mt="4"
            width={200}
            height={200}
            imageUrl={blockImagesOnLoading ? null : logo}
            ratios={logoRatios}
            resizedWidth={logoResizedWidth}
            placeholderText={t('Logo do estabelecimento')}
            getImages={getLogoFiles}
            clearDrop={() => clearDropImages('logo')}
            doubleSizeCropping={!isOnboarding}
          />
          {/* cover image */}
          <Text mt="8" fontSize="xl" color="black">
            {t('Imagem de capa')}
          </Text>
          <Text mt="2" fontSize="md">
            {t(
              'Você pode ter também uma imagem de capa para o seu restaurante. Pode ser foto do local ou de algum prato específico. Recomendamos imagens na proporção retangular (16:9) com no mínimo 1280px de largura'
            )}
          </Text>
          <ImageUploads
            key={cover ?? 'cover'}
            mt="4"
            width={coverWidth}
            height={coverWidth / coverRatios[0]}
            imageUrl={blockImagesOnLoading ? null : cover}
            ratios={coverRatios}
            resizedWidth={coverResizedWidth}
            placeholderText={t('Imagem de capa')}
            getImages={getCoverFiles}
            clearDrop={() => clearDropImages('cover')}
            doubleSizeCropping={!isOnboarding}
          />
          {!isOnboarding && business?.situation === 'approved' && (
            <>
              <Text mt="8" fontSize="xl" color="black">
                {t('Desligar restaurante do AppJusto')}
              </Text>
              <Text mt="2" fontSize="md">
                {t(
                  'O restaurante não aparecerá no app enquanto estiver desligado'
                )}
              </Text>
              <Flex mt="4" pb="8" alignItems="center">
                <ChakraSwitch
                  isChecked={enabled}
                  onChange={(ev) => {
                    ev.stopPropagation();
                    handleEnabled(ev.target.checked);
                  }}
                />
                <Flex ml="4" flexDir="column" minW="280px">
                  <Text fontSize="16px" fontWeight="700" lineHeight="22px">
                    {enabled ? t('Ligado') : t('Desligado')}
                  </Text>
                </Flex>
              </Flex>
            </>
          )}
          {!isOnboarding &&
            userAbility?.can('create', 'businesses') &&
            typeof business?.companyName === 'string' && <CloneBusiness />}
          {/* submit */}
          <PageFooter
            onboarding={onboarding}
            redirect={redirect}
            isLoading={isLoading}
            deleteLabel={
              userAbility?.can('delete', 'businesses')
                ? t('Excluir restaurante')
                : undefined
            }
            onDelete={
              userAbility?.can('delete', 'businesses')
                ? openDrawerHandler
                : undefined
            }
          />
        </form>
      </Box>
      {!isOnboarding && (
        <Switch>
          <Route exact path={`${path}/delete`}>
            <BusinessDeleteDrawer isOpen onClose={closeDrawerHandler} />
          </Route>
        </Switch>
      )}
    </Box>
  );
};

export default BusinessProfile;
