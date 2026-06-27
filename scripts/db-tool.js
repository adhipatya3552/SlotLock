const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Simple parser for .env / .env.local files
function loadEnv() {
  const envPaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '.env')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`Loading environment variables from: ${path.basename(envPath)}`);
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          // Remove quotes if present
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }
          process.env[key] = value.trim();
        }
      });
      break; // Only load first found file to mimic Next.js behavior
    }
  }
}

async function main() {
  loadEnv();

  const host = process.env.PGHOST || process.env.DSQL_HOST;
  const port = process.env.PGPORT || '5432';
  const user = process.env.PGUSER || 'admin';
  const password = process.env.PGPASSWORD;
  const database = process.env.PGDATABASE || 'postgres';
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString && !host) {
    console.error('Error: No database configuration found. Please set DATABASE_URL or PGHOST/DSQL_HOST in your environment or in a .env.local file.');
    console.log('\nExample .env.local configuration:');
    console.log('PGHOST=jbt4estecl27vvbszta7h6c7ou.dsql.us-east-1.on.aws');
    console.log('PGUSER=admin');
    console.log('PGDATABASE=postgres');
    console.log('PGPASSWORD=your-dsql-token-or-password');
    process.exit(1);
  }

  console.log(`Connecting to database at ${connectionString ? 'DATABASE_URL' : `${host}:${port}`}...`);

  const isDSQL = host && host.includes('.dsql.');
  let config = {
    connectionString,
    host,
    port: parseInt(port),
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false }
  };

  let pool;
  if (isDSQL) {
    const { AuroraDSQLPool } = require('@aws/aurora-dsql-node-postgres-connector');
    pool = new AuroraDSQLPool(config);
  } else {
    pool = new Pool(config);
  }

  const args = process.argv.slice(2);
  const command = args[0];

  try {
    if (command === 'schema') {
      const schemaPath = path.join(__dirname, '..', 'slotlock_schema.sql');
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found at ${schemaPath}`);
      }
      console.log('Reading slotlock_schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      console.log('Applying schema to database (executing statement by statement)...');
      // Split statements by semicolon, filter out comment-only lines and trim
      const statements = schemaSql
        .split(';')
        .map(stmt => {
          return stmt
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n')
            .trim();
        })
        .filter(stmt => stmt.length > 0);

      for (let i = 0; i < statements.length; i++) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        await pool.query(statements[i]);
      }
      console.log('Success: Schema applied successfully!');
    } else if (command === 'query') {
      const queryStr = args.slice(1).join(' ');
      if (!queryStr) {
        throw new Error('Please specify a query, e.g.: node scripts/db-tool.js query "SELECT * FROM businesses"');
      }
      console.log(`Executing query: ${queryStr}`);
      const res = await pool.query(queryStr);
      console.log(`Rows returned: ${res.rowCount}`);
      console.table(res.rows);
    } else {
      console.log('Connected successfully to database!');
      console.log('\nAvailable commands:');
      console.log('  node scripts/db-tool.js schema        - Applies the slotlock_schema.sql file');
      console.log('  node scripts/db-tool.js query "SQL"   - Runs a custom SQL query and prints results');
    }
  } catch (err) {
    console.error('Database Operation Failed:', err.message);
    if (err.detail) console.error('Details:', err.detail);
    if (err.hint) console.error('Hint:', err.hint);
  } finally {
    await pool.end();
  }
}

main();
