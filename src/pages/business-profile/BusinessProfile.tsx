import { Box, Flex, Switch as ChakraSwitch, Text, useBreakpoint } from '@chakra-ui/react';
import * as cnpjutils from '@fnando/cnpj';
import { useBusinessProfile } from 'app/api/business/profile/useBusinessProfile';
import { useContextBusiness } from 'app/state/business/context';
import { AlertError } from 'common/components/AlertError';
import { AlertSuccess } from 'common/components/AlertSuccess';
import { CurrencyInput } from 'common/components/form/input/currency-input/CurrencyInput2';
import { CustomInput as Input } from 'common/components/form/input/CustomInput';
import { CustomTextarea as Textarea } from 'common/components/form/input/CustomTextarea';
import { CustomPatternInput as PatternInput } from 'common/components/form/input/pattern-input/CustomPatternInput';
import {
  cnpjFormatter,
  cnpjMask,
  phoneFormatter,
  phoneMask,
} from 'common/components/form/input/pattern-input/formatters';
import { numbersOnlyParser } from 'common/components/form/input/pattern-input/parsers';
import { ImageUploads } from 'common/components/ImageUploads';
import {
  coverRatios,
  coverResizedWidth,
  logoRatios,
  logoResizedWidth,
} from 'common/imagesDimensions';
import { OnboardingProps } from 'pages/onboarding/types';
import PageFooter from 'pages/PageFooter';
import PageHeader from 'pages/PageHeader';
import React from 'react';
import { useQueryCache } from 'react-query';
import { Redirect, Route, Switch, useHistory, useRouteMatch } from 'react-router-dom';
import { t } from 'utils/i18n';
import { CuisineSelect } from '../../common/components/form/select/CuisineSelect';
import { BusinessDeleteDrawer } from './BusinessDeleteDrawer';

const BusinessProfile = ({ onboarding, redirect }: OnboardingProps) => {
  // context
  const isDev = process.env.NODE_ENV === 'development';
  const { business } = useContextBusiness();
  const queryCache = useQueryCache();
  const { path } = useRouteMatch();
  const history = useHistory();
  // state
  const [cnpj, setCNPJ] = React.useState(business?.cnpj ?? (isDev ? cnpjutils.generate() : ''));
  const [name, setName] = React.useState(business?.name ?? '');
  const [phone, setPhone] = React.useState(business?.phone ?? '');
  const [cuisineName, setCuisineName] = React.useState(business?.cuisine ?? '');
  const [description, setDescription] = React.useState(business?.description ?? '');
  const [minimumOrder, setMinimumOrder] = React.useState(business?.minimumOrder ?? 0);
  const [enabled, setEnabled] = React.useState(business?.enabled ?? false);
  const [logoExists, setLogoExists] = React.useState(false);
  const [coverExists, setCoverExists] = React.useState(false);
  const [logoFiles, setLogoFiles] = React.useState<File[] | null>(null);
  const [coverFiles, setCoverFiles] = React.useState<File[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState({ status: false, message: '' });
  // refs
  const cnpjRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);
  const minimumOrderRef = React.useRef<HTMLInputElement>(null);
  const isMountedRef = React.useRef(false);
  // queries & mutations
  const {
    createBusinessProfile,
    updateBusinessProfile,
    logo,
    cover,
    uploadLogo,
    uploadCover,
    updateResult,
    //deleteResult,
    uploadLogoResult,
    uploadCoverResult,
  } = useBusinessProfile();

  // handlers
  const openDrawerHandler = () => history.push(`${path}/delete`);
  const closeDrawerHandler = () => history.replace(path);

  const isCNPJValid = () => cnpjutils.isValid(cnpj);

  const onSubmitHandler = async () => {
    //if (minimumOrder === 0) return minimumOrderRef.current?.focus();
    if (!isCNPJValid()) return cnpjRef?.current?.focus();
    if (phone.length < 10) return phoneRef?.current?.focus();
    setIsLoading(true);
    try {
      await updateBusinessProfile({
        name,
        phone,
        cnpj,
        description,
        minimumOrder,
        enabled,
        cuisine: cuisineName,
        logoExists: logoExists,
        coverImageExists: coverExists,
      });
      // upload imagens and invalidate queries
      if (logoFiles) await uploadLogo(logoFiles[0]);
      if (logoFiles) queryCache.invalidateQueries(['business:logo', business?.id]);
      if (coverFiles) await uploadCover(coverFiles);
      if (coverFiles) queryCache.invalidateQueries(['business:cover', business?.id]);
    } catch (error) {
      console.log('BusinessProfile submit error', error);
    }
    return setIsLoading(false);
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
    setCoverFiles(files);
    setCoverExists(true);
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
    if (onboarding) window?.scrollTo(0, 0);
    cnpjRef?.current?.focus();
  }, [onboarding]);

  React.useEffect(() => {
    if (business) {
      if (business.cnpj) setCNPJ(business.cnpj);
      if (business.name) setName(business.name);
      if (business.phone) setPhone(business.phone);
      if (business.description) setDescription(business.description);
      if (business.minimumOrder) setMinimumOrder(business.minimumOrder);
      if (business.cuisine) setCuisineName(business.cuisine);
      if (business.logoExists && logo) setLogoExists(true);
      if (business.coverImageExists && cover) setCoverExists(true);
    } else if (business === null) {
      createBusinessProfile();
    }
  }, [business, cover, logo, createBusinessProfile]);

  React.useEffect(() => {
    if (!isMountedRef.current) return;
    if (updateResult.isSuccess) {
      setIsSuccess(true);
    }
    if (updateResult.isError) {
      setIsSuccess(false);
      setError({
        status: true,
        message: 'Não foi possível acessar o servidor. Tenta novamente?',
      });
    } else if (uploadLogoResult.isError) {
      setIsSuccess(false);
      setError({
        status: true,
        message: 'Não foi possível salvar a imagem de logo. Tenta novamente?',
      });
    } else if (uploadCoverResult.isError) {
      setIsSuccess(false);
      setError({
        status: true,
        message: 'Não foi possível salvar a imagem de cover. Tenta novamente?',
      });
    }
  }, [updateResult, uploadLogoResult, uploadCoverResult]);

  // UI
  const breakpoint = useBreakpoint();
  const coverWidth = breakpoint === 'base' ? 328 : breakpoint === 'md' ? 420 : 464;
  if (isSuccess && redirect) return <Redirect to={redirect} push />;
  return (
    <>
      <Box maxW="833px">
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            onSubmitHandler();
          }}
        >
          <PageHeader
            title={t('Sobre o restaurante')}
            subtitle={t('Essas informações serão vistas por seus visitantes')}
          />
          <Box maxW="400px">
            <PatternInput
              isRequired
              ref={cnpjRef}
              id="business-cnpj"
              label={t('CNPJ')}
              placeholder={t('CNPJ do seu estabelecimento')}
              mask={cnpjMask}
              parser={numbersOnlyParser}
              formatter={cnpjFormatter}
              value={cnpj}
              onValueChange={(value) => setCNPJ(value)}
              //validationLength={14}
              externalValidation={{ active: true, status: isCNPJValid() }}
            />
            <Input
              isRequired
              id="business-name"
              label={t('Nome')}
              placeholder={t('Nome')}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
            <PatternInput
              isRequired
              ref={phoneRef}
              id="business-phone"
              label={t('Telefone/Celular')}
              placeholder={t('Número do seu telefone ou celular')}
              mask={phoneMask}
              parser={numbersOnlyParser}
              formatter={phoneFormatter}
              value={phone}
              onValueChange={(value) => setPhone(value)}
              validationLength={10}
            />
            <CuisineSelect
              isRequired
              value={cuisineName}
              onChange={(ev) => setCuisineName(ev.target.value)}
            />
            <Textarea
              //isRequired
              id="business-description"
              label={t('Descrição')}
              placeholder={t('Descreva seu restaurante')}
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
            />
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
          </Box>
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
            key="logo"
            mt="4"
            width={200}
            height={200}
            imageUrl={logo}
            ratios={logoRatios}
            resizedWidth={logoResizedWidth}
            placeholderText={t('Logo do estabelecimento')}
            getImages={getLogoFiles}
            clearDrop={() => clearDropImages('logo')}
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
            key="cover"
            mt="4"
            width={coverWidth}
            height={coverWidth / coverRatios[0]}
            imageUrl={cover}
            ratios={coverRatios}
            resizedWidth={coverResizedWidth}
            placeholderText={t('Imagem de capa')}
            getImages={getCoverFiles}
            clearDrop={() => clearDropImages('cover')}
          />
          {!onboarding && business?.situation === 'approved' && (
            <>
              <Text mt="8" fontSize="xl" color="black">
                {t('Desligar restaurante do AppJusto')}
              </Text>
              <Text mt="2" fontSize="md">
                {t('O restaurante não aparecerá no app enquanto estiver desligado')}
              </Text>
              <Flex mt="4" pb="8" alignItems="center">
                <ChakraSwitch
                  isChecked={enabled}
                  onChange={(ev) => {
                    ev.stopPropagation();
                    setEnabled(ev.target.checked);
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
          {/* submit */}
          <PageFooter
            onboarding={onboarding}
            redirect={redirect}
            isLoading={isLoading}
            deleteLabel={t('Excluir restaurante')}
            onDelete={openDrawerHandler}
          />
          {!onboarding && isSuccess && (
            <AlertSuccess
              maxW="320px"
              title={t('Informações salvas com sucesso!')}
              description={''}
            />
          )}
          {error.status && (
            <AlertError maxW="320px" title={t('Erro')} description={error.message} />
          )}
        </form>
      </Box>
      <Switch>
        <Route exact path={`${path}/delete`}>
          <BusinessDeleteDrawer isOpen onClose={closeDrawerHandler} />
        </Route>
      </Switch>
    </>
  );
};

export default BusinessProfile;
