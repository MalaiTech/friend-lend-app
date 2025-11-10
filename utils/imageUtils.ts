
import { File, Paths } from 'expo-file-system';

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
    
    // Create a file in the document directory using the new FileSystem API
    const file = new File(Paths.document, filename);
    
    // Copy the file
    await file.copy(sourceUri);
    
    console.log('Image copied to:', file.uri);
    
    // Verify the file exists
    const exists = await file.exists();
    if (exists) {
      console.log('Image successfully copied and verified');
      return file.uri;
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
    const documentPath = Paths.document;
    if (uri.startsWith(documentPath)) {
      const file = new File(uri);
      const exists = await file.exists();
      if (exists) {
        await file.delete();
        console.log('Deleted local image:', uri);
      }
    }
  } catch (error) {
    console.error('Error deleting local image:', error);
  }
}
