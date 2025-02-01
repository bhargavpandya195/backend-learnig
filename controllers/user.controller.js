import asyncHandler from "../utils/asyncHandler.js";


const registerUser = asyncHandler(async (req, res) => {
  

  const { userName, email, fullName, password } = req.body;
  console.log("email", email);

  
});

export default registerUser;