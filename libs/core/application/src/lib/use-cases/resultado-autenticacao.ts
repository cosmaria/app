/**
 * Resultado comum de login e refresh — o par de tokens emitido.
 * (Os DTOs HTTP ficam em @cosmaria/shared-contracts; este é o tipo interno da aplicação.)
 */
export interface ResultadoAutenticacao {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  usuario: {
    id: string;
    email: string;
  };
}
