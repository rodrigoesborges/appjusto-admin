import { Box, Flex, Heading, Text, TextProps } from '@chakra-ui/react';
import { t } from 'utils/i18n';
import packageInfo from '../../package.json';
const version = packageInfo.version;

interface Props extends TextProps {
  title: string;
  subtitle?: string;
  showVersion?: boolean;
}

const PageHeader = ({ title, subtitle, showVersion, ...props }: Props) => {
  // UI
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading color="black" fontSize="2xl" mt="4" {...props}>
          {title}
        </Heading>
        {showVersion && (
          <Text
            mt="4"
            fontSize="11px"
            lineHeight="18px"
            fontWeight="700"
            letterSpacing="0.6px"
          >
            {t(`VERSÃO: ${version ?? 'N/E'}`)}
          </Text>
        )}
      </Flex>
      {subtitle && (
        <Text mt="1" fontSize="sm" maxW="580px" {...props}>
          {subtitle}
        </Text>
      )}
    </Box>
  );
};

export default PageHeader;
