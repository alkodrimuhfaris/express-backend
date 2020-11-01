const sendMail = require('nodemailer')

module.exports = {
  mailHelper: (data) => {
    const connection = sendMail.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      ignoreTLS: false,
      secure: false,
      auth: {
        user: 'teamtukuofficial@gmail.com',
        pass: 'tuku123tuku'
      }
    })

    const options = {
      from: 'teamtukuofficial@gmail.com',
      to: data[0],
      subject: 'Here Your Password Reset',
      html: `<h1>Hello ${data[0]} this is your reset code</h1>
                   <h4>${data[1]}</h4>
                   <p>Did you request to reset your password?</p>
                   <p>Ignore it if you dont request it, maybe you can try to change your password if you fill
                   something suspicious activity in your account</p>`
    }

    return new Promise((resolve, reject) => {
      connection.sendMail(options, (error, info) => {
        if (error) {
          reject(error)
        } else {
          resolve(info)
        }
      })
    })
  }
}
