import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Router, RoutingStrategy } from '../entities/router.entity';
import { RoutingRule } from '../entities/routing-rule.entity';
import { RoutingRuleType, MTOProvider } from '@src/common/enums';
import { CreateRouterDto, UpdateRouterDto, RoutingRuleDto, UpdateRoutingRuleDto } from '../dto/router.dto';

@Injectable()
export class RouterService {
  constructor(
    @InjectRepository(Router)
    private routerRepository: Repository<Router>,
    @InjectRepository(RoutingRule)
    private routingRuleRepository: Repository<RoutingRule>,
  ) {}

  async create(createDto: CreateRouterDto, organizationId: string): Promise<Router> {
    // Check if router already exists
    const existing = await this.routerRepository.findOne({
      where: {
        country: createDto.country,
        bankName: createDto.bankName,
        currency: createDto.currency,
        organizationId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Router for ${createDto.country}/${createDto.bankName}/${createDto.currency} already exists`,
      );
    }

    const router = this.routerRepository.create({
      ...createDto,
      organizationId,
      strategy: createDto.strategy || RoutingStrategy.MTO,
    });

    const savedRouter = await this.routerRepository.save(router);

    // Add routing rules if provided
    if (createDto.rules && createDto.rules.length > 0) {
      for (const ruleDto of createDto.rules) {
        await this.addRule(savedRouter.id, ruleDto, organizationId);
      }
    }

    return this.findById(savedRouter.id, organizationId);
  }

  async findById(id: string, organizationId: string): Promise<Router> {
    const router = await this.routerRepository.findOne({
      where: { id, organizationId },
      relations: ['rules'],
    });

    if (!router) {
      throw new NotFoundException('Router not found');
    }

    return router;
  }

  async findByCountryBankCurrency(
    country: string,
    bankName: string,
    currency: string,
    organizationId: string,
  ): Promise<Router> {
    const router = await this.routerRepository.findOne({
      where: {
        country,
        bankName,
        currency,
        organizationId,
        isActive: true,
      },
      relations: ['rules'],
    });

    if (!router) {
      throw new NotFoundException(
        `Router for ${country}/${bankName}/${currency} not found`,
      );
    }

    return router;
  }

  async findByCountry(country: string, organizationId: string): Promise<Router[]> {
    return this.routerRepository.find({
      where: { country, organizationId },
      relations: ['rules'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByBank(bankName: string, organizationId: string): Promise<Router[]> {
    return this.routerRepository.find({
      where: { bankName, organizationId },
      relations: ['rules'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<Router[]> {
    return this.routerRepository.find({
      where: { organizationId },
      relations: ['rules'],
      order: { country: 'ASC', bankName: 'ASC', currency: 'ASC' },
    });
  }

  async update(
    id: string,
    updateDto: UpdateRouterDto,
    organizationId: string,
  ): Promise<Router> {
    const router = await this.findById(id, organizationId);

    // Check for duplicate if country/bank/currency are being changed
    if (updateDto.bankName && updateDto.bankName !== router.bankName) {
      const existing = await this.routerRepository.findOne({
        where: {
          country: router.country,
          bankName: updateDto.bankName,
          currency: router.currency,
          organizationId,
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Router for ${router.country}/${updateDto.bankName}/${router.currency} already exists`,
        );
      }
    }

    Object.assign(router, updateDto);
    return this.routerRepository.save(router);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const router = await this.findById(id, organizationId);
    await this.routerRepository.remove(router);
  }

  async addRule(
    routerId: string,
    ruleDto: RoutingRuleDto,
    organizationId: string,
  ): Promise<RoutingRule> {
    // Verify router exists and belongs to organization
    const router = await this.findById(routerId, organizationId);

    const rule = this.routingRuleRepository.create({
      routerId,
      ...ruleDto,
      isActive: ruleDto.isActive !== false,
      priority: ruleDto.priority || 100,
    });

    return this.routingRuleRepository.save(rule);
  }

  async getRules(routerId: string, organizationId: string): Promise<RoutingRule[]> {
    // Verify router exists
    await this.findById(routerId, organizationId);

    return this.routingRuleRepository.find({
      where: { routerId, isActive: true },
      order: { priority: 'ASC' },
    });
  }

  async updateRule(
    routerId: string,
    ruleId: string,
    updateDto: UpdateRoutingRuleDto,
    organizationId: string,
  ): Promise<RoutingRule> {
    // Verify router exists
    await this.findById(routerId, organizationId);

    const rule = await this.routingRuleRepository.findOne({
      where: { id: ruleId, routerId },
    });

    if (!rule) {
      throw new NotFoundException('Routing rule not found');
    }

    Object.assign(rule, updateDto);
    return this.routingRuleRepository.save(rule);
  }

  async removeRule(
    routerId: string,
    ruleId: string,
    organizationId: string,
  ): Promise<void> {
    // Verify router exists
    await this.findById(routerId, organizationId);

    const rule = await this.routingRuleRepository.findOne({
      where: { id: ruleId, routerId },
    });

    if (!rule) {
      throw new NotFoundException('Routing rule not found');
    }

    await this.routingRuleRepository.remove(rule);
  }

  /**
   * Resolve routing based on amount and strategy
   */
  async resolveRoute(
    country: string,
    bankName: string,
    currency: string,
    amount: number,
    organizationId: string,
  ): Promise<MTOProvider> {
    const router = await this.findByCountryBankCurrency(
      country,
      bankName,
      currency,
      organizationId,
    );

    if (router.strategy === RoutingStrategy.AMOUNT) {
      // Find rule matching the amount
      const matchingRule = router.rules
        .filter((r) => r.isActive)
        .sort((a, b) => a.priority - b.priority)
        .find((r) => {
          if (r.ruleType === RoutingRuleType.AMOUNT_RANGE) {
            return amount >= Number(r.minAmount) && amount <= Number(r.maxAmount);
          }
          return false;
        });

      if (matchingRule) {
        return matchingRule.target;
      }
    }

    // Default to defaultRoute or first rule target
    if (router.defaultRoute) {
      return router.defaultRoute;
    }

    const activeRule = router.rules
      .filter((r) => r.isActive)
      .sort((a, b) => a.priority - b.priority)[0];

    if (activeRule) {
      return activeRule.target;
    }

    throw new NotFoundException('No valid routing rule found');
  }
}
