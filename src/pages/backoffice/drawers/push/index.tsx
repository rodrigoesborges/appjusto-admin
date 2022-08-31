import { Flavor, NotificationChannel, PushCampaign } from '@appjusto/types';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  RadioGroup,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useObservePushCampaign } from 'app/api/push-campaigns/useObservePushCampaign';
import { useContextFirebaseUser } from 'app/state/auth/context';
import { useContextAppRequests } from 'app/state/requests/context';
import CustomCheckbox from 'common/components/form/CustomCheckbox';
import CustomRadio from 'common/components/form/CustomRadio';
import { CustomInput } from 'common/components/form/input/CustomInput';
import { CustomNumberInput as NumberInput } from 'common/components/form/input/CustomNumberInput';
import { CustomTextarea as Textarea } from 'common/components/form/input/CustomTextarea';
import { Timestamp } from 'firebase/firestore';
import React from 'react';
import { useParams } from 'react-router-dom';
import { formatTimestampToInput } from 'utils/functions';
import { t } from 'utils/i18n';
import { SectionTitle } from '../generics/SectionTitle';
import { InputCounter } from './InputCounter';
import { getScheduledDate } from './utils';

interface BaseDrawerProps {
  isOpen: boolean;
  onClose(): void;
}

type Params = {
  campaignId: string;
};

export const PushDrawer = ({ onClose, ...props }: BaseDrawerProps) => {
  //context
  const { campaignId } = useParams<Params>();
  const { userAbility } = useContextFirebaseUser();
  const { dispatchAppRequestResult } = useContextAppRequests();
  const {
    campaign,
    submitPushCampaign,
    updatePushCampaign,
    deletePushCampaign,
    submitPushCampaignResult,
    updatePushCampaignResult,
    deletePushCampaignResult,
  } = useObservePushCampaign(campaignId !== 'new' ? campaignId : undefined);
  // state
  const [flavor, setFlavor] = React.useState<Flavor>('consumer');
  const [channel, setChannel] =
    React.useState<NotificationChannel>('marketing');
  const [isGeo, setIsGeo] = React.useState(false);
  const [latitude, setLatitude] = React.useState('');
  const [longitude, setLongitude] = React.useState('');
  const [radius, setRadius] = React.useState('');
  const [name, setName] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [pushDate, setPushDate] = React.useState('');
  const [pushTime, setPushTime] = React.useState('');
  const [status, setStatus] =
    React.useState<PushCampaign['status']>('submitted');
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDateValid, setIsDateValid] = React.useState(true);
  // helpers
  const isNew = campaignId === 'new';
  const canUpdate = !isNew && userAbility?.can('update', 'push_campaigns');
  const isLoading = isNew
    ? submitPushCampaignResult.isLoading
    : updatePushCampaignResult.isLoading;
  // handlers
  const handleSubmit = () => {
    const scheduledDate = getScheduledDate(pushDate, pushTime);
    if (!scheduledDate) {
      return dispatchAppRequestResult({
        status: 'error',
        requestId: 'PushDrawer-submit-error',
        message: {
          title: 'Informações inválidas.',
          description: 'A data e horário informados não são válidos.',
        },
      });
    }
    const scheduledTo = Timestamp.fromDate(scheduledDate as Date);
    let newCampaign = {
      to: flavor,
      channel,
      name,
      title,
      body,
      status,
      scheduledTo,
    } as Partial<PushCampaign>;
    if (isGeo) {
      const nearby = {
        coordinates: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
        radius: Number(radius),
      };
      newCampaign.nearby = nearby;
    }
    if (isNew) {
      submitPushCampaign(newCampaign);
    } else {
      updatePushCampaign({ campaignId, changes: newCampaign });
    }
  };
  // side effects
  React.useEffect(() => {
    if (!campaign) return;
    setFlavor(campaign.to);
    setChannel(campaign.channel);
    if (campaign.nearby) {
      setIsGeo(true);
      setLatitude(String(campaign.nearby.coordinates.latitude));
      setLongitude(String(campaign.nearby.coordinates.longitude));
      setRadius(String(campaign.nearby.radius));
    }
    setName(campaign.name);
    setTitle(campaign.title);
    setBody(campaign.body);
    setStatus(campaign.status);
    const { date, time } = formatTimestampToInput(campaign.scheduledTo);
    if (date) setPushDate(date);
    if (time) setPushTime(time);
  }, [campaign]);
  React.useEffect(() => {
    if (!isGeo) {
      setLatitude('');
      setLongitude('');
      setRadius('');
    }
  }, [isGeo]);
  React.useEffect(() => {
    if (
      submitPushCampaignResult.isSuccess ||
      deletePushCampaignResult.isSuccess
    ) {
      onClose();
    }
  }, [
    onClose,
    submitPushCampaignResult.isSuccess,
    deletePushCampaignResult.isSuccess,
  ]);
  React.useEffect(() => {
    if (!pushDate || !pushTime) return;
    const isValid = getScheduledDate(pushDate, pushTime, true);
    setIsDateValid(isValid as boolean);
  }, [pushDate, pushTime]);
  //UI
  return (
    <Drawer placement="right" size="lg" onClose={onClose} {...props}>
      <DrawerOverlay>
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            handleSubmit();
          }}
        >
          <DrawerContent mt={{ base: '16', lg: '0' }}>
            <DrawerCloseButton
              bg="green.500"
              mr="12px"
              _focus={{ outline: 'none' }}
            />
            <DrawerHeader pb="2">
              <Text
                color="black"
                fontSize="2xl"
                fontWeight="700"
                lineHeight="28px"
                mb="2"
              >
                {t('Notificação')}
              </Text>
            </DrawerHeader>
            <DrawerBody pb="28">
              <SectionTitle mt="0">{t('Perfil')}</SectionTitle>
              <RadioGroup
                mt="2"
                onChange={(value: Flavor) => setFlavor(value)}
                value={flavor}
                defaultValue="1"
                colorScheme="green"
                color="black"
                fontSize="15px"
                lineHeight="21px"
              >
                <HStack spacing={4}>
                  <CustomRadio value="consumer">{t('Consumidor')}</CustomRadio>
                  <CustomRadio value="courier">{t('Entregador')}</CustomRadio>
                  <CustomRadio value="business">{t('Restaurante')}</CustomRadio>
                </HStack>
              </RadioGroup>
              <SectionTitle>{t('Canal')}</SectionTitle>
              <RadioGroup
                mt="4"
                onChange={(value: NotificationChannel) => setChannel(value)}
                value={channel}
                defaultValue="1"
                colorScheme="green"
                color="black"
                fontSize="15px"
                lineHeight="21px"
              >
                <HStack spacing={4}>
                  <CustomRadio value="marketing">{t('Marketing')}</CustomRadio>
                  <CustomRadio value="status">{t('Status')}</CustomRadio>
                  <CustomRadio value="general">{t('Geral')}</CustomRadio>
                </HStack>
              </RadioGroup>
              <SectionTitle>{t('Georreferenciada')}</SectionTitle>
              <CustomCheckbox
                mt="4"
                colorScheme="green"
                isChecked={isGeo}
                onChange={() => setIsGeo((prev) => !prev)}
              >
                {t('É georreferenciada')}
              </CustomCheckbox>
              {isGeo && (
                <>
                  <HStack mt="4">
                    <NumberInput
                      mt="0"
                      id="campaign-lat"
                      label={t('Latitude')}
                      placeholder={t('Digite a latitude')}
                      value={latitude}
                      onChange={(ev) => setLatitude(ev.target.value)}
                      isCoordinates
                      isRequired
                    />
                    <NumberInput
                      mt="0"
                      id="campaign-lng"
                      label={t('Longitude')}
                      placeholder={t('Digite a longitude')}
                      value={longitude}
                      onChange={(ev) => setLongitude(ev.target.value)}
                      isCoordinates
                      isRequired
                    />
                  </HStack>
                  <NumberInput
                    id="campaign-radius"
                    label={t('Raio')}
                    placeholder={t('0')}
                    value={radius}
                    onChange={(ev) => setRadius(ev.target.value)}
                    isRequired
                  />
                </>
              )}
              <SectionTitle>{t('Dados da notificação')}</SectionTitle>
              <CustomInput
                id="campaign-name"
                label={t('Nome da campanha')}
                placeholder={t('Digite o nome da campanha')}
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                isRequired
              />
              <CustomInput
                id="push-title"
                label={t('Título')}
                placeholder={t('Digite o título da notificação')}
                value={title}
                onChange={(ev) => setTitle(ev.target.value)}
                maxLength={65}
                isRequired
              />
              <InputCounter max={65} current={title.length} />
              <Textarea
                id="push-message"
                label={t('Corpo da mensagem')}
                placeholder={t('Digite o corpo da mensagem')}
                value={body}
                onChange={(ev) => setBody(ev.target.value)}
                maxLength={178 - title.length}
              />
              <InputCounter max={178 - title.length} current={body.length} />
              <HStack mt="4" spacing={4}>
                <CustomInput
                  mt="0"
                  type="date"
                  id="push-date"
                  value={pushDate}
                  onChange={(event) => setPushDate(event.target.value)}
                  label={t('Data')}
                  isInvalid={!isDateValid}
                  isRequired
                />
                <CustomInput
                  mt="0"
                  type="time"
                  id="push-time"
                  value={pushTime}
                  onChange={(event) => setPushTime(event.target.value)}
                  label={t('Horário')}
                  isInvalid={!isDateValid}
                  isRequired
                />
              </HStack>
              {canUpdate && (
                <>
                  <SectionTitle>{t('Status')}</SectionTitle>
                  <RadioGroup
                    mt="2"
                    onChange={(value: PushCampaign['status']) =>
                      setStatus(value)
                    }
                    value={status}
                    defaultValue="1"
                    colorScheme="green"
                    color="black"
                    fontSize="15px"
                    lineHeight="21px"
                  >
                    <VStack mt="4" spacing={2} alignItems="flex-start">
                      <CustomRadio value="submitted">
                        {t('Submetida')}
                      </CustomRadio>
                      <CustomRadio value="approved">
                        {t('Aprovada')}
                      </CustomRadio>
                      <CustomRadio value="rejected">
                        {t('Rejeitada')}
                      </CustomRadio>
                    </VStack>
                  </RadioGroup>
                </>
              )}
            </DrawerBody>
            {isNew && (
              <DrawerFooter borderTop="1px solid #F2F6EA">
                <HStack w="100%" spacing={4}>
                  <Button
                    width="full"
                    fontSize="15px"
                    type="submit"
                    isLoading={isLoading}
                    loadingText={t('Salvando')}
                  >
                    {t('Submeter')}
                  </Button>
                  <Button
                    width="full"
                    fontSize="15px"
                    variant="dangerLight"
                    onClick={onClose}
                  >
                    {t('Cancelar')}
                  </Button>
                </HStack>
              </DrawerFooter>
            )}
            {canUpdate && (
              <DrawerFooter borderTop="1px solid #F2F6EA">
                {isDeleting ? (
                  <Box
                    mt="8"
                    w="100%"
                    bg="#FFF8F8"
                    border="1px solid red"
                    borderRadius="lg"
                    p="6"
                  >
                    <Text color="red">
                      {t(`Tem certeza que deseja excluir esta campanha?`)}
                    </Text>
                    <HStack mt="4" spacing={4}>
                      <Button
                        width="full"
                        fontSize="15px"
                        onClick={() => setIsDeleting(false)}
                      >
                        {t(`Manter campanha`)}
                      </Button>
                      <Button
                        width="full"
                        variant="danger"
                        fontSize="15px"
                        onClick={() => deletePushCampaign(campaignId)}
                        isLoading={deletePushCampaignResult.isLoading}
                      >
                        {t(`Excluir`)}
                      </Button>
                    </HStack>
                  </Box>
                ) : (
                  <HStack w="100%" spacing={4}>
                    <Button
                      width="full"
                      fontSize="15px"
                      type="submit"
                      isLoading={isLoading}
                      loadingText={t('Salvando')}
                    >
                      {t('Salvar alterações')}
                    </Button>
                    <Button
                      width="full"
                      fontSize="15px"
                      variant="dangerLight"
                      onClick={() => setIsDeleting(true)}
                    >
                      {t('Excluir campanha')}
                    </Button>
                  </HStack>
                )}
              </DrawerFooter>
            )}
          </DrawerContent>
        </form>
      </DrawerOverlay>
    </Drawer>
  );
};