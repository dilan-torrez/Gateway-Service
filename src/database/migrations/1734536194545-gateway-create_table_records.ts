import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTableRecords1734536194545 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        schema: 'beneficiaries',
        name: 'records',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            isNullable: false,
          },
          {
            name: 'action',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'user',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'recordable_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'record_type_id',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'recordable_type',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('beneficiaries.records', true);
  }
}
