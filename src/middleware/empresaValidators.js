import { body } from 'express-validator';
import { runValidations } from './validators.js';


export const validarRegistroEmpresa = runValidations([

  body('correo_usuario')
    .isEmail()
    .withMessage('Correo inválido'),

  body('password_usuario')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener mínimo 6 caracteres'),

  body('nombre_empresa')
    .notEmpty()
    .withMessage('Nombre empresa requerido'),

 body('nombre_contacto_empresa')
    .notEmpty()
    .withMessage('Contacto requerido')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras'),

  body('telefono_empresa')
    .notEmpty()
    .withMessage('Teléfono requerido'),

  body('ubicacion_empresa')
    .notEmpty()
    .withMessage('Ubicación requerida')

]);


export const validarLoginEmpresa = runValidations([

  body('correo_usuario')
    .isEmail()
    .withMessage('Correo inválido'),

  body('password_usuario')
    .notEmpty()
    .withMessage('Contraseña requerida')

]);