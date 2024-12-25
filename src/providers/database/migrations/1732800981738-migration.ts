import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1732800981738 implements MigrationInterface {
    name = 'Migration1732800981738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "facebookProfileLink" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "instagramProfileLink" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "tiktokProfileLink" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "twitterProfileLink" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "youtubeProfileLink" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "linkedinProfileLink" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "linkedinProfileLink"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "youtubeProfileLink"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "twitterProfileLink"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "tiktokProfileLink"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "instagramProfileLink"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "facebookProfileLink"`);
    }

}
