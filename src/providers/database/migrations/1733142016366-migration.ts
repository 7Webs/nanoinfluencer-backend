import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1733142016366 implements MigrationInterface {
    name = 'Migration1733142016366'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "maxDeals" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "maxDeals"`);
    }

}
