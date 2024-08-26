// contact us

import { Module } from "@nestjs/common";
import {ContactUsService} from "./contactus.service"
import { ContactResolver } from "./contactus.resolver"
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Module({
    providers: [
        ContactUsService,
        ContactResolver,
        CompressionService,
        DecompressionService,
    ]
})

export class ContactUsModule { };