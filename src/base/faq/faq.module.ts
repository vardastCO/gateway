// faq

import { Module } from "@nestjs/common";

import {FaqService} from "./faq.service"
import { FaqResolver } from "./faq.resolver"
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";

@Module({
    providers: [
        FaqService,
        FaqResolver,
        CompressionService,
        DecompressionService,
    ]
})

export class FaqModule { };