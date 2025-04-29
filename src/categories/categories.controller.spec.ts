import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { NotFoundException } from '@nestjs/common';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategoriesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('повинен повертати масив категорій', async () => {
      const categories: Category[] = [
        { id: 1, name: 'Food' },
        { id: 2, name: 'Other' },
      ];
      mockCategoriesService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(result).toEqual(categories);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('повинен повертати одну категорію по ID', async () => {
      const category: Category = { id: 1, name: 'Food' };
      mockCategoriesService.findOne.mockResolvedValue(category);

      const result = await controller.findOne(1);

      expect(result).toEqual(category);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('повинен викидати NotFoundException якщо категорія не знайдена', async () => {
      mockCategoriesService.findOne.mockRejectedValue(
        new NotFoundException('Category with ID 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('повинен створювати нову категорію', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Ticket' };
      const newCategory: Category = { id: 3, name: 'Ticket' };
      mockCategoriesService.create.mockResolvedValue(newCategory);

      const result = await controller.create(createCategoryDto);

      expect(result).toEqual(newCategory);
      expect(service.create).toHaveBeenCalledWith(createCategoryDto);
    });
  });

  describe('update', () => {
    it('повинен оновлювати існуючу категорію', async () => {
      const id = 1;
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Оновлена категорія',
      };
      const updatedCategory: Category = { id, name: 'Оновлена категорія' };
      mockCategoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(id, updateCategoryDto);

      expect(result).toEqual(updatedCategory);
      expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
    });

    it('повинен викидати NotFoundException при оновленні неіснуючої категорії', async () => {
      const id = 999;
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Неіснуюча категорія',
      };
      mockCategoriesService.update.mockRejectedValue(
        new NotFoundException(`Category with ID ${id} not found`),
      );

      await expect(controller.update(id, updateCategoryDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(id, updateCategoryDto);
    });
  });

  describe('remove', () => {
    it('повинен видаляти категорію', async () => {
      const id = 1;
      mockCategoriesService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('повинен викидати NotFoundException при видаленні неіснуючої категорії', async () => {
      const id = 999;
      mockCategoriesService.remove.mockRejectedValue(
        new NotFoundException(`Category with ID ${id} not found`),
      );

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
