import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.PGHOST || '127.0.0.1',
    //   host: 'db',
    port: Number.parseInt(process.env.PGPORT || "5432"),
    username: process.env.POSTGRES_USER || 'backend',
    password: process.env.POSTGRES_PASSWORD || 'backend',
    database: process.env.POSTGRES_DB || 'backend',
    entities: [join(__dirname, '..', '..', '**', '*.entity.{js,ts}')],
    synchronize: true, //FIXME: WARNING DANGEROUS FOR PRODUCTION
    // logging: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
