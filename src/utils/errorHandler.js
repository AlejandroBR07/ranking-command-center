// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      message: message.join(', '),
      statusCode: 400
    };
  }

  // Erro de duplicata do Mongoose
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} já existe`;
    error = {
      message,
      statusCode: 400
    };
  }

  // Erro de cast do Mongoose (ID inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = {
      message,
      statusCode: 404
    };
  }

  // Erro de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = {
      message,
      statusCode: 401
    };
  }

  // Erro de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = {
      message,
      statusCode: 401
    };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor'
  });
};

// Middleware para capturar erros async
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  asyncHandler
};
