
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
    
    // Create destination path in document directory using the new API
    const destinationUri = `${FileSystem.Paths.document}/${filename}`;
    
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
      console.log('Image copy verification failed - file does not exist, using original URI');
      return sourceUri;
    }
  } catch (error) {
    console.log('Could not copy image to local storage, using original URI');
    
    // If copying fails, try to use the original URI
    // This might work for some URIs but not persist
    try {
      const fileInfo = await FileSystem.getInfoAsync(sourceUri);
      if (fileInfo.exists) {
        console.log('Original URI is accessible, using it directly');
        return sourceUri;
      }
    } catch (checkError) {
      console.log('Original URI is not accessible');
    }
    
    // Return the original URI anyway - let the Image component handle it
    return sourceUri;
  }
}

/**
 * Delete an image from local storage
 */
export async function deleteLocalImage(uri: string): Promise<void> {
  try {
    // Only delete if it's in our document directory
    if (uri.startsWith(FileSystem.Paths.document || '')) {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(uri);
        console.log('Deleted local image:', uri);
      }
    }
  } catch (error) {
    console.log('Could not delete local image:', uri);
  }
}
