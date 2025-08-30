import React from 'react';
import { SvgXml } from 'react-native-svg';
import suitcaseIcon from '../../assets/icons/suitcase.svg';

export type IconName = 'suitcase';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

const icons: Record<IconName, string> = {
  suitcase: suitcaseIcon,
};

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = 'black' }) => {
  return <SvgXml xml={icons[name]} width={size} height={size} color={color} />;
};
