
import * as FileSystem from 'expo-file-system';

/**
 * Copy an image from a source URI (like a contact photo) to the app's document directory
 * This ensures the image is accessible and persists across app sessions
 */
export async function copyImageToLocalStorage(sourceUri: string): Promise<string | undefined> {
  try {
    console.log('Copying image from:', sourceUri);
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `contact_photo_${timestamp}.jpg`;
    const destinationUri = `${FileSystem.documentDirectory}${filename}`;
    
    // Copy the file
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
    
    console.log('Image copied to:', destinationUri);
    
    // Verify the file exists
    const fileInfo = await FileSystem.getInfoAsync(destinationUri);
    if (fileInfo.exists) {
      console.log('Image successfully copied and verified');
      return destinationUri;
    } else {
      console.error('Image copy verification failed');
      return undefined;
    }
  } catch (error) {
    console.error('Error copying image to local storage:', error);
    return undefined;
  }
}

/**
 * Delete an image from local storage
 */
export async function deleteLocalImage(uri: string): Promise<void> {
  try {
    // Only delete if it's in our document directory
    if (uri.startsWith(FileSystem.documentDirectory || '')) {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
        console.log('Deleted local image:', uri);
      }
    }
  } catch (error) {
    console.error('Error deleting local image:', error);
  }
}
