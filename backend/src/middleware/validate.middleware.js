export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      const err = parsed.error;
      err.status = 400;
      return next(err);
    }
    req[source] = parsed.data;
    next();
  };
}
