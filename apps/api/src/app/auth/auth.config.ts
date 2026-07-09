import type { JwtConfig } from '@cosmaria/core-infrastructure';

/**
 * Configuração de auth lida do ambiente (doc 15 §8). Segredos NUNCA são
 * commitados — os defaults abaixo servem só para dev/local e devem ser
 * substituídos por variáveis de ambiente em produção.
 */
export function jwtConfigFromEnv(): JwtConfig {
  return {
    accessSecret: process.env.ACCESS_TOKEN_SECRET ?? 'dev-access-secret-troque-em-producao',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET ?? 'dev-refresh-secret-troque-em-producao',
    accessTtlSegundos: Number(process.env.ACCESS_TOKEN_TTL ?? 900), // 15 min
    refreshTtlSegundos: Number(process.env.REFRESH_TOKEN_TTL ?? 604800), // 7 dias
  };
}
