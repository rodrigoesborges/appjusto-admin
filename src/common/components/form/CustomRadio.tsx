import { Center, Flex, HStack, Radio, RadioProps } from '@chakra-ui/react';

const CustomRadio = ({ children, w, h, mt, mb, ...props }: RadioProps) => {
  const containerProps = { w, h, mt, mb };
  return (
    <HStack {...containerProps}>
      <Center
        border="2px solid black"
        position="relative"
        w="24px"
        h="24px"
        borderRadius="12px"
        boxShadow="none"
        overflow="hidden"
      >
        <Radio
          cursor="pointer"
          size="lg"
          boxShadow="none"
          bgColor="white"
          borderColor="white"
          _checked={{ bgColor: 'green.500', outline: 'none' }}
          {...props}
        />
      </Center>
      <Flex h="100%" alignItems="center">
        {children}
      </Flex>
    </HStack>
  );
};

export default CustomRadio;
