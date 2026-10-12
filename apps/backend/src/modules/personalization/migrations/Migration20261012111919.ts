import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261012111919 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "personalization_request" ("id" text not null, "customer_id" text null, "contact_name" text not null, "contact_email" text not null, "company" text null, "product_id" text not null, "variant_id" text not null, "quantity" integer not null, "comment" text null, "file_id" text not null, "status" text check ("status" in ('submitted', 'reviewing', 'quoted', 'rejected', 'closed')) not null default 'submitted', "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "personalization_request_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_personalization_request_deleted_at" ON "personalization_request" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "personalization_request" cascade;`);
  }

}
