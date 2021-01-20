import { Checkbox, CheckboxGroup, Flex, Switch, Text, VStack } from '@chakra-ui/react';
import * as menu from 'app/api/business/menu/functions';
import { FileDropzone } from 'common/components/FileDropzone';
import { CurrencyInput } from 'common/components/form/input/currency-input/CurrencyInput2';
import { CustomInput as Input } from 'common/components/form/input/CustomInput';
import { CustomTextarea as Textarea } from 'common/components/form/input/CustomTextarea';
import { useProductContext } from 'pages/menu/context/ProductContext';
import React from 'react';
import { t } from 'utils/i18n';
import { DrawerButtons } from '../DrawerButtons';
import { CategorySelect } from './CategorySelect';
import { productReducer } from './productReducer';

const initialState = {
  //product
  name: '',
  description: '',
  price: 0,
  classifications: [],
  imageUrl: null,
  externalId: '',
  enabled: true,
  complementsOrder: menu.empty(),
  complementsEnabled: false,
  //details
  categoryId: '',
  previewURL: null,
  imageFile: null,
  isLoading: false,
  isEditing: false,
};

export const ProductDetails = () => {
  //context
  const { productId, product, onSaveProduct, onDeleteProduct } = useProductContext();
  //state
  const [state, dispatch] = React.useReducer(productReducer, initialState);
  const {
    //product
    name,
    description,
    price,
    classifications,
    imageUrl,
    externalId,
    enabled,
    complementsOrder,
    complementsEnabled,
    //details
    categoryId,
    previewURL,
    imageFile,
    isLoading,
    isEditing,
  } = state;
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (product) {
      dispatch({
        type: 'update_state',
        payload: {
          name: product.name,
          description: product.description ?? '',
          price: product.price ?? 0,
          classifications: product.classifications ?? [],
          imageUrl: product.image_url ?? null,
          externalId: product.externalId ?? '',
          enabled: product.enabled ?? true,
          complementsOrder: product.complementsOrder,
          complementsEnabled: product.complementsEnabled ?? false,
          isEditing: productId === 'new' ? false : true,
        },
      });
    }
  }, [product]);

  const handleStateUpdate = (key: string, value: any) => {
    dispatch({ type: 'update_state', payload: { [key]: value } });
  };

  const onDropHandler = React.useCallback(async (acceptedFiles: File[]) => {
    const [file] = acceptedFiles;
    const url = URL.createObjectURL(file);
    //add file to imageFile
    handleStateUpdate('imageFile', file);
    //add url to previewURL
    handleStateUpdate('previewURL', url);
  }, []);

  const onSave = () => {
    handleStateUpdate('isLoading', true);
    onSaveProduct(
      {
        name,
        description,
        price,
        classifications,
        image_url: imageUrl,
        externalId,
        enabled,
        complementsOrder,
        complementsEnabled,
      },
      imageFile
    );
  };

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        onSave();
      }}
    >
      <Input
        isRequired
        id="product-drawer-name"
        ref={inputRef}
        value={name}
        label={t('Nome')}
        placeholder={t('Nome do produto')}
        onChange={(ev) => handleStateUpdate('name', ev.target.value)}
      />
      <CategorySelect
        isRequired
        value={categoryId}
        onChange={(ev) => handleStateUpdate('categoryId', ev.target.value)}
      />
      <Textarea
        isRequired
        id="product-drawer-description"
        value={description}
        label={t('Descrição')}
        placeholder={t('Descreva seu produto')}
        onChange={(ev) => handleStateUpdate('description', ev.target.value)}
        maxLength={1000}
      />
      <Text fontSize="xs" color="gray.700">
        {description?.length}/1000
      </Text>
      <CurrencyInput
        isRequired
        maxW="220px"
        id="drawer-price"
        value={price}
        label={t('Preço')}
        placeholder={t('0,00')}
        onChangeValue={(value) => handleStateUpdate('price', value)}
      />
      <Text mt="8" fontSize="sm" color="black">
        {t('Caso possua um sistema de controle de PDV, insira o código abaixo:')}
      </Text>
      <Input
        id="product-pdv"
        mt="2"
        maxW="220px"
        label="Código PDV"
        placeholder="000"
        value={externalId ? externalId : ''}
        handleChange={(ev) => handleStateUpdate('externalId', ev.target.value)}
      />
      <Text mt="8" fontSize="xl" color="black">
        {t('Imagem do produto')}
      </Text>
      <Text>
        {t('Recomendamos imagens na proporção retangular (16:9) com no mínimo 1280px de largura')}
      </Text>
      <FileDropzone mt="4" onDropFile={onDropHandler} preview={previewURL ?? imageUrl} />
      <Text mt="8" fontSize="xl" color="black">
        {t('Classificações adicionais:')}
      </Text>
      <CheckboxGroup
        colorScheme="green"
        value={classifications}
        onChange={(value) => handleStateUpdate('classifications', value)}
      >
        <VStack alignItems="flex-start" mt="4" color="Black" spacing={2}>
          <Checkbox iconColor="white" value="vegetarian">
            {t('Vegetariano')}
          </Checkbox>
          <Checkbox iconColor="white" value="vegan">
            {t('Vegano')}
          </Checkbox>
          <Checkbox iconColor="white" value="organic">
            {t('Orgânico')}
          </Checkbox>
          <Checkbox iconColor="white" value="gluten_free">
            {t('Sem glúten')}
          </Checkbox>
          <Checkbox iconColor="white" value="no_sugar">
            {t('Sem açúcar')}
          </Checkbox>
          <Checkbox iconColor="white" value="zero_lactose">
            {t('Zero lactose')}
          </Checkbox>
        </VStack>
      </CheckboxGroup>{' '}
      <Flex mt="8" flexDir="row" alignItems="center" spacing={2}>
        <Switch
          isChecked={enabled}
          onChange={(ev) => {
            ev.stopPropagation();
            handleStateUpdate('enabled', ev.target.checked);
          }}
        />
        <Text ml="4" color="black">
          {t('Ativar produto após a criação')}
        </Text>
      </Flex>
      <DrawerButtons
        type="product"
        isEditing={isEditing}
        isLoading={isLoading}
        onDelete={onDeleteProduct}
      />
    </form>
  );
};