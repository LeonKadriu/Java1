import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole, type CategoryDto } from '@marketplace/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List active categories (flat)' })
  findAll(): Promise<CategoryDto[]> {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'List active categories as a tree' })
  findTree(): Promise<CategoryDto[]> {
    return this.categoriesService.findTree();
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a category by id or slug' })
  findOne(@Param('idOrSlug') idOrSlug: string): Promise<CategoryDto> {
    return this.categoriesService.findOne(idOrSlug);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a category (admin only)' })
  create(@Body() dto: CreateCategoryDto): Promise<CategoryDto> {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a category (admin only)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryDto> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a category (admin only)' })
  deactivate(@Param('id') id: string): Promise<CategoryDto> {
    return this.categoriesService.deactivate(id);
  }
}
