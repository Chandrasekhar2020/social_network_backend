// Start of Selection
const { db, admin } = require("../config/firebase");
const { initializeApp } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
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
  const { displayName, email, password } = req.body;
  try {
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
    if (userRecord.emailVerified) {
      return res.status(400).json({ message: "Email is already verified." });
    }
    // Generate a new email verification link
    const verificationLink = await admin
      .auth()
      .generateEmailVerificationLink(email, {
        // Optionally, you can add actionCodeSettings here
        url: "https://www.example.com/finishSignUp?cartId=1234",
        handleCodeInApp: true,
      });
    // TODO: Send the verificationLink via your email service provider
    // For example, using SendGrid, Nodemailer, etc.
    // Example:
    // await sendEmail(email, verificationLink);
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
  // Start of Selection
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

module.exports = {
  signup,
  login,
  resendVerificationEmail,
};
