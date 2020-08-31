import React from 'react';

import { AuthProvider } from './auth';

// Children são componentes internos
const AppProvider: React.FC = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

export default AppProvider;
