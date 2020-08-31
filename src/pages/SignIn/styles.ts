import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper';

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 0 50px ${Platform.OS === 'android' ? 120 : 40}px;
`;

export const Title = styled.Text`
  font-size: 24px;
  color: #f4ede8;
  font-family: 'Roboto-Medium';
  margin: 64px 0 24px;
`;

// não usaremos o rectbutton porque este botão é apenas um texto.
export const ForgotPassword = styled.TouchableOpacity`
  margin-top: 26px;
`;

export const ForgotPasswordText = styled.Text`
  color: #f4ede8;
  font-size: 16px;
  font-family: 'Roboto-Regular';
`;

export const CreateAccountButton = styled.TouchableOpacity`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0%;
  background: #312e38;
  /* No border, primeiro precisamos dizer o tamanho
  e depois a cor, não podemos fazer ambos ao mesmo tempo. */
  border-top-width: 1px;
  border-color: #232129;
  padding: 14px 0 ${14 + getBottomSpace()}px;

  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

export const CreateAccountButtonText = styled.Text`
  color: #ff9000;
  font-size: 18px;
  font-family: 'Roboto-Regular';
  margin-left: 16px;
`;
