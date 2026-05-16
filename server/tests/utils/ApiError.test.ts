import ApiError from '../../src/utils/ApiError';

describe('ApiError Utility', () => {
  it('should create error with status code and message', () => {
    const error = new ApiError(400, 'Bad Request');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad Request');
    expect(error).toBeInstanceOf(Error);
  });

  it('should handle different status codes', () => {
    const errors = [
      new ApiError(400, 'Bad Request'),
      new ApiError(401, 'Unauthorized'),
      new ApiError(403, 'Forbidden'),
      new ApiError(404, 'Not Found'),
      new ApiError(500, 'Internal Server Error'),
    ];

    errors.forEach((error) => {
      expect(error.statusCode).toBeGreaterThanOrEqual(400);
      expect(error.statusCode).toBeLessThan(600);
    });
  });

  it('should preserve error stack trace', () => {
    const error = new ApiError(400, 'Test Error');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ApiError');
  });
});
