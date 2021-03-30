import { Alert, AlertDescription, AlertIcon, AlertProps, AlertTitle, Flex } from '@chakra-ui/react';

interface Props extends AlertProps {
  title: string;
  description: string;
  icon?: boolean;
  children?: React.ReactNode | React.ReactNode[];
}

export const AlertWarning = ({ title, description, icon = true, children, ...props }: Props) => (
  <Alert
    mt="4"
    status="warning"
    color="black"
    border="1px solid #FFBE00"
    borderRadius="lg"
    {...props}
  >
    {icon && <AlertIcon />}
    <Flex flexDir="column">
      <AlertTitle mr={2}>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {children}
    </Flex>
  </Alert>
);
