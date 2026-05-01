// uploadMedia.js
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { storage, db } from "./firebase";

export const uploadMedia = async (file, type, onProgress) => {
  // type = "images" or "videos"

  // Step 1: Create a storage reference
  const storageRef = ref(storage, `${type}/${Date.now()}_${file.name}`);

  // Step 2: Upload the file with progress tracking
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",

      // Progress tracking
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress.toFixed(0)}% done`);
        if (onProgress) onProgress(Math.round(progress)); // ✅ Send progress to React component
      },

      // Error handler
      (error) => {
        console.error("Upload failed:", error.code, error.message);
        reject(new Error(`[${error.code}] ${error.message}`));
      },

      // Success handler
      async () => {
        try {
          // Step 3: Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          // Step 4: Save metadata + URL to Firestore
          const docRef = await addDoc(collection(db, type), {
            name: file.name,
            url: downloadURL,
            type: file.type,
            size: file.size,
            uploadedAt: serverTimestamp(),
          });

          console.log("Saved to Firestore with ID:", docRef.id);
          resolve({ id: docRef.id, url: downloadURL });

        } catch (err) {
          reject(err);
        }
      }
    );
  });
};
