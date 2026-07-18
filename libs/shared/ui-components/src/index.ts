// @cosmaria/shared-ui-components — biblioteca de componentes React Native (doc 11 §7,
// doc 14 §9). Consome @cosmaria/shared-design-tokens; nunca hardcode de valor.
// Button é o componente piloto (ui-kit §26 / component-library família 8);
// IconButton é a ação só-ícone (ui-kit §26.8 / component-library família 9).

export { Button } from './button/button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './button/button';

export { IconButton } from './icon-button/icon-button';
export type {
  IconButtonProps,
  IconButtonHierarchy,
  IconButtonSize,
  IconButtonShape,
  IconRenderProps,
} from './icon-button/icon-button';
