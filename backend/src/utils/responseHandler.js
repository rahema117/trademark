const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

const sendPaginated = (res, data = [], pagination = {}, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      page: Number(pagination.page) || 1,
      limit: Number(pagination.limit) || 20,
      total: Number(pagination.total) || 0,
      totalPages: Number(pagination.totalPages) || 0,
    },
    message,
  });
};

const sendError = (res, message = 'An error occurred', statusCode = 400, errors = [], stack = null) => {
  const response = {
    success: false,
    message,
  };

  if (Array.isArray(errors) && errors.length > 0) {
    response.errors = errors;
  }

  // Ensure stack traces are NEVER sent in production mode
  if (process.env.NODE_ENV !== 'production' && stack) {
    response.stack = stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendPaginated,
  sendError,
};
