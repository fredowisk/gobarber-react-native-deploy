import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

import { Platform, Alert } from 'react-native';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  UserAvatar,
  Content,
  ProvidersListContainer,
  ProvidersList,
  ProviderContainer,
  ProviderAvatar,
  ProviderName,
  Calendar,
  Title,
  OpenDatePickerButton,
  OpenDatePickerButtonText,
  Schedule,
  Section,
  SectionTitle,
  SectionContent,
  Hour,
  HourText,
  CreateAppointmentButton,
  CreateAppointmentButtonText,
} from './styles';

// interface para reconher o ID
interface RouteParams {
  providerId: string;
}

export interface Provider {
  id: string;
  name: string;
  avatar_url: string;
}
// sempre que tivermos um estado que é um array, precisamos criar uma interface
interface AvailabilityItem {
  hour: number;
  available: boolean;
}

const CreateAppointment: React.FC = () => {
  // pegando o usuário logado
  const { user } = useAuth();
  const route = useRoute();
  // importando o goBack que fará a tela voltar para a tela anterior
  const { goBack, navigate } = useNavigation();
  // passando os parametros da rota com as propriedades da interface
  // para que ela consiga acessar o providerId
  const routeParams = route.params as RouteParams;

  // criando um estado para o date picker não ficar o sempre na tela
  const [showDatePicker, setShowDatePicker] = useState(false);
  // estado que vai pegar a data selecionada
  const [selectedDate, setSelectedDate] = useState(new Date());
  // estado que vai pegar a hora selecionada. Começando ele com 0 para garantir que ele será um número
  const [selectedHour, setSelectedHour] = useState(0);
  // estado que armazena os providers
  const [providers, setProviders] = useState<Provider[]>([]);
  // estado que armazena se o dia está disponivel ou não
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  // estado que vai armazenar qual usuário está selecionado, recebendo o ID
  const [selectedProvider, setSelectedProvider] = useState(
    routeParams.providerId,
  );
  // fazendo uma chamada a api, pra pegar todos os providers
  useEffect(() => {
    api.get('providers').then(response => {
      setProviders(response.data);
    });
  }, []);

  // quando quisermos que o useEffect seja recarregado, é só colocarmos a variável
  // que será mudada nas dependências
  useEffect(() => {
    api
      .get(`providers/${selectedProvider}/day-availability`, {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(response => {
        setAvailability(response.data);
      });
  }, [selectedDate, selectedProvider]);

  // função que será disparada ao clicar na seta de retorno
  const navigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // Função que vai fazer o usuário conseguir selecionar os outros providers
  const handleSelectProvider = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
  }, []);

  // função que vai fazer aparecer o calendário na tela
  const handleToggleDatePicker = useCallback(() => {
    // se criarmos uma função dentro de um set de um estado
    // o parâmetro sempre vai pegar o valor antigo e setar o novo
    setShowDatePicker(state => !state);
  }, []);

  // função que irá mudar o dia quando selecionar outro dia
  const handleDateChanged = useCallback(
    (event: any, date: Date | undefined) => {
      // se o sistema operacional for android
      if (Platform.OS === 'android') {
        setShowDatePicker(false);
      }
      // se a data existir, coloque ela como a data selecionada
      if (date) setSelectedDate(date);
    },
    [],
  );

  const handleSelectHour = useCallback((hour: number) => {
    setSelectedHour(hour);
  }, []);

  const handleCreateAppointment = useCallback(async () => {
    try {
      // criando uma variavel date que recebe a data selecionada para que
      // eu consiga manipular as horas e os minutos dela
      const date = new Date(selectedDate);

      date.setHours(selectedHour - 1);
      date.setMinutes(0);

      await api.post('appointments', {
        provider_id: selectedProvider,
        date,
      });
      // passando um objeto date, pois assim iremos conseguir manipular ele na tela de sucesso
      navigate('AppointmentCreated', { date: date.getTime() });
    } catch (err) {
      Alert.alert(
        'Erro ao criar agendamento',
        'Ocorreu um erro ao tentar criar o agendamento, tente novamente',
      );
    }
  }, [navigate, selectedDate, selectedHour, selectedProvider]);

  // use memo vai memorizar um valor, e vai recalcular toda vez que a variavel
  // availability tiver seu valor modificado
  const morningAvailability = useMemo(() => {
    // eu quero filtrar apenas os horarios que sejam antes de meio dia
    return (
      availability
        .filter(({ hour }) => hour < 12)
        // e mapear para que eles tenham o formato com 00 no final
        .map(({ hour, available }) => {
          return {
            hour,
            available,
            hourFormatted: format(new Date().setHours(hour), 'HH:00'),
          };
        })
    );
  }, [availability]);

  // organizando os horários após 12:00
  const afternoonAvailability = useMemo(() => {
    // eu quero filtrar apenas os horarios que sejam antes de meio dia
    return (
      availability
        .filter(({ hour }) => hour >= 12)
        // e mapear para que eles tenham o formato com 00 no final
        .map(({ hour, available }) => {
          return {
            hour,
            available,
            hourFormatted: format(new Date().setHours(hour), 'HH:00'),
          };
        })
    );
  }, [availability]);

  return (
    <Container>
      <Header>
        <BackButton onPress={navigateBack}>
          <Icon name="chevron-left" size={24} color="#999591" />
        </BackButton>
        <HeaderTitle>Cabeleireiros</HeaderTitle>

        <UserAvatar source={{ uri: user.avatar_url }} />
      </Header>
      <Content>
        <ProvidersListContainer>
          <ProvidersList
            // mudando o scroll para horizontal
            horizontal
            // tirando a barrinha de scroll
            showsHorizontalScrollIndicator={false}
            data={providers}
            keyExtractor={provider => provider.id}
            renderItem={({ item: provider }) => (
              <ProviderContainer
                onPress={() => handleSelectProvider(provider.id)}
                selected={provider.id === selectedProvider}
              >
                <ProviderAvatar source={{ uri: provider.avatar_url }} />
                <ProviderName selected={provider.id === selectedProvider}>
                  {provider.name}
                </ProviderName>
              </ProviderContainer>
            )}
          />
        </ProvidersListContainer>

        <Calendar>
          <Title>Escolha a data</Title>
          <OpenDatePickerButton onPress={handleToggleDatePicker}>
            <OpenDatePickerButtonText>
              Selecionar outra data
            </OpenDatePickerButtonText>
          </OpenDatePickerButton>
          {showDatePicker && (
            <DateTimePicker
              mode="date"
              display="calendar"
              onChange={handleDateChanged}
              value={selectedDate}
            />
          )}
        </Calendar>
        <Schedule>
          <Title>Escolha o horário</Title>
          <Section>
            <SectionTitle>Manhã</SectionTitle>
            <SectionContent>
              {morningAvailability.map(({ hourFormatted, hour, available }) => (
                <Hour
                  // se ele não estiver disponível ele não pode ser clicado
                  enabled={available}
                  selected={selectedHour === hour}
                  available={available}
                  key={hourFormatted}
                  onPress={() => handleSelectHour(hour)}
                >
                  <HourText selected={selectedHour === hour}>
                    {hourFormatted}
                  </HourText>
                </Hour>
              ))}
            </SectionContent>
          </Section>
          <Section>
            <SectionTitle>Tarde</SectionTitle>
            <SectionContent>
              {afternoonAvailability.map(
                ({ hourFormatted, hour, available }) => (
                  <Hour
                    enabled={available}
                    // ele vai ficar selecionado, se as horas forem iguais
                    selected={selectedHour === hour}
                    available={available}
                    key={hourFormatted}
                    onPress={() => handleSelectHour(hour)}
                  >
                    <HourText selected={selectedHour === hour}>
                      {hourFormatted}
                    </HourText>
                  </Hour>
                ),
              )}
            </SectionContent>
          </Section>
        </Schedule>

        <CreateAppointmentButton onPress={handleCreateAppointment}>
          <CreateAppointmentButtonText>Agendar</CreateAppointmentButtonText>
        </CreateAppointmentButton>
      </Content>
    </Container>
  );
};

export default CreateAppointment;
