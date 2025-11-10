
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
    const random = Math.floor(Math.random() * 10000);
    const filename = `contact_photo_${timestamp}_${random}.jpg`;
    
    // Create destination path in document directory
    const destinationUri = `${FileSystem.documentDirectory}${filename}`;
    
    console.log('Destination URI:', destinationUri);
    
    // Copy the file using FileSystem
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
    
    console.log('Image copied successfully to:', destinationUri);
    
    // Verify the file exists
    const fileInfo = await FileSystem.getInfoAsync(destinationUri);
    if (fileInfo.exists) {
      console.log('Image successfully copied and verified, size:', fileInfo.size);
      return destinationUri;
    } else {
      console.error('Image copy verification failed - file does not exist');
      return undefined;
    }
  } catch (error) {
    console.error('Error copying image to local storage:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // If copying fails, try to use the original URI
    // This might work for some URIs but not persist
    try {
      const fileInfo = await FileSystem.getInfoAsync(sourceUri);
      if (fileInfo.exists) {
        console.log('Original URI is accessible, using it directly');
        return sourceUri;
      }
    } catch (checkError) {
      console.error('Original URI is not accessible either:', checkError);
    }
    
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
