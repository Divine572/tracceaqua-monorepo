import {
    Controller,
    Get,
    Put,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from '../auth/dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @UseGuards(AdminGuard)
    @ApiOperation({
        summary: 'Get all users (Admin only)',
        description: 'Retrieve all users with filtering, search, and pagination',
    })
    @ApiResponse({
        status: 200,
        description: 'Users retrieved successfully',
    })
    @ApiResponse({
        status: 403,
        description: 'Admin access required',
    })
    async findAll(@Query() query: UserQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get('stats')
    @UseGuards(AdminGuard)
    @ApiOperation({
        summary: 'Get user statistics (Admin only)',
        description: 'Retrieve user statistics and counts by role/status',
    })
    @ApiResponse({
        status: 200,
        description: 'User statistics retrieved successfully',
    })
    async getStats() {
        return this.usersService.getStats();
    }

    @Get(':id')
    @UseGuards(AdminGuard)
    @ApiOperation({
        summary: 'Get user by ID (Admin only)',
        description: 'Retrieve detailed information about a specific user',
    })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User retrieved successfully',
        type: UserDto,
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Put(':id')
    @UseGuards(AdminGuard)
    @ApiOperation({
        summary: 'Update user (Admin only)',
        description: 'Update user role and status',
    })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User updated successfully',
        type: UserDto,
    })
    @ApiResponse({
        status: 403,
        description: 'Cannot modify yourself',
    })
    @ApiResponse({
        status: 404,
        description: 'User not found',
    })
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @CurrentUser() admin: any,
    ) {
        return this.usersService.update(id, updateUserDto, admin.id);
    }

    @Patch(':id/suspend')
    @UseGuards(AdminGuard)
    @ApiOperation({
        summary: 'Suspend user (Admin only)',
        description: 'Suspend a user account',
    })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User suspended successfully',
    })
    async suspend(
        @Param('id') id: string,
        @CurrentUser() admin: any,
        @Body('reason') reason?: string,
    ) {
        return this.usersService.suspend(id, admin.id, reason);
    }

    @Patch(':id/activate')
    @UseGuards(AdminGuard)
    @ApiOperation({
        summary: 'Activate user (Admin only)',
        description: 'Activate a suspended user account',
    })
    @ApiParam({ name: 'id', description: 'User ID' })
    @ApiResponse({
        status: 200,
        description: 'User activated successfully',
    })
    async activate(@Param('id') id: string, @CurrentUser() admin: any) {
        return this.usersService.activate(id, admin.id);
    }
}