import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

interface RouteTarget {
  prefix: string;
  service: keyof GatewayService['serviceUrls'];
  public?: boolean;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  readonly serviceUrls = {
    auth: this.config.get('AUTH_SERVICE_URL', 'http://localhost:8081'),
    workflow: this.config.get('WORKFLOW_SERVICE_URL', 'http://localhost:8082'),
    trigger: this.config.get('TRIGGER_SERVICE_URL', 'http://localhost:8083'),
    orchestrator: this.config.get('ORCHESTRATOR_SERVICE_URL', 'http://localhost:8084'),
    executor: this.config.get('EXECUTOR_SERVICE_URL', 'http://localhost:8085'),
    log: this.config.get('LOG_SERVICE_URL', 'http://localhost:8086'),
  } as const;

  private readonly routes: RouteTarget[] = [
    { prefix: '/auth', service: 'auth' },
    { prefix: '/api/v1/workflows', service: 'workflow' },
    { prefix: '/api/v1/triggers', service: 'trigger' },
    { prefix: '/webhook', service: 'trigger', public: true },
    { prefix: '/api/v1/executions', service: 'orchestrator' },
    { prefix: '/api/v1/executor', service: 'executor' },
    { prefix: '/api/v1/logs', service: 'log' },
  ];

  private readonly publicAuthPaths = [/^\/auth\/register$/, /^\/auth\/login$/, /^\/auth\/refresh-token$/];

  constructor(
    private readonly http: HttpService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async proxyRequest(req: Request, res: Response) {
    const target = this.routes.find((route) => req.path.startsWith(route.prefix));
    if (!target) {
      res.status(404).json({ message: 'No upstream service for path', path: req.path });
      return;
    }

    const baseUrl = this.serviceUrls[target.service];
    const url = `${baseUrl}${req.originalUrl}`;
    const headers = { ...req.headers } as Record<string, string>;

    if (!this.isPublicPath(req.path, target)) {
      const token = this.extractToken(headers['authorization']);
      const payload = this.verifyToken(token);
      if (payload?.user_id) {
        headers['x-user-id'] = payload.user_id;
      }
    }

    delete headers['host'];

    try {
      const response = await firstValueFrom(
        this.http.request({
          method: req.method as any,
          url,
          headers,
          data: req.body,
          params: req.query,
        }),
      );
      res.status(response.status).set(response.headers).send(response.data);
    } catch (error: any) {
      const status = error?.response?.status || 502;
      res.status(status).json({
        message: 'Upstream request failed',
        upstreamStatus: status,
        error: error?.response?.data || error?.message,
      });
    }
  }

  private isPublicPath(path: string, target: RouteTarget) {
    if (target.public) {
      return true;
    }
    return this.publicAuthPaths.some((regex) => regex.test(path));
  }

  private extractToken(header?: string) {
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing');
    }
    return header.substring(7);
  }

  private verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      this.logger.warn('JWT verification failed');
      throw new UnauthorizedException('Invalid token');
    }
  }
}
