import { Global, Module } from '@nestjs/common';
import { RbacScopeService } from './services/rbac-scope.service';

@Global()
@Module({
  providers: [RbacScopeService],
  exports: [RbacScopeService],
})
export class RbacScopeModule {}
