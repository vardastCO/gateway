import { Injectable } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { AuthorizationService } from "src/users/authorization/authorization.service";
import { User } from "src/users/user/entities/user.entity";
import { DataSource } from "typeorm";
import { ReportEventsCountChart } from "./dto/report-events-count-chart.response";
import { ReportTotalEventsCount } from "./dto/report-total-events-count.response";
import { CompressionService } from "src/compression.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { DecompressionService } from "src/decompression.service";

@Injectable()
export class EventTrackerReportService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private authorizationService: AuthorizationService,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async pastDurationTotalEventsCount(
    user: User,
  ): Promise<ReportTotalEventsCount> {

    const cacheKey = `pastDurationTotalEventsCount`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : ReportTotalEventsCount = 
      this.decompressionService.decompressData(cachedData);
  
      return decompressedData;

    }
    let params = [user.id];
    let filterString =
      'AND contacts. "relatedId" in(SELECT "sellerId" FROM product_seller_representatives WHERE "userId" = $1)';
    const rawSql = `
    SELECT
      count(*) AS "totalCount"
    FROM
      base_event_tracker events
      JOIN users_contact_infos contacts ON contacts.id = events. "subjectId"
    WHERE
      "subjectType" = 'ContactInfo'
      AND contacts. "relatedType" = 'Seller'
      :filterString;`;

    if (await this.authorizationService.setUser(user).hasRole("admin")) {
      params = [];
      filterString = "";
    }

    const data = await this.dataSource.query(
      rawSql.replace(":filterString", filterString),
      params,
    );
    const result = this.compressionService.compressData(data[0])

    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);

    const decompressedResult = this.decompressionService.decompressData(result);

    return decompressedResult;

  }

  async pastDurationEventsChart(user: User,userId:number): Promise<ReportEventsCountChart> {
    const cacheKey = `pastDurationEventsChart_{userId:${userId}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : ReportEventsCountChart = 
      this.decompressionService.decompressData(cachedData);
  
      return decompressedData;

    }
    let params: number[];
    if (userId) {
  
        params = [userId];
    } else {
     
      params = [user.id];
    }
    let filterString =
      'AND contacts. "relatedId" in(SELECT "sellerId" FROM product_seller_representatives WHERE "userId" = $1)';
    
    const rawSql = `
    SELECT
      count(*)
      count,
      jyear (events. "createdAt"::date) || '/' || jmonth (events. "createdAt"::date) || '/' || jday (events. "createdAt"::date) label,
      events. "createdAt"::date "date"
    FROM
      base_event_tracker events
      JOIN users_contact_infos contacts ON contacts.id = events. "subjectId"
    WHERE
      "subjectType" = 'ContactInfo'
      AND contacts. "relatedType" = 'Seller'
      :filterString
    GROUP BY
      jyear (events. "createdAt"::date) || '/' || jmonth (events. "createdAt"::date) || '/' || jday (events. "createdAt"::date), events. "createdAt"::date
    ORDER BY
      events. "createdAt"::date ASC;`;

    if (await this.authorizationService.setUser(user).hasRole("admin")) {
      params = [];
      filterString = "";
    }

    const data = await this.dataSource.query(
      rawSql.replace(":filterString", filterString),
      params,
    );

    const res =  data.reduce(
      (carry, current) => {
        carry.data.push(current.count);
        carry.labels.push(current.label);
        return carry;
      },
      { data: [], labels: [] },
    );

    const result = this.compressionService.compressData(res)

    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);

    const decompressedResult = this.decompressionService.decompressData(result);

    return decompressedResult;
  }
}
