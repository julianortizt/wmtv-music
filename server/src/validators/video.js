export const validateVideo = (body) => {
  const errors = [];
  if (!body.title || body.title.trim().length < 1) {
    errors.push("El título es requerido");
  }
  if (body.title && body.title.length > 255) {
    errors.push("El título es demasiado largo");
  }
  if (body.description && body.description.length > 4000) {
    errors.push("La descripción es demasiado larga");
  }
  return errors;
};
