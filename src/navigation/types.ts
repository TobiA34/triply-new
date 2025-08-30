import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Setup: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;