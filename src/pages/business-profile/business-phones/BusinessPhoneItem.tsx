import { BusinessPhone } from '@appjusto/types';
import {
  Box,
  Button,
  Checkbox,
  HStack,
  Icon,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import { useContextFirebaseUser } from 'app/state/auth/context';
import { CloseButton } from 'common/components/buttons/CloseButton';
import { CustomPatternInput as PatternInput } from 'common/components/form/input/pattern-input/CustomPatternInput';
import {
  phoneFormatter,
  phoneMask,
} from 'common/components/form/input/pattern-input/formatters';
import { numbersOnlyParser } from 'common/components/form/input/pattern-input/parsers';
import { Select } from 'common/components/form/select/Select';
import { ReactComponent as DragHandle } from 'common/img/drag-handle.svg';
import { Draggable } from 'react-beautiful-dnd';
import { FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { t } from 'utils/i18n';
import { BusinessPhoneField } from '.';

interface BusinessPhoneItemProps {
  index: number;
  phone: BusinessPhone;
  isRemoving: boolean;
  handlePhoneUpdate(index: number, field: BusinessPhoneField, value: any): void;
  removePhone(index: number): void;
  isBackoffice?: boolean;
}

export const BusinessPhoneItem = ({
  index,
  phone,
  isRemoving,
  handlePhoneUpdate,
  removePhone,
  isBackoffice = false,
}: BusinessPhoneItemProps) => {
  // context
  const { userAbility } = useContextFirebaseUser();
  // UI
  if (isBackoffice) {
    return (
      <Draggable draggableId={`${index}`} index={index}>
        {(draggable) => (
          <HStack
            {...draggable.draggableProps}
            ref={draggable.innerRef}
            borderWidth="1px"
            borderRadius="lg"
            bg="white"
            boxShadow="0px 8px 16px -4px rgba(105, 118, 103, 0.1)"
            w="100%"
            p="2"
          >
            <Box
              {...draggable.dragHandleProps}
              ref={draggable.innerRef}
              display={
                userAbility?.can('update', 'businesses') ? 'flex' : 'none'
              }
              px="2"
              bg="white"
            >
              <DragHandle />
            </Box>
            <Select
              mt="0"
              w={{ base: '110px' }}
              minW={{ base: '110px' }}
              label={t('Tipo')}
              aria-label={t('tipo-de-telefone')}
              value={phone.type}
              onChange={(e) => handlePhoneUpdate(index, 'type', e.target.value)}
            >
              <option value="owner">{t('Dono')}</option>
              <option value="manager">{t('Gerente')}</option>
              <option value="desk">{t('Balcão')}</option>
            </Select>
            <PatternInput
              mt="0"
              w={{ base: '100%' }}
              minW={{ md: '220px' }}
              isRequired={index === 0}
              id={`business-phone-${index}`}
              label={t(`Número do telefone ${index === 0 ? '*' : ''}`)}
              placeholder={t('Nº de telefone ou celular')}
              mask={phoneMask}
              parser={numbersOnlyParser}
              formatter={phoneFormatter}
              value={phone.number}
              onValueChange={(value) =>
                handlePhoneUpdate(index, 'number', value)
              }
              validationLength={10}
            />
            <Checkbox
              colorScheme="green"
              value="calls"
              isChecked={phone.calls}
              onChange={(e) =>
                handlePhoneUpdate(index, 'calls', e.target.checked)
              }
            >
              <Icon w="20px" h="20px" as={FaPhoneAlt} />
            </Checkbox>
            <Checkbox
              colorScheme="green"
              value="whatsapp"
              isChecked={phone.whatsapp}
              onChange={(e) =>
                handlePhoneUpdate(index, 'whatsapp', e.target.checked)
              }
            >
              <Icon w="22px" h="22px" as={FaWhatsapp} />
            </Checkbox>
            {isRemoving && (
              <>
                <Button
                  display={{ base: 'block', md: 'none' }}
                  size="sm"
                  variant="ghost"
                  fontSize="13px"
                  onClick={() => removePhone(index)}
                >
                  {t('Remover')}
                </Button>
                <Tooltip
                  placement="top"
                  label={t('Remover telefone')}
                  aria-label={t('Remover')}
                >
                  <CloseButton
                    display={{ base: 'none', md: 'block' }}
                    size="sm"
                    variant="dangerLight"
                    onClick={() => removePhone(index)}
                  />
                </Tooltip>
              </>
            )}
          </HStack>
        )}
      </Draggable>
    );
  }
  return (
    <Stack
      key={index}
      mt={{ base: '8', md: '4' }}
      spacing={{ base: 3, md: 4 }}
      direction={{ base: 'column', md: 'row' }}
    >
      <HStack>
        <Select
          mt="0"
          w={{ base: '110px' }}
          minW={{ base: '110px' }}
          label={t('Tipo')}
          aria-label={t(`tipo-de-telefone-${index}`)}
          value={phone.type}
          onChange={(e) => handlePhoneUpdate(index, 'type', e.target.value)}
        >
          <option value="owner">{t('Dono')}</option>
          <option value="manager">{t('Gerente')}</option>
          <option value="desk">{t('Balcão')}</option>
        </Select>
        <PatternInput
          w={{ base: '100%' }}
          minW={{ md: '220px' }}
          isRequired={index === 0}
          //ref={phoneRef}
          id={`business-phone-${index}`}
          label={t(`Número do telefone ${index === 0 ? '*' : ''}`)}
          aria-label={t(`numero-do-telefone-${index}`)}
          placeholder={t('Nº de telefone ou celular')}
          mask={phoneMask}
          parser={numbersOnlyParser}
          formatter={phoneFormatter}
          value={phone.number}
          onValueChange={(value) => handlePhoneUpdate(index, 'number', value)}
          validationLength={10}
        />
      </HStack>
      <HStack
        w={{ base: '100%' }}
        spacing={{ base: 6, md: 4 }}
        alignItems="center"
        fontSize="16px"
        lineHeight="22px"
      >
        <Checkbox
          colorScheme="green"
          value="calls"
          isChecked={phone.calls}
          onChange={(e) => handlePhoneUpdate(index, 'calls', e.target.checked)}
          aria-label={`calls-checkbox-${index}`}
        >
          {isBackoffice ? (
            <Icon w="20px" h="20px" as={FaPhoneAlt} />
          ) : (
            t('Chamadas')
          )}
        </Checkbox>
        <Checkbox
          colorScheme="green"
          value="whatsapp"
          isChecked={phone.whatsapp}
          onChange={(e) =>
            handlePhoneUpdate(index, 'whatsapp', e.target.checked)
          }
          aria-label={`whatsapp-checkbox-${index}`}
        >
          {isBackoffice ? (
            <Icon w="22px" h="22px" as={FaWhatsapp} />
          ) : (
            t('Whatsapp')
          )}
        </Checkbox>
        {isRemoving && (
          <>
            <Button
              display={{ base: 'block', md: 'none' }}
              size="sm"
              variant="ghost"
              fontSize="13px"
              onClick={() => removePhone(index)}
            >
              {t('Remover')}
            </Button>
            <Tooltip
              placement="top"
              label={t('Remover telefone')}
              aria-label={t('Remover')}
            >
              <CloseButton
                display={{ base: 'none', md: 'block' }}
                size="sm"
                variant="dangerLight"
                onClick={() => removePhone(index)}
              />
            </Tooltip>
          </>
        )}
      </HStack>
    </Stack>
  );
};
