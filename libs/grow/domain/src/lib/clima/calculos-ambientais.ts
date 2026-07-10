/**
 * Cálculos ambientais do Grow (doc 02 §5.6).
 *
 * São funções puras e determinísticas: dado o mesmo registro, o mesmo VPD. É por isso
 * que os valores derivados podem ser **persistidos junto do registro bruto** (doc 08
 * §12.2) sem risco de divergirem de um recálculo futuro.
 *
 * Este arquivo calcula. Ele deliberadamente **não classifica**: dizer se um VPD está
 * "saudável" para a fase é papel do Motor de Alertas da IA (doc 05), que é quem detém os
 * limiares e os calibra com o histórico do próprio usuário. Fixar faixas agronômicas
 * aqui criaria uma segunda fonte de verdade, fora do módulo que decide sobre alertas.
 */

/** Segundos num dia de luz por hora — usado na conversão PPFD → DLI. */
const SEGUNDOS_POR_HORA = 3600;
const MICROMOLS_POR_MOL = 1_000_000;

/**
 * Pressão de vapor de saturação (kPa) a uma dada temperatura, pela equação de Tetens.
 * É a base do VPD: quanto de água o ar comportaria se estivesse saturado.
 */
export function pressaoDeVaporDeSaturacaoKpa(temperaturaC: number): number {
  return 0.6108 * Math.exp((17.27 * temperaturaC) / (temperaturaC + 237.3));
}

/**
 * VPD — Déficit de Pressão de Vapor, em kPa (doc 02 §5.6).
 *
 * `deltaFolhaC` é quanto a folha está mais fria que o ar (transpiração). Quando
 * informado, calcula o **VPD foliar**, que é o que a planta de fato "sente"; sem ele,
 * calcula o VPD do ar. O padrão é 0 porque supor um delta — mesmo o valor de 2 °C usado
 * na literatura — seria arbitrar um dado de sensor que o usuário não mediu.
 *
 * Fórmula: SVP(folha) − SVP(ar) × UR/100. Nunca negativo: umidade acima da saturação é
 * ruído de sensor, não condensação a ser modelada aqui.
 */
export function calcularVpdKpa(params: {
  temperaturaC: number;
  umidadeRelativa: number;
  deltaFolhaC?: number;
}): number {
  const { temperaturaC, umidadeRelativa } = params;
  const temperaturaDaFolha = temperaturaC - (params.deltaFolhaC ?? 0);

  const svpFolha = pressaoDeVaporDeSaturacaoKpa(temperaturaDaFolha);
  const svpAr = pressaoDeVaporDeSaturacaoKpa(temperaturaC);
  const pressaoAtualDeVapor = svpAr * (umidadeRelativa / 100);

  return Math.max(0, svpFolha - pressaoAtualDeVapor);
}

/**
 * DLI — Integral de Luz Diária, em mol/m²/dia (doc 02 §5.6).
 *
 * Converte a intensidade instantânea (PPFD, em µmol/m²/s) na quantidade total de luz
 * que a planta recebe ao longo do fotoperíodo. É a métrica que permite comparar
 * iluminações diferentes: um LED fraco por muitas horas pode entregar o mesmo DLI que
 * um LED forte por poucas.
 */
export function calcularDli(params: { ppfd: number; horasDeLuz: number }): number {
  return (params.ppfd * params.horasDeLuz * SEGUNDOS_POR_HORA) / MICROMOLS_POR_MOL;
}

/** Arredonda para um número de casas decimais — evita ruído de ponto flutuante no banco. */
export function arredondar(valor: number, casas: number): number {
  const fator = 10 ** casas;
  return Math.round(valor * fator) / fator;
}
