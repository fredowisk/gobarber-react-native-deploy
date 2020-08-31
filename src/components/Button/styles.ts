import styled from 'styled-components/native';
import { RectButton } from 'react-native-gesture-handler';

// Sempre que for estilizar um componente que vem
// de fora do react Native, usar ().
export const Container = styled(RectButton)`
  width: 100%;
  height: 60px;
  background: #ff9000;
  border-radius: 10px;
  margin-top: 10px;

  /* No react native todos os elementos possuem flex */
  justify-content: center;
  align-items: center;
`;

export const ButtonText = styled.Text`
  font-family: 'Roboto-Medium';
  color: #312e38;
  font-size: 18px;
`;
