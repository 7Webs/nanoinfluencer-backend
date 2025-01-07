export function dataURLtoMulterFile(dataurl: string): Express.Multer.File {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const buffer = Buffer.from(arr[1], 'base64');

  // Create a Multer-like file object
  const file: Express.Multer.File = {
    fieldname: 'image',
    originalname: `file_${Date.now()}.png`, // Use the correct extension based on mime type
    encoding: '7bit', // Default encoding
    mimetype: mime,
    size: buffer.length,
    buffer: buffer,
    destination: '',
    filename: '',
    path: '',
    stream: null, // Optional if using streaming APIs
  };

  return file;
}
