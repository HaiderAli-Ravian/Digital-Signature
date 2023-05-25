const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const speakeasy = require('speakeasy')
const qrcode = require('qrcode')

let crypto = require("crypto");


const userModel = require('../models/user');

const router = express.Router();


//********************************************************************************** */

router.post('/signup', async (req, res) => {

    try {

        let name = req.body.name
        let email = req.body.email
        let password = req.body.password

        const isPresent = await userModel.findOne({ email: email })

        if (isPresent) {

            return res.status(400).send({
                message: "Email is already registered"
            })

        } else {

            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            const secretKey = speakeasy.generateSecret({
                name: 'GCUL-CMS'
            })

            const user = new userModel({
                name: name,
                email: email,
                password: hashedPassword,
                secretKey: secretKey
            })

            const result = await user.save()

            const { _id } = await result.toJSON();
            const token = jwt.sign({ _id: _id }, 'iamthesecret')
            res.cookie('signupJwt', token, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            })
            // console.log('cookie stored')

            res.send({
                message: 'success'
            })

        }

    } catch (error) {

        // console.log(error);
        res.status(500).send({
            message: 'Internal Server Error'
        });

    }

})



//**************************************************************************************** */


router.get('/qrcode', async (req, res) => {

    try {

        const cookie = req.cookies['signupJwt'];

        const claims = jwt.verify(cookie, 'iamthesecret')
        if (!claims) {
            return res.status(401).send({
                message: 'Unauthenticated'
            })
        }

        const user = await userModel.findOne({ _id: claims._id });

        const secretKey = user.secretKey;

        qrcode.toDataURL(secretKey.otpauth_url, (err, data) => {
            if (err) throw err;
            // console.log(data);
            res.send({ qrCodeString: data });

        })

    } catch (error) {

        // console.log(error);
        res.status(500).send({
            message: 'Internal Server Error'
        });

    }

})


router.post('/qrcode/verify', async (req, res) => {

    try {

        const code = req.body.verificationCode;

        const cookie = req.cookies['signupJwt'];

        const claims = jwt.verify(cookie, 'iamthesecret')
        if (!claims) {
            return res.status(401).send({
                message: 'Unauthenticated'
            })
        }

        const user = await userModel.findOne({ _id: claims._id });

        const secretKey = user.secretKey;

        let authenticated = speakeasy.totp.verify({
            secret: secretKey.ascii,
            encoding: 'ascii',
            token: code
        })

        // console.log(authenticated);

        if (!authenticated) {
            return res.status(400).send({
                message: 'Verification code is incorrect'
            })
        }

        res.send({
            message: 'success'
        })



    } catch (error) {

        // console.log(error);
        res.status(500).send({
            message: 'Internal Server Error'
        });

    }
})



//******************************************************************************************* */


router.post('/login', async (req, res) => {

    try {

        const user = await userModel.findOne({ email: req.body.email })

        if (!user) {
            return res.status(404).send({
                message: "User not Found"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).send({
                message: 'Password is Incorrect'
            })
        }


        const secretKey = user.secretKey;
        const code = req.body.verificationCode

        let authenticated = speakeasy.totp.verify({
            secret: secretKey.ascii,
            encoding: 'ascii',
            token: code
        })

        // console.log(authenticated);

        if (!authenticated) {
            return res.status(400).send({
                message: 'Verification code is incorrect'
            })
        }


        const token = jwt.sign({ _id: user._id }, 'iamthesecret');

        res.cookie('loginJwt', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })

        res.send({
            message: 'success'
        })


    } catch (error) {

        // console.log(error);
        res.status(500).send({
            message: 'Internal Server Error'
        });

    }

})




//******************************************************************************************* */


router.post('/tfa-verification', async (req, res) => {

    try {

        const userVerificationCode = req.body.userVerificationCode;

        const cookie = req.cookies['loginJwt'];

        const claims = jwt.verify(cookie, 'iamthesecret')
        if (!claims) {
            return res.status(401).send({
                message: 'Unauthenticated'
            })
        }

        const user = await userModel.findOne({ _id: claims._id });

        const secretKey = user.secretKey;

        let authenticated = speakeasy.totp.verify({
            secret: secretKey.ascii,
            encoding: 'ascii',
            token: userVerificationCode
        })

        if (!authenticated) {
            return res.status(400).send({
                message: 'Verification code is incorrect.'
            })
        }

        res.send({
            message: 'success'
        })

    } catch (error) {

        // console.log(error);
        res.status(500).send({
            message: 'Internal Server Error'
        });

    }
})



//********************************************************************************************* *

// router.get('/user', async (req, res) => {

//     try {

//         const cookie = req.cookies['jwt'];

//         const claims = jwt.verify(cookie, 'iamthesecret')
//         if (!claims) {
//             return res.status(401).send({
//                 message: 'Unauthenticated'
//             })
//         }

//         const user = await userModel.findOne({ _id: claims._id });

//         const { password, ...data } = await user.toJSON()

//         res.send(data)

//     } catch (error) {
//         console.log(error);
//     }

// })

//*********************************************************************************************/


router.post('/logout', (req, res) => {

    try {

        res.cookie("jwt", "", { maxAge: 0 })

        res.send({

            message: 'success'
        })

    } catch (error) {

        // console.log(error);
        res.status(500).send({
            message: 'Internal Server Error'
        });

    }
})


//*********************************************************************************************/
//******************************************Digital Signature***************************************************/
//*********************************************************************************************/


// localhost:3000/generate-key-pair
router.get("/generate-key-pair", (req, res) => {
    let publickey = '';
    let privatekey = '';
  
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 720,
      publicKeyEncoding: {
        type: "spki",
        format: "der",
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "der",
      },
    });
  
    publickey = publicKey.toString("base64");
    privatekey = privateKey.toString("base64");
  
    res.send({
      publickey: publickey,
      privatekey: privatekey
    });
  });
  
  
  // localhost:3000/upload
  router.post("/upload", (req, res) => {
    // let data = req.body.convertedString;
    let privateKey = req.body.privateKey;
  
    privateKey = crypto.createPrivateKey({
      key: Buffer.from(privateKey, "base64"),
      type: "pkcs8",
      format: "der",
    });



  });
  
  router.post('/sign', (req, res) => {
    let data = req.body.convertedString; // Retrieve the data from the request body
    let privateKey = req.body.privateKey;
  
    privateKey = crypto.createPrivateKey({  
      key: Buffer.from(privateKey, "base64"),
      type: "pkcs8",
      format: "der",
    }); 
    
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    const signature = sign.sign(privateKey).toString('base64');
  
  
    res.send({ signature });
  });
  
  
  // localhost:3000/verify
  router.post("/verifyDocument", (req, res) => {
    try{

    let data = req.body.convertedString; // Retrieve the data from the request body
    let signature = req.body.generatedSignature; // Retrieve the data from the request body
    let publicKey = req.body.publicKey; // Retrieve the data from the request body

    

    // let { data, signature, publicKey } = req.body;
  
    publicKey = crypto.createPublicKey({
      key: Buffer.from(publicKey, "base64"),
      type: "spki",
      format: "der",
    });
  
    const verify = crypto.createVerify("SHA256");
    verify.update(data);
    verify.end();
  
    let result = verify.verify(publicKey, Buffer.from(signature, "base64"));
    console.log(result)
    res.send({ documentVerificationStatus: result });

    }
  
  catch(err){
    res.send(err);
  }
  
  });
  




module.exports = router

