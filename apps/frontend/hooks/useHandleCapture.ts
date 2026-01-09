import { uploadDocument, uploadFile } from "@/services/api.routes";

export const useHandleCapture = async (file: File, dataUrl: string, type: string) => {
    const formData = new FormData();
    formData.append('file', file)
    formData.append('upload_preset', 'medilink')
    formData.append("folder", "patient/docs")
    const repsonse = await uploadFile(formData)


    if (repsonse.status === 200) {
        const response = await uploadDocument({
            fileUrl: repsonse.data.secure_url,
            type: type,
            imageData: dataUrl // Send base64 image data for AI analysis
        })
        if (response.status === 200) {
            return response.data;
        }
    }
}
