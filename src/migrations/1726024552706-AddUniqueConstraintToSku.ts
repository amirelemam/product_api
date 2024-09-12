import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToSku1726024552706
  implements MigrationInterface
{
  name = 'AddUniqueConstraintToSku1726024552706';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."product_currency_enum" AS ENUM('USD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sku" character varying NOT NULL, "name" character varying, "brand" character varying, "model" character varying, "category" character varying, "color" character varying, "price" double precision, "currency" "public"."product_currency_enum" NOT NULL DEFAULT 'USD', "stock" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_34f6ca1cd897cc926bdcca1ca39" UNIQUE ("sku"), CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product"`);
    await queryRunner.query(`DROP TYPE "public"."product_currency_enum"`);
  }
}
