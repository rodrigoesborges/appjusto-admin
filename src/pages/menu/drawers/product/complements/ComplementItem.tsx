import { Box, Button, Flex, HStack, Text } from '@chakra-ui/react';
import { Complement, WithId } from 'appjusto-types';
import { DeleteButton } from 'common/components/buttons/DeleteButton';
import { EditButton } from 'common/components/buttons/EditButton';
import { ReactComponent as DragHandle } from 'common/img/drag-handle.svg';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { t } from 'utils/i18n';
import { ComplementForm } from './ComplementForm';

interface Props {
  item: WithId<Complement>;
  index: number;
  isLoading: boolean;
  handleDelete(complementId: string): void;
}

export const ComplementItem = ({ item, index, isLoading, handleDelete }: Props) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  if (isEditing) {
    return (
      <Flex bg="white" mb="4" borderWidth="1px" borderRadius="lg" alignItems="center" p="2">
        <ComplementForm
          complementId={item.id}
          item={item}
          onSuccess={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      </Flex>
    );
  }

  if (isDeleting) {
    return (
      <Flex bg="white" mb="4" borderWidth="1px" borderRadius="lg" alignItems="center" p="2">
        <Flex flexDir="column" p="4" bg="#FFF8F8">
          <Text textAlign="center">
            {t(`Tem certeza que deseja apagar o complemento `)}
            <Text as="span" fontWeight="700">
              "{item.name}"?
            </Text>
          </Text>
          <HStack mt="4" spacing={4} justifyContent="center">
            <Button size="sm" w="220px" onClick={() => setIsDeleting(false)}>
              {t('Manter')}
            </Button>
            <Button
              size="sm"
              w="220px"
              variant="danger"
              onClick={() => handleDelete(item.id)}
              isLoading={isLoading}
              loadingText={t('Apagando')}
            >
              {t('Apagar')}
            </Button>
          </HStack>
        </Flex>
      </Flex>
    );
  }
  return (
    <Draggable draggableId={item.id} index={index}>
      {(draggable, snapshot) => (
        <Flex
          bg="white"
          mb="4"
          borderWidth="1px"
          borderRadius="lg"
          alignItems="center"
          p="2"
          ref={draggable.innerRef}
          {...draggable.draggableProps}
        >
          <Box bg="white" {...draggable.dragHandleProps} ref={draggable.innerRef}>
            <DragHandle />
          </Box>
          <Flex w="100%" justifyContent="space-between" px="6">
            <Box bg="white" mr="2">
              <Text fontSize="sm" fontWeight="bold">
                {item.name}
              </Text>
              <Text fontSize="xs">{item.description}</Text>
            </Box>
            <Flex maxW="120px" alignItems="center" justifyContent="flex-end">
              <Text fontSize="xs">{item.price}</Text>
              <EditButton onClick={() => setIsEditing(true)} />
              <DeleteButton onClick={() => setIsDeleting(true)} />
            </Flex>
          </Flex>
        </Flex>
      )}
    </Draggable>
  );
};