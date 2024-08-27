import jwt from "jsonwebtoken";

const generateTokenAndSetCookie = (userId, res) => {
	const token = jwt.sign({ userId }, 'secretKey12354', {
		expiresIn: "15d",
	});

	try {
		res.cookie("jwt", token, {
		  maxAge: 15 * 24 * 60 * 60 * 1000,
		  httpOnly: true,
		  sameSite: "strict",
		  secure: process.env.NODE_ENV !== "development",
		});
		console.log("Cookie set successfully");
	  } catch (error) {
		console.error("Error setting cookie:", error);
	  }
	  
};

export default generateTokenAndSetCookie;