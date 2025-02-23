import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //cb(null, file.fieldname + '-' + uniqueSuffix);
    const fileExtension = file.originalname.split(".")[1];
    const fileNameWithExtension = `${file.fieldname}-${uniqueSuffix}.${fileExtension}`;
    cb(null, fileNameWithExtension);
  },
});
  
export const upload = multer({ storage });