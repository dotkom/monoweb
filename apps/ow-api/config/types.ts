export interface DBConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface Config {
  database: DBConfig;
}
