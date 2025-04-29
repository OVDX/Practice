import { Test, TestingModule } from '@nestjs/testing';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto/create-receipt.dto';
import { UpdateReceiptDto } from './dto/update-receipt.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

describe('ReceiptsController', () => {
  let controller: ReceiptsController;
  let service: ReceiptsService;

  const mockUser = {
    id: 1,
    sub: 1,
    email: 'test@example.com',
  };

  const mockReceiptsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    extractTextFromImage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReceiptsController],
      providers: [
        {
          provide: ReceiptsService,
          useValue: mockReceiptsService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ReceiptsController>(ReceiptsController);
    service = module.get<ReceiptsService>(ReceiptsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('повинен викликати extractTextFromImage при успішному завантаженні файлу', async () => {
      const file = {
        buffer: Buffer.from('test image data'),
        originalname: 'receipt.jpg',
      } as Express.Multer.File;

      const mockReq = {
        user: { id: 1 },
      };

      const mockResult = {
        id: 1,
        totalPrice: 123.45,
        date: '2025-04-28',
        merchant: 'Test Shop',
        receiptItems: [],
      };

      mockReceiptsService.extractTextFromImage.mockResolvedValue(mockResult);

      const result = await controller.upload(file, mockReq);

      expect(result).toEqual(mockResult);
      expect(service.extractTextFromImage).toHaveBeenCalledWith(file.buffer, 1);
    });

    it('повинен викинути BadRequestException якщо файл не надано', async () => {
      const mockReq = {
        user: { id: 1 },
      };

      await expect(
        controller.upload(undefined as unknown as Express.Multer.File, mockReq),
      ).rejects.toThrow(BadRequestException);
      expect(service.extractTextFromImage).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('повинен повертати масив чеків', async () => {
      const expectedReceipts = [
        {
          id: 1,
          totalPrice: 123.45,
          date: '2025-04-28',
          merchant: 'Test Shop',
          receiptItems: [],
        },
        {
          id: 2,
          totalPrice: 67.89,
          date: '2025-04-29',
          merchant: 'Another Shop',
          receiptItems: [],
        },
      ];

      mockReceiptsService.findAll.mockResolvedValue(expectedReceipts);

      const result = await controller.findAll(mockUser);

      expect(result).toEqual(expectedReceipts);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('повинен повертати один чек за ID', async () => {
      const receipt = {
        id: 1,
        totalPrice: 123.45,
        date: '2025-04-28',
        merchant: 'Test Shop',
        receiptItems: [],
      };

      mockReceiptsService.findOne.mockResolvedValue(receipt);

      const result = await controller.findOne(1);

      expect(result).toEqual(receipt);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('повинен перекинути NotFoundException якщо чек не знайдено', async () => {
      mockReceiptsService.findOne.mockRejectedValue(
        new NotFoundException('Receipt with ID 999 not found'),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('findByUserId', () => {
    it('повинен повертати чеки за ID користувача', async () => {
      const expectedReceipts = [
        {
          id: 1,
          totalPrice: 123.45,
          date: '2025-04-28',
          merchant: 'Test Shop',
          receiptItems: [],
        },
      ];

      mockReceiptsService.findByUserId.mockResolvedValue(expectedReceipts);

      const result = await controller.findByUserId(mockUser);

      expect(result).toEqual(expectedReceipts);
      expect(service.findByUserId).toHaveBeenCalledWith(mockUser.sub);
    });
  });

  describe('create', () => {
    it('повинен створювати новий чек', async () => {
      const createReceiptDto: CreateReceiptDto = {
        totalPrice: 123.45,
        date: '2025-04-28',
        merchant: 'Test Shop',
        userId: 1,
        image_url: 'test.jpg',
        items: [
          {
            name: 'Test Item',
            price: 123.45,
            categoryId: 1,
          },
        ],
      };

      const newReceipt = {
        id: 1,
        ...createReceiptDto,
        receiptItems: [
          {
            id: 1,
            name: 'Test Item',
            price: 123.45,
            categoryId: 1,
            receiptId: 1,
          },
        ],
      };

      mockReceiptsService.create.mockResolvedValue(newReceipt);

      const result = await controller.create(createReceiptDto);

      expect(result).toEqual(newReceipt);
      expect(service.create).toHaveBeenCalledWith(createReceiptDto);
    });

    it('повинен перекинути NotFoundException якщо користувача не знайдено', async () => {
      const createReceiptDto: CreateReceiptDto = {
        totalPrice: 123.45,
        date: '2025-04-28',
        merchant: 'Test Shop',
        userId: 999,
        image_url: 'test.jpg',
        items: [],
      };

      mockReceiptsService.create.mockRejectedValue(
        new NotFoundException('User with ID 999 not found'),
      );

      await expect(controller.create(createReceiptDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.create).toHaveBeenCalledWith(createReceiptDto);
    });
  });

  describe('update', () => {
    it('повинен оновлювати існуючий чек', async () => {
      const id = 1;
      const updateReceiptDto: UpdateReceiptDto = {
        totalPrice: 150.0,
        merchant: 'Updated Shop',
      };

      const updatedReceipt = {
        id,
        totalPrice: 150.0,
        date: '2025-04-28',
        merchant: 'Updated Shop',
        userId: 1,
        image_url: 'test.jpg',
        receiptItems: [],
      };

      mockReceiptsService.update.mockResolvedValue(updatedReceipt);

      const result = await controller.update(id, updateReceiptDto);

      expect(result).toEqual(updatedReceipt);
      expect(service.update).toHaveBeenCalledWith(id, updateReceiptDto);
    });

    it('повинен перекинути NotFoundException при оновленні неіснуючого чеку', async () => {
      const id = 999;
      const updateReceiptDto: UpdateReceiptDto = {
        totalPrice: 150.0,
      };

      mockReceiptsService.update.mockRejectedValue(
        new NotFoundException(`Receipt with ID ${id} not found`),
      );

      await expect(controller.update(id, updateReceiptDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(id, updateReceiptDto);
    });
  });

  describe('remove', () => {
    it('повинен видаляти чек', async () => {
      const id = 1;
      mockReceiptsService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });

    it('повинен перекинути NotFoundException при видаленні неіснуючого чеку', async () => {
      const id = 999;
      mockReceiptsService.remove.mockRejectedValue(
        new NotFoundException(`Receipt with ID ${id} not found`),
      );

      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
