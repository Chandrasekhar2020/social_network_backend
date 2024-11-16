const { db, admin } = require("../config/firebase");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} = require("firebase/auth");

const { getUserProfile } = require("../services/authService");

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
};

initializeApp(firebaseConfig);

const auth = getAuth();

const signup = async (req, res) => {
  const { displayName, email, password, phoneNumber } = req.body;
  try {
    const userDetails = await admin.auth().getUserByEmail(email);
    if (!userDetails.emailVerified) {
      return res.status(400).json({ error: "Email is not verified" });
    }
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    await sendEmailVerification(user);
    console.log("Verification email sent.");

    // Create user document in Firestore
    await db
      .collection("users")
      .doc(user.uid)
      .set({
        displayName: displayName || "",
        email: user.email,
        phoneNumber: phoneNumber || "",
        createdAt: new Date().toISOString(),
      });

    res.status(200).json({
      uid: user.uid,
      email: user.email,
      message:
        "Please verify your email address before logging in. Check your inbox for the verification link.",
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
};

const resendVerificationEmail = async (req, res) => {
  const { email } = req.body;
  try {
    // Fetch the user by email using Firebase Admin SDK
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Check if email is already verified
    if (userRecord.emailVerified) {
      return res.status(400).json({ 
        error: "Email is already verified",
        code: "auth/email-already-verified"
      });
    }
    
    await sendEmailVerification(userRecord.user);
    
    console.log("Verification email resent.");
    res.status(200).json({
      message: "Verification email sent successfully. Please check your inbox.",
      email: email,
    });
  } catch (error) {
    console.error("Error resending verification email:", error);
    res.status(500).json({ error: "Failed to send verification email." });
  }
};

const login = (req, res) => {
  const { email, password } = req.body;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (!user.emailVerified) {
        throw {
          message: "Email not verified.",
          code: "auth/email-not-verified",
        };
      }
      return user.getIdToken().then((idToken) => ({ user, idToken }));
    })
    .then(({ user, idToken }) => {
      res
        .status(200)
        .json({ uid: user.uid, email: user.email, token: idToken });
    })
    .catch((error) => {
      console.error("Error during login:", error);
      res.status(400).json({ error: error.message, code: error.code });
    });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    await sendPasswordResetEmail(auth, email);
    res.status(200).json({
      message: "Password reset email sent successfully. Please check your inbox.",
      email: email,
    });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    res.status(400).json({ error: error.message, code: error.code });
  }
};

module.exports = {
  signup,
  login,
  resendVerificationEmail,
  forgotPassword,
};
