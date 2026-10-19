//Expresión regular estándar y universal para validar la estructura de cualquier email
//Es decir, usuario@dominio.extensión 
const validaEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//El export es para poder usar esta funcion en las rutas
export const funcionValEmail = (req, res, next) => {
    const { email } = req.body;

    if(email && !validaEmail.test(email.toLowerCase())){
        return res.status(400).json({
            error: "El formato del Email no es válido. Por favor incluir el @ y un dominio correcto."
        });
    }

     //Ya aquí si el email esta bien validado, se continua
    next(); 
};