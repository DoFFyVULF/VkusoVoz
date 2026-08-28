import { NextResponse } from "next/server";
import { ZodError } from "zod";

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYMENT_REQUIRED"
  | "UNPROCESSABLE"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";

export type ApiErrorBody = {
  success: false;
  error: { code: ApiErrorCode; message: string; details?: unknown };
};

export type ApiSuccessBody<T> = {
  success: true;
  data: T;
};

export type ApiResponseBody<T> = ApiSuccessBody<T> | ApiErrorBody;

const statusByCode: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYMENT_REQUIRED: 402,
  UNPROCESSABLE: 422,
  INTERNAL_ERROR: 500,
};

export function ok<T>(data: T, init?: { status?: number; headers?: HeadersInit }): NextResponse<ApiSuccessBody<T>> {
  return NextResponse.json({ success: true, data }, { status: init?.status ?? 200, headers: init?.headers });
}

export function fail(code: ApiErrorCode, message: string, details?: unknown, statusOverride?: number): NextResponse<ApiErrorBody> {
  const status = statusOverride ?? statusByCode[code];
  return NextResponse.json({ success: false, error: { code, message, details } }, { status });
}

export function validationFail(error: ZodError | unknown): NextResponse<ApiErrorBody> {
  if (error instanceof ZodError) {
    const details = error.flatten();
    const message = error.issues[0]?.message ?? "Ошибка валидации";
    return fail("VALIDATION_ERROR", message, details);
  }
  return fail("VALIDATION_ERROR", "Ошибка валидации", error);
}

export function unauthorized(msg = "Требуется авторизация"): NextResponse<ApiErrorBody> {
  return fail("UNAUTHORIZED", msg);
}

export function forbidden(msg = "Доступ запрещён"): NextResponse<ApiErrorBody> {
  return fail("FORBIDDEN", msg);
}

export function notFound(msg = "Не найдено"): NextResponse<ApiErrorBody> {
  return fail("NOT_FOUND", msg);
}

export function internal(msg = "Внутренняя ошибка сервера"): NextResponse<ApiErrorBody> {
  return fail("INTERNAL_ERROR", msg);
}

export function handleUnknown(e: unknown): NextResponse<ApiErrorBody> {
  if (e instanceof ZodError) return validationFail(e);
  if (e instanceof ApiException) return fail(e.code, e.message, e.details, e.status);
  console.error(e);
  return internal();
}

export class ApiException extends Error {
  code: ApiErrorCode;
  status: number;
  details?: unknown;
  constructor(code: ApiErrorCode, message: string, details?: unknown, status?: number) {
    super(message);
    this.code = code;
    this.status = status ?? statusByCode[code];
    this.details = details;
  }
}
