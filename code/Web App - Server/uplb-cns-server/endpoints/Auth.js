const AuthEndpoint = require('express').Router();
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library')

// Constants for the expiration of jwt token
const TOKEN_SECRET = process.env.SECRET;
const AUTH_EXPIRY = 60000; // 1 min
const REFRESH_EXPIRY = 1000 * 60 * 60; // 1000 = 1sec; 60 = 1min; 60 = 1hr

// Function For User Login Endpoint
const login = async(req, res) => {
  try {
    // Get details from request body
    const { credential } = req.body;
    // Fetch user and generate tokens
    const res_user = await decode_credential(credential)
    
    if(res_user.email === process.env.ADMIN){
      const name = res_user.given_name
      const tokens = await generateToken(name);
      const user = { name }
      // Set cookie, return user and auth token
      res.cookie('refreshToken', tokens.refresh[0], 
        { maxAge: tokens.refresh[1], path: '/' , secure: true, httpOnly: true}
      )
      return res.json({ 
        success: true,
        user: { ...user, authToken: tokens.auth },
        message: "Successfully logged in",
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Account is not recognized.'
  });
    
  } catch (err) {
    return res.status(500).json({
        success: false,
        message: 'There has been an error: ' + err
    });
  }
}

const decode_credential = async token => {
    const CLIENT_ID_GOOGLE = process.env.CLIENT_ID
    try {
      const client = new OAuth2Client(CLIENT_ID_GOOGLE)
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID_GOOGLE,
      })
      return ticket.payload
    } catch (error) {
      return { status: 500, data: error }
    }
  }

const generateToken = async(name) => {
    const payload = {
        user: { name },
        iat: Date.now(),
      };
    
    // Create auth and refresh tokens
    const auth = jwt.sign(payload, TOKEN_SECRET);
    const refresh = [jwt.sign({ name }, TOKEN_SECRET), REFRESH_EXPIRY];
    
    return ({
        auth,
        refresh
    });
  };

exports.validateAuthToken = (token) => {
    // check if there is a refresh token
    if (!token) throw("Token is missing");

    const isValid = jwt.verify(token, TOKEN_SECRET);

    //check if token is issued by same entity
    if (!isValid) throw("Token is invalid");

    const iat = isValid.iat;
    const now = Date.now();

    // check if token is expired
    if (now > (iat + AUTH_EXPIRY)) {
        throw("Token is expired");
    }
}

const validateRefreshToken = async(token) => {
    // check if there is a refresh token
    if (!token) throw("Token is missing");

    // check if token is issued by same entity
    const isValid = jwt.verify(token, TOKEN_SECRET);
    if (!isValid) throw("Invalid token");

    return isValid.name;
}


// Function For User Referesh Token Endpoint
const refresh = async(req, res) => {
  // Get cookies
  const { refreshToken } = req.cookies; 
  
  try {
    // Get details from request body
    const name = await validateRefreshToken(refreshToken);
    const user = { name };
    const tokens = await generateToken(name);

    res.cookie('refreshToken', tokens.refresh[0], 
      { maxAge: tokens.refresh[1], httpOnly: true, path: '/' }
    )
    return res.json({ success: true, user: {...user, authToken: tokens.auth} });
  } catch(err) {
    return res.status(401).json({ 
        success: false, 
        message: 'Access denied. Login to continue.'
    });

  }
}

// Function for user logout endpoint
const logout = (req, res) => {
  res.clearCookie('refreshToken', { path: '/' });
  return res.json({ 
    success: true, 
    message: "Logged out successfully"
  })
}

AuthEndpoint.post('/', login);
AuthEndpoint.get('/', logout);
AuthEndpoint.get('/refresh', refresh);

module.exports = AuthEndpoint;