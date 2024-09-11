import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      message: "I'm alive!",
      version: process.env.npm_package_version,
    };
  }
}
