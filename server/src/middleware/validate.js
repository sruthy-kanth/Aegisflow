import { sendError } from '../utils/apiResponse.js';

export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Assign parsed values back to request
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      if (error.errors) {
        const issues = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        return sendError(res, 'Validation error', 400, issues);
      }
      return sendError(res, 'Invalid request parameters', 400);
    }
  };
}
