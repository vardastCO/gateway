import { Module } from "@nestjs/common";
import { EventTrackerService } from "./event-tracker.service";
import { EventTrackerResolver } from "./event-tracker.resolver";
import { EventTrackerReportResolver } from "./event-tracker-report.resolver";
import { EventTrackerReportService } from "./event-tracker-report.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Module({
  providers: [
    EventTrackerResolver,
    EventTrackerService,
    EventTrackerReportResolver,
    EventTrackerReportService,
    RabbitSellersService,
    CompressionService,
    DecompressionService,
  ],
})
export class EventTrackerModule {}
