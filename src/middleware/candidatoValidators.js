import { body } from 'express-validator';
import { runValidations } from './validators.js';

export const validarRegistroCandidato = runValidations([
    body('correo_usuario').isEmail().withMessage('Correo inválido'),
    body('password_usuario').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
    body('nombre_candidato').notEmpty().withMessage('Nombre requerido')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Solo letras'),
    body('apellido_candidato').notEmpty().withMessage('Apellido requerido')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Solo letras'),
    body('telefono_candidato').notEmpty().withMessage('Teléfono requerido')
]);

export { validarLoginEmpresa as validarLoginCandidato } from './empresaValidators.js';