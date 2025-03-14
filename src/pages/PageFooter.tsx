import { Box, Button, Flex, Link, Text } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { t } from 'utils/i18n';
import { OnboardingProps } from './onboarding/types';

interface Props extends OnboardingProps {
  isLoading?: boolean;
  isDisabled?: boolean;
  deleteLabel?: string;
  onDelete?(): void;
  submitLabel?: string;
}

const PageFooter = ({
  onboarding,
  redirect,
  isLoading,
  isDisabled = false,
  deleteLabel,
  onDelete,
  submitLabel,
}: Props) => {
  // helpers
  const showSkip = onboarding && !['1', '2'].includes(onboarding) && redirect;
  const buttonLabel = submitLabel ?? t('Salvar');
  // UI
  return (
    <Box mt="8">
      <Text>* Campos obrigatórios</Text>
      <Flex
        mt="4"
        flexDir={{ base: 'column', md: 'row' }}
        alignItems="center"
        justifyContent="space-between"
      >
        <Button
          w={{ base: '100%', md: 'auto' }}
          minW="200px"
          type="submit"
          size="lg"
          fontSize="sm"
          fontWeight="500"
          fontFamily="Barlow"
          isLoading={isLoading}
          loadingText={t('Salvando')}
          isDisabled={isDisabled}
        >
          {onboarding ? t('Salvar e continuar') : buttonLabel}
        </Button>
        {!onboarding && deleteLabel && (
          <Button
            w={{ base: '100%', md: 'auto' }}
            mt={{ base: '8', md: '0' }}
            size="lg"
            fontSize="sm"
            variant="dangerLight"
            onClick={onDelete}
            isLoading={isLoading}
            loadingText={t('Excluindo')}
          >
            {deleteLabel}
          </Button>
        )}
        {showSkip && (
          <Link ml="8" as={RouterLink} to={redirect!}>
            <Text textStyle="link">{t('Pular etapa e preencher depois')}</Text>
          </Link>
        )}
      </Flex>
    </Box>
  );
};

export default PageFooter;
