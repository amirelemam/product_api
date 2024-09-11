import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueConstraintToSku1726024552706
    implements MigrationInterface {
    name = 'AddUniqueConstraintToSku1726024552707';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE product ADD CONSTRAINT uq_product_sku UNIQUE (sku);`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {}
}
