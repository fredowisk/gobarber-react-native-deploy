import React from 'react';
import { render } from 'react-native-testing-library';

import SignIn from '../../pages/SignIn';

// mockando a função use navigation, dizendo que ela vai retornar uma função vazia.
jest.mock('@react-navigation/native', () => {
  return {
    useNavigation: jest.fn(),
  };
});

describe('SignIn page', () => {
  it('should contains email/password inputs', () => {
    // renderizando o SignIn, para começar os testes
    const { getByPlaceholder } = render(<SignIn />);

    // eu espero que o placeholder e-mail e senha existam
    expect(getByPlaceholder('E-mail')).toBeTruthy();
    expect(getByPlaceholder('Senha')).toBeTruthy();
  });
});
