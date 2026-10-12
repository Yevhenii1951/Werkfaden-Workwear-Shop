import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261012120000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "personalization_request" add column if not exists "logo_format" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "personalization_request" drop column if exists "logo_format";`);
  }

}
