const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Registrar um novo usuário
// @access  Público
router.post(
  '/register',
  [
    check('username', 'Nome de usuário é obrigatório').not().isEmpty(),
    check('email', 'Por favor, inclua um email válido').isEmail(),
    check('password', 'Por favor, insira uma senha com 6 ou mais caracteres').isLength({ min: 6 })
  ],
  authController.register
);

// @route   POST /api/auth/login
// @desc    Autenticar usuário e obter token
// @access  Público
router.post(
  '/login',
  [
    check('email', 'Por favor, inclua um email válido').isEmail(),
    check('password', 'Senha é obrigatória').exists()
  ],
  authController.login
);

// @route   GET /api/auth/me
// @desc    Obter perfil do usuário atual
// @access  Privado
router.get('/me', authController.authenticate, authController.getProfile);

// @route   PUT /api/auth/me
// @desc    Atualizar perfil do usuário
// @access  Privado
router.put(
  '/me',
  authController.authenticate,
  [
    check('username', 'Nome de usuário é obrigatório').optional().not().isEmpty(),
    check('email', 'Por favor, inclua um email válido').optional().isEmail()
  ],
  authController.updateProfile
);

module.exports = router;
