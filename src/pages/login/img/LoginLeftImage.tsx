import { Image } from '@chakra-ui/react';
import React from 'react';
import image from './login-left@2x.jpg';

export default function LoginLeftImage() {
  return <Image src={image} objectFit="contain" alt="" />;
}