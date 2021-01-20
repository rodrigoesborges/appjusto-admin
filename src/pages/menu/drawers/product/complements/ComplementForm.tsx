import { Button, Flex, HStack, Text } from '@chakra-ui/react';
import * as menu from 'app/api/business/menu/functions';
import { useProduct } from 'app/api/business/products/useProduct2';
import { useContextApi } from 'app/state/api/context';
import { useContextBusinessId } from 'app/state/business/context';
import { Complement, WithId } from 'appjusto-types';
import { CurrencyInput } from 'common/components/form/input/currency-input/CurrencyInput2';
import { CustomInput as Input } from 'common/components/form/input/CustomInput';
import { CustomTextarea as Textarea } from 'common/components/form/input/CustomTextarea';
import Image from 'common/components/Image';
import React from 'react';
import { useParams } from 'react-router-dom';
import { t } from 'utils/i18n';

const fallback = '/static/media/product-placeholder.png';

interface Params {
  productId: string;
}

interface ComplementFormProps {
  groupId?: string;
  complementId?: string | undefined;
  item?: WithId<Complement>;
  onSuccess(): void;
  onCancel(): void;
}

export const ComplementForm = ({
  groupId,
  complementId,
  item,
  onSuccess,
  onCancel,
}: ComplementFormProps) => {
  const api = useContextApi();
  const { productId } = useParams<Params>();
  const businessId = useContextBusinessId();
  const product = useProduct(businessId, productId);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState(0);
  const [externalId, setExternalId] = React.useState('');

  React.useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description ?? '');
      setPrice(item.price);
      setExternalId(item.externalId ?? '');
    }
  }, [item]);

  const handleSave = async () => {
    const newItem = {
      name,
      description,
      price,
      externalId,
    };

    if (!complementId) {
      const { id } = await api.business().createComplement(businessId!, newItem);
      let newProductConfig = menu.empty();
      if (product?.complementsOrder && groupId) {
        newProductConfig = menu.addProductToCategory(product?.complementsOrder, id, groupId);
      }
      await api.business().updateProduct(businessId!, productId, {
        complementsOrder: newProductConfig,
      });
    } else {
      await api.business().updateComplement(businessId!, complementId, newItem);
    }
    onSuccess();
  };

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        handleSave();
      }}
    >
      <HStack spacing={4} alignItems="flex-start" p="4">
        <Flex flexDir="column" maxW="24">
          <Image
            src={fallback}
            boxSize="24"
            objectFit="contain"
            borderRadius="lg"
            alt="Product image"
          />
          <Text mt="2" textAlign="center" fontSize="xs">
            {t('Adicionar imagem')}
          </Text>
        </Flex>
        <Flex flexDir="column" w="100%" pt="6px">
          <Input
            isRequired
            mt="0"
            id="complements-item-name"
            label={t('Nome do item')}
            placeholder={t('Nome do item')}
            value={name}
            handleChange={(ev) => setName(ev.target.value)}
          />
          <Textarea
            isRequired
            id="complements-item-description"
            label={t('Descrição do item')}
            placeholder={t('Descreva seu item')}
            value={description}
            onChange={(ev) => setDescription(ev.target.value)}
            maxH="130px"
          />
          <Text fontSize="xs" color="gray.700">
            0/1000
          </Text>
          <HStack spacing={4} mt="4">
            <CurrencyInput
              mt="0"
              id="complements-item-price"
              label={t('Preço')}
              value={price}
              onChangeValue={(value) => setPrice(value)}
            />
            <Input
              id="complements-item-pdv"
              label={t('Código PDV')}
              placeholder={t('000')}
              value={externalId}
              handleChange={(ev) => setExternalId(ev.target.value)}
            />
          </HStack>
          <Flex mt="4" justifyContent="flex-end">
            <Button variant="dangerLight" w="120px" mr="4" onClick={onCancel}>
              {t('Cancelar')}
            </Button>
            <Button type="submit" w="120px">
              {t('Salvar')}
            </Button>
          </Flex>
        </Flex>
      </HStack>
    </form>
  );
};