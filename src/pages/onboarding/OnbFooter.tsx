import { Box, Link, Stack, Text } from '@chakra-ui/react';
import Container from 'common/components/Container';
import { Link as RouterLink } from 'react-router-dom';

const OnbFooter = () => {
  return (
    <Box w="100vw" minH="106px" bg="black">
      <Container py="10">
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          color="white"
          fontSize="sm"
          fontWeight="500"
        >
          <Link
            as={RouterLink}
            to="/"
            maxW="170px"
            textDecor="underline"
            _hover={{ color: 'gray.400' }}
          >
            Política de privacidade
          </Link>
          <Link
            as={RouterLink}
            to="/"
            maxW="120px"
            textDecor="underline"
            _hover={{ color: 'gray.400' }}
          >
            Termos de uso
          </Link>
          <Text>© {new Date().getFullYear()} AppJusto. Marca Registrada.</Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default OnbFooter;
