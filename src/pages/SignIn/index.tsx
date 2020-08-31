import React, { useCallback, useRef } from 'react';
import {
  Image,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import * as Yup from 'yup';

import { Form } from '@unform/mobile';
import { FormHandles } from '@unform/core';

import { useAuth } from '../../hooks/auth';

import getValidationErrors from '../../utils/getValidationErrors';

import Input from '../../components/Input';
import Button from '../../components/Button';

import logoImg from '../../assets/logo.png';

import {
  Container,
  Title,
  ForgotPassword,
  ForgotPasswordText,
  CreateAccountButton,
  CreateAccountButtonText,
} from './styles';

interface SignInFormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  // Utilizamos o Ref sempre que quisermos modifica-lo de forma direta
  // sem depender de eventos como ex: "onclick"
  const formRef = useRef<FormHandles>(null);
  // ref que será usada no input de senha, para conseguir passar o foco pra ele.
  const passwordInputRef = useRef<TextInput>(null);
  const navigation = useNavigation();

  const { signIn } = useAuth();

  const handleSignIn = useCallback(
    async (data: SignInFormData) => {
      try {
        // Fazendo os erros começarem vazios.
        formRef.current?.setErrors({});

        // schema é utilizado quando se quer validar um objeto inteiro, no caso o 'data'.
        // o Yup receberá um objecto e será desta forma 'shape'
        const schema = Yup.object().shape({
          email: Yup.string()
            .required('E-mail obrigatório')
            .email('Digite um e-mail válido'),
          password: Yup.string().required('Senha obrigatória'),
        });

        // passando a variável data para ser validada pelo schema.
        await schema.validate(data, {
          // o abortEarly faz com que o Yup não pare no primeiro erro,
          // e mostre todos de uma vez só.
          abortEarly: false,
        });

        // autenticação
        await signIn({
          email: data.email,
          password: data.password,
        });
      } catch (err) {
        // verificando se o erro é uma instancia do Yup
        if (err instanceof Yup.ValidationError) {
          const errors = getValidationErrors(err);
          // O ponto de interrogação verifica se a variável existe, para depois chamar a função
          // setErrors
          formRef.current?.setErrors(errors);

          return;
        }
        // disparar um toast no mobile
        Alert.alert(
          'Erro na autenticação',
          'Ocorreu um erro ao fazer login, cheque as credenciais.',
        );
      }
    },
    [signIn],
  );

  return (
    <>
      <KeyboardAvoidingView
        // Se o SO for ios, o behavior vai ser padding, dando um padding bottom
        // e no caso do android será undefined.
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // mantendo a keyboardAvoidView acionada por padrão.
        enabled
      >
        <ScrollView
          // Será que o teclado deve continuar aberto quando eu apertar aqui ?
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}
        >
          <Container>
            <Image source={logoImg} />
            <View>
              <Title>Faça seu logon</Title>
            </View>

            <Form ref={formRef} onSubmit={handleSignIn}>
              <Input
                // Não utilize corretor
                autoCorrect={false}
                // não deixe a primeira letra maiuscula
                autoCapitalize="none"
                // Adiciona o @ no teclado
                keyboardType="email-address"
                name="email"
                icon="mail"
                placeholder="E-mail"
                // adicionando o botão próximo no teclado virtual
                returnKeyType="next"
                // função que vai fazer o foco ir para o submit abaixo
                onSubmitEditing={() => {
                  passwordInputRef.current?.focus();
                }}
              />

              <Input
                ref={passwordInputRef}
                name="password"
                icon="lock"
                placeholder="Senha"
                // transformando a senha em bolinhas
                secureTextEntry
                // adicionando o botão enviar no teclado virtual
                returnKeyType="send"
                // função que vai fazer o botão enviar funcionar
                onSubmitEditing={() => {
                  formRef.current?.submitForm();
                }}
              />
              <Button
                onPress={() => {
                  // o ponto de interrogação é uma verificação
                  // para saber se a variavel formRef estará vazia ou não.
                  formRef.current?.submitForm();
                }}
              >
                Entrar
              </Button>
            </Form>

            <ForgotPassword onPress={() => navigation.navigate('Forgot')}>
              <ForgotPasswordText>Esqueci minha senha</ForgotPasswordText>
            </ForgotPassword>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>

      <CreateAccountButton onPress={() => navigation.navigate('SignUp')}>
        <Icon name="log-in" size={20} color="#ff9000" />
        <CreateAccountButtonText>Criar uma conta</CreateAccountButtonText>
      </CreateAccountButton>
    </>
  );
};

export default SignIn;
