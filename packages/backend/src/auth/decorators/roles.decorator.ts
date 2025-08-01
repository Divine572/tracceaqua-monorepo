import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';
import { ROLES_KEY } from '../guards/role.guard';

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);