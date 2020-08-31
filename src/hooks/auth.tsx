import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface AuthState {
  token: string;
  user: User;
}

interface SignInCredentials {
  email: string;
  password: string;
}

interface AuthContextData {
  user: User;
  loading: boolean;
  signIn(credentials: SignInCredentials): Promise<void>;
  signOut(): void;
  updateUser(user: User): Promise<void>;
}

// Criando um contexto vazio e forçando sua tipagem a ser do tipo AuthContextData
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Criando um componente
export const AuthProvider: React.FC = ({ children }) => {
  // o estado é o melhor lugar para armazenar informações.
  const [data, setData] = useState<AuthState>({} as AuthState);
  // Criando um estado de loading para quando o aplicativo estiver carregando.
  const [loading, setLoading] = useState(true);

  // utilizamos o use effect pois ele será uma função que será disparada assim que
  // este elemento surgir em tela
  // essa função vai no storage e busca o data, para preencher o data aqui dentro.
  useEffect(() => {
    // criamos uma função nova, pois não é possivel utilizar async no useEffect.
    async function loadStoragedData(): Promise<void> {
      const [token, user] = await AsyncStorage.multiGet([
        '@GoBarber:token',
        '@GoBarber:user',
      ]);

      // verificando a autenticação caso o usuário nunca tenha logado
      if (token[1] && user[1]) {
        api.defaults.headers.authorization = `Bearer ${token[1]}`;
        // utilizando a posição 1 no array para pegar o valor, pois na posição 0 está o ID
        setData({ token: token[1], user: JSON.parse(user[1]) });
      }

      setLoading(false);
    }

    loadStoragedData();
  }, []);

  // Utilizando o Callback para criar uma função assincrona que recebe como parâmetro,
  // o email e a senha.
  const signIn = useCallback(async ({ email, password }) => {
    // utilizando post na rota sessions, passando pra ela o email e a senha.
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data;

    // Utilizando o local storage para salvar o token e o user.
    // o '@GoBarber' é um prefixo.
    await AsyncStorage.multiSet([
      ['@GoBarber:token', token],
      // transformando o objeto user em uma string.
      ['@GoBarber:user', JSON.stringify(user)],
    ]);

    api.defaults.headers.authorization = `Bearer ${token}`;

    setData({ token, user });
  }, []);

  // Metodo que para deslogar
  const signOut = useCallback(async () => {
    // limpando o localStorage
    await AsyncStorage.multiRemove(['@GoBarber:user', '@GoBarber:token']);

    // Deixando o data vazio
    setData({} as AuthState);
  }, []);

  const updateUser = useCallback(
    async (user: User) => {
      await AsyncStorage.setItem('@GoBarber:user', JSON.stringify(user));

      setData({
        token: data.token,
        user,
      });
    },
    [setData, data.token],
  );

  return (
    <AuthContext.Provider
      value={{ user: data.user, loading, signIn, signOut, updateUser }}
    >
      {/* Repassando tudo o que foi recebido como parâmetro */}
      {children}
    </AuthContext.Provider>
  );
};

// Função que verifica se o contexto ainda não foi criado, e o retorna.
export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
