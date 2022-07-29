import multer from "multer";

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpg": "jpg",
    "image/jpeg": "jpg"
  }
  
  const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      const isValid = MIME_TYPE_MAP[file.mimetype];
      let err = new Error("Invalid file type!");
      if (isValid) {
        err = null;
      }
      callback(err, "uploads"); 
    },
    filename: (req, file, callback) => {
      const name = file.originalname.toLowerCase().split(" ").join("-");
      const ext = MIME_TYPE_MAP[file.mimetype];
      callback(null, name + "-" + Date.now() + "." + ext);
    }
  });

const fileUploader = multer({storage: storage}).single("image");

export default fileUploader;