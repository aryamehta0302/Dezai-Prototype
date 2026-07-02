import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { jwtVerify } from 'jose';

/**
 * JwtAuthGuard extracts the Bearer JWT token from the Request headers,
 * verifies it using the shared AUTH_SECRET via 'jose', and attaches
 * the authenticated user payload to the Request object.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    // Primary: Authorization header. Fallback: ?token= query param (for SSE EventSource).
    let token: string | undefined;

    if (authHeader) {
      const [type, headerToken] = authHeader.split(' ');
      if (type !== 'Bearer' || !headerToken) {
        throw new UnauthorizedException('Invalid token format. Use Bearer <token>');
      }
      token = headerToken;
    } else if (request.query?.token && request.headers.accept?.includes('text/event-stream')) {
      // SSE connections via browser EventSource cannot send custom headers,
      // so we accept the JWT as a query parameter fallback.
      token = request.query.token as string;
    } else {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const secretString = process.env.AUTH_SECRET;
    if (!secretString) {
      throw new UnauthorizedException('Authentication secret is not configured on the backend');
    }

    try {
      const secret = new TextEncoder().encode(secretString);
      const { payload } = await jwtVerify(token, secret);

      // Attach decoded user payload to request
      request.user = {
        id: payload.id as string,
        email: payload.email as string,
        role: payload.role as string,
        onboarded: payload.onboarded as boolean,
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Session expired or invalid token');
    }
  }
}
