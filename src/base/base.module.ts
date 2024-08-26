import { Module } from "@nestjs/common";
import { BlogModule } from "./blog/blog.module";
import { FaqModule } from "./faq/faq.module";
import { EventTrackerModule } from "./event-tracker/event-tracker.module";
import { ContactUsModule } from "./contactus/contactus.module";



@Module({
  imports: [
    BlogModule,
    ContactUsModule,
    FaqModule,
    EventTrackerModule
  ],
})
export class BaseModule {}
