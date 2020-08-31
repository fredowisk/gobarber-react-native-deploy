// o hook useImperativeHandle passa informações do componente filho, para o pai
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
// Todas as propriedades que um input pode receber dentro do react native
import { TextInputProps } from 'react-native';
import { useField } from '@unform/core';

import { Container, TextInput, Icon } from './styles';

interface InputProps extends TextInputProps {
  // A propriedade name não é obrigatória nos inputs do React Native.
  // mas vamos utiliza-la na biblioteca unform
  name: string;
  icon: string;
  containerStyle?: {};
}
interface InputValueReference {
  value: string;
}

interface InputRef {
  focus(): void;
}
// a propriedade ref é a unica que não pode ser passada normalmente junto as outras
// ela é passada separadamente como um segundo parametro
// o RefFowardingComponent é utilizado quando o ref é passado como parametro.
// então precisamos passar dois parametros na definição da interface.
const Input: React.RefForwardingComponent<InputRef, InputProps> = (
  { name, icon, containerStyle = {}, ...rest },
  ref,
) => {
  // variavel que será utilizada na função que seta valor.
  const inputElementRef = useRef<any>(null);
  // passando o nome do input dentro da função useField
  // caso defaultValue não tenha valor, coloque uma string vazia
  const { registerField, defaultValue = '', fieldName, error } = useField(name);
  // No react native não conseguimos utilizar .value nos inputs
  // então teremos que criar uma maneira de conseguir saber seu valor.
  const inputValueRef = useRef<InputValueReference>({ value: defaultValue });

  // estados para ver se o input está selecionado ou não.
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    // Se tiver algo dentro desta variavel coloque true.
    setIsFilled(!!inputValueRef.current.value);
  }, []);

  useImperativeHandle(ref, () => ({
    focus() {
      inputElementRef.current.focus();
    },
  }));

  // Assim que o elemento surgir na tela, ele será salvo no unform
  useEffect(() => {
    registerField<string>({
      name: fieldName,
      ref: inputValueRef.current,
      path: 'value',
      // O que irá acontecer quando nosso input receber um novo valor do unform ?
      setValue(value) {
        inputValueRef.current.value = value;
        inputElementRef.current.setNativeProps({ text: value });
      },
      clearValue() {
        inputValueRef.current.value = '';
        inputElementRef.current.clear();
      },
    });
  }, [fieldName, registerField]);

  return (
    <Container style={containerStyle} isFocused={isFocused} isErrored={!!error}>
      <Icon
        name={icon}
        size={20}
        color={isFocused || isFilled ? '#ff9000' : '#666360'}
      />

      <TextInput
        ref={inputElementRef}
        keyboardAppearance="dark"
        placeholderTextColor="#666360"
        // valor default caso exista
        defaultValue={defaultValue}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        // função que será disparada toda vez que o texto do input for alterado
        onChangeText={value => {
          inputValueRef.current.value = value;
        }}
        {...rest}
      />
    </Container>
  );
};

// precisamos exportar desta maneira quando utilizamos o RefFowardingComponent
export default forwardRef(Input);
