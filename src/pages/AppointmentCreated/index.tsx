import React, { useCallback, useMemo } from 'react';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation, useRoute } from '@react-navigation/native';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import {
  Container,
  Title,
  Description,
  OkButton,
  OkButtonText,
} from './styles';

interface RouteParams {
  date: number;
}

const AppointmentCreated: React.FC = () => {
  // pegando a função que faz navegação na tela
  // mas após a navegação ele vai resetar o histórico de telas
  const { reset } = useNavigation();
  const { params } = useRoute();

  const routeParams = params as RouteParams;

  // função de redirecionamento que será disparada ao apertar botão ok
  const handleOkPressed = useCallback(() => {
    reset({
      // array de rotas que você informa todas as rotas que serão resetadas
      routes: [
        {
          name: 'Dashboard',
        },
      ],
      // e para qual rota ele irá ir, no caso a rota 0 do array
      index: 0,
    });
  }, [reset]);

  // formatando a data
  const formattedDate = useMemo(() => {
    return format(
      // data que será formatada
      routeParams.date,
      // Terça, dia 3 de Janeiro de 1998 às 12:00h
      "EEEE', dia' dd 'de' MMMM 'de' yyyy 'às' HH:mm'h'",
      { locale: ptBR },
    );
  }, [routeParams]);
  return (
    <Container>
      <Icon name="check" size={80} color="#04d361" />
      <Title>Agendamento concluído</Title>
      <Description>{formattedDate}</Description>
      <OkButton onPress={handleOkPressed}>
        <OkButtonText>Ok</OkButtonText>
      </OkButton>
    </Container>
  );
};

export default AppointmentCreated;
