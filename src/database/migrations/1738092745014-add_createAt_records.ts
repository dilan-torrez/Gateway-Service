import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddCreateAtRecords1738092745014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'records',
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'now()',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('records', 'created_at');
  }
}
