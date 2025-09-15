import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export const exportToFile = async (data: any, filename: string) => {
  try {
    const content = JSON.stringify(data, null, 2);
    const fileUri = `${FileSystem.documentDirectory || ''}${filename}`;
    
    await FileSystem.writeAsStringAsync(fileUri, content);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    } else {
      throw new Error('Sharing is not available on this platform');
    }
  } catch (error) {
    console.error('Error exporting file:', error);
    throw error;
  }
};
