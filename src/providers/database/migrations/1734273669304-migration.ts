import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1734273669304 implements MigrationInterface {
    name = 'Migration1734273669304'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "redeemed_deal" ALTER COLUMN "status" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "redeemed_deal" ALTER COLUMN "status" SET DEFAULT 'pending_usage'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "redeemed_deal" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "redeemed_deal" ALTER COLUMN "status" DROP NOT NULL`);
    }

}
