const asyncHandler = (fn) => async (req, res, next) => {
  try {
    return await fn(req, res, next);
  } catch (error) {
    console.error(error);  // Log error for debugging
    res.status(error.code || 500).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }
};


export default asyncHandler; // ✅ Corrected export


