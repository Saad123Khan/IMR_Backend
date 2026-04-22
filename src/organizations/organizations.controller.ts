import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { userId: string; organizationId: string };
}

@ApiTags('Organizations')
@ApiBearerAuth('JWT')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('my-organization')
  @ApiOperation({ summary: 'Get current organization details' })
  @ApiOkResponse({ description: 'Organization details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getMyOrganization(@Request() req: RequestWithUser) {
    return this.organizationsService.findById(req.user.organizationId);
  }
}