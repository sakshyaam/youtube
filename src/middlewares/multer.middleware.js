import multer from "multer";
//using disk storage

// req -> coming from user (if file coming ->, file -> itself mutler have, 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    
    cb(null, file.originalname)
  }
})

export const upload = multer({ storage: storage })