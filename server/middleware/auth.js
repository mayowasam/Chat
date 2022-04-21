const jwt = require('jsonwebtoken')

const auth =  async (req, res, next) => {
    try{
        //token is sent in form of 'bearer asfghjkl ' in the request headers object
        // console.log(req.headers)
        // const token =  req.headers['authorization'].split(' ')[1]
        const token =  req.cookies.accessToken.split(' ')[1]

        // console.log('auth token', token)
        if (!token) return res.status(400).json({ success: false, message:"no token, you are not allowed" })
        const decodeToken = await jwt.verify(token,process.env.ACCESS_TOKEN)
        
        // the decoded token has the id in used to sign the jwt when i signed in
        // console.log('auth decodeToken', decodeToken)
        if (!decodeToken) return res.status(400).json({ success: false, message:"Invalid token" })

        req.user = decodeToken.user
        // console.log('auth req.user', req.user)
         next()
    }catch (err) {
        res.status(401).json({success: false, message:"Invalid token"})
    }
   
}

module.exports = auth
