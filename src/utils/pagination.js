import { CustomError } from '../errors/custom-error.js';
import { ERROR_CODES } from '../errors/error-codes.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export function parsePagination(query = {}) {
  const rawPage = query.page ?? DEFAULT_PAGE;
  const rawLimit = query.limit ?? DEFAULT_LIMIT;
  const page = Number(rawPage);
  const limit = Number(rawLimit);

  if (!Number.isInteger(page) || page < 1) {
    throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
      reason: 'page debe ser un número entero mayor o igual a 1.',
    });
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw CustomError.create(ERROR_CODES.INVALID_INPUT, {
      reason: `limit debe ser un número entero entre 1 y ${MAX_LIMIT}.`,
    });
  }

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function buildPaginationMeta({ page, limit, total }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    page,
    limit,
    total,
    totalPages,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
});
