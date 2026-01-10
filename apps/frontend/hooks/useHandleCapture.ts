import { uploadDocument, uploadFile } from "@/services/api.routes";

export const useHandleCapture = async (
    file: File,
    dataUrl: string,
    type: string,
    onStageChange?: (stage: 'uploading' | 'analyzing' | 'complete') => void
) => {
    try {
        // Stage 1: Uploading to cloud storage
        onStageChange?.('uploading');

        const formData = new FormData();
        formData.append('file', file)
        formData.append('upload_preset', 'medilink')
        formData.append("folder", "patient/docs")
        const repsonse = await uploadFile(formData)

        if (repsonse.status === 200) {
            // Stage 2: AI Analysis
            onStageChange?.('analyzing');

            const response = await uploadDocument({
                fileUrl: repsonse.data.secure_url,
                type: type,
                imageData: dataUrl // Send base64 image data for AI analysis
            })

            if (response.status === 200) {
                // Stage 3: Complete
                onStageChange?.('complete');
                return response.data;
            }
        }
    } catch (error) {
        console.error("Error in useHandleCapture:", error);
        throw error;
    }
}
