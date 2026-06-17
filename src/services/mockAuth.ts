export const mockLogin = async (
  email: string,
  password: string
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: {
          id: '1',
          name: 'Usuário Teste',
          email,
        },
      });
    }, 1000);
  });
};

export const mockRegister = async (
  name: string,
  email: string,
  password: string
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        user: {
          id: '2',
          name,
          email,
        },
      });
    }, 1000);
  });
};

export const mockForgotPassword = async (
  email: string
) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Email enviado!',
      });
    }, 1000);
  });
};