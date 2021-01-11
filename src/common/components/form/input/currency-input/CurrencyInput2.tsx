import { FormControl, FormLabel, Input, InputProps, useMultiStyleConfig } from '@chakra-ui/react';
import React from 'react';
import { formatFloatToRawValue, formattedRawValue, formatToFloat, getRawValue } from './utils';

interface Props extends InputProps {
  id: string;
  label?: string;
  value: number;
  onChangeValue: (value: number) => void;
}

export const CurrencyInput = ({
  id,
  mt,
  mb,
  mr,
  ml,
  flex,
  value,
  label,
  onChangeValue: onValueChange,
  ...props
}: Props) => {
  //props
  const controlProps = { mt, mb, mr, ml, flex };
  // state
  const [priceText, setPriceText] = React.useState('');
  // side effects
  React.useLayoutEffect(() => {
    // keep internal state in sync with value received
    // and format parent value to raw value
    const parentRawValue = formatFloatToRawValue(value);
    setPriceText(parentRawValue);
  }, [value]);
  //handler
  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = getRawValue(ev.target.value);
    const floatValue = formatToFloat(newValue);
    onValueChange(floatValue);
  };
  // UI
  const styles = useMultiStyleConfig('CustomInput', {});
  return (
    <FormControl id={id} sx={styles.control} {...controlProps}>
      {label && <FormLabel sx={styles.label}>{label}</FormLabel>}
      <Input
        value={formattedRawValue(priceText)}
        onChange={handleChange}
        sx={styles.input}
        maxLength={8}
        {...props}
      />
    </FormControl>
  );
};