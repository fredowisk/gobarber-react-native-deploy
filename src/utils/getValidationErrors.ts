import { ValidationError } from 'yup';

// A interface Erros, recebe key pois ela pode ter mais, ou menos campos necessários
// dependendo do formulário
interface Errors {
  [key: string]: string;
}
export default function getValidationErrors(err: ValidationError): Errors {
  const validationErrors: Errors = {};

  // Os erros estão dentro do inner, e para cada um desses erros
  // a variável validationErros receberá uma propriedade path e o valor dela será a mensagem.
  err.inner.forEach(error => {
    validationErrors[error.path] = error.message;
  });

  return validationErrors;
}
