import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PvtEnvs } from 'src/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Controller('pvtSti')
export class PvtStiController {
  constructor(private readonly httpService: HttpService) {}

  @MessagePattern('pvtSti.informationLoan')
  async informationLoan(body: { affiliateId: string }) {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${PvtEnvs.PvtBackendApiServer}/app/get_information_loan_v2/${body.affiliateId}`,
      ),
    );
    return data;
  }

  @MessagePattern('pvtSti.loanPrintPlan')
  async loanPrintPlan(body: { loanId: string }) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${PvtEnvs.PvtBackendApiServer}/app/loan/${body.loanId}/print/plan_v2`),
    );
    return data;
  }

  @MessagePattern('pvtSti.loanPrintKardex')
  async loanPrintKardex(body: { loanId: string }) {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${PvtEnvs.PvtBackendApiServer}/app/loan/${body.loanId}/print/kardex_v2`,
      ),
    );
    return data;
  }

  @MessagePattern('pvtSti.allContributions')
  async allContributions(body: { affiliateId: string }) {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${PvtEnvs.PvtBackendApiServer}/app/all_contributions_v2/${body.affiliateId}`,
      ),
    );
    return data;
  }

  @MessagePattern('pvtSti.contributionsPassive')
  async contributionsPassive(body: { affiliateId: string }) {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${PvtEnvs.PvtBackendApiServer}/app/contributions_passive_v2/${body.affiliateId}`,
      ),
    );
    return data;
  }

  @MessagePattern('pvtSti.contributionsActive')
  async contributionsActive(body: { affiliateId: string }) {
    const { data } = await firstValueFrom(
      this.httpService.get(
        `${PvtEnvs.PvtBackendApiServer}/app/contributions_active_v2/${body.affiliateId}`,
      ),
    );
    return data;
  }
}
