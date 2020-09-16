const multer = require('multer')
const path = require('path')

function Uploader (_req, _res, next) {
  // storage engine
  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, './Assets/Public/Photos')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
  })

  // initial upload
  const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb)
    },
    limits: { filesize: 5000000 }
  }).single('image')

  // function check File Type
  function checkFileType (file, cb) {
    const filetypes = /jpeg|jpg|png|gif/
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = filetypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      return cb('Error : Images only!')
    }
  }

  // app post
  // app.post('/upload', (req, res) => {
  //   upload(req, res, (err) => {
  //     if (err) {
  //       res.status(500).send({
  //         msg: err
  //       })
  //     } else {
  //       console.log(req.file)
  //       res.send('test')
  //     }
  //   })
  // })
}

module.exports = Uploader
