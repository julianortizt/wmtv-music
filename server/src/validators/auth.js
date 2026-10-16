export const validateRegister = (body) => {
  const errors = [];

  if (!body.email || !body.email.includes("@")) {
    errors.push("Email inválido");
  }
  if (!body.username || body.username.length < 3) {
    errors.push("Username debe tener al menos 3 caracteres");
  }
  if (!body.password || body.password.length < 6) {
    errors.push("Password debe tener al menos 6 caracteres");
  }

  return errors;
};

export const validateLogin = (body) => {
  const errors = [];
  if (!body.email) errors.push("Email es requerido");
  if (!body.password) errors.push("Password es requerido");
  return errors;
};
