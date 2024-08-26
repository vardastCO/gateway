import { Injectable } from "@nestjs/common";
import { User } from "src/users/user/entities/user.entity";
import { CreateEventTrackerInput } from "./dto/create-event-tracker.input";
import { EventTracker } from "./entities/event-tracker.entity";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  Inject,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from "../utilities/cache-ttl.util";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
@Injectable()
export class EventTrackerService {
  constructor(
  @Inject(CACHE_MANAGER) private cacheManager: Cache,
  private readonly rabbitSellersService: RabbitSellersService, 
  private readonly compressionService: CompressionService,
  private readonly decompressionService: DecompressionService,
  ) {}
  async create(
    createEventTrackerInput: CreateEventTrackerInput,
    user: User,
  ) : Promise<boolean> {

    if (user) {
      createEventTrackerInput.userId = 1;
    }
  
    createEventTrackerInput.ipAddress =  "0.0.0.0";
    createEventTrackerInput.agent =  "Unknown";
    const event: EventTracker = EventTracker.create<EventTracker>(createEventTrackerInput);

    const payload = { event };

    const compressedPayload = this.compressionService.compressData(payload);

    this.rabbitSellersService.send('create_event_tracker', { data: compressedPayload  });

    return true
  }

  findAll() {
    return `This action returns all eventTracker`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventTracker`;
  }
}
