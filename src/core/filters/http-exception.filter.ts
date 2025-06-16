import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomErrorResponse } from '../response/custom-error.response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        const res = response as any;

        if (Array.isArray(res.message)) {
          message = res.message;
        } else if (res.message) {
          message = res.message;
        } else {
          message = res;
        }
      }
    }

    const errorResponse = new CustomErrorResponse(
      status,
      message,
      false,
      null,
      new Date().toISOString(),
    );

    response.status(status).json(errorResponse);
  }
}
