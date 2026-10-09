import { createSql } from '../config/postgres.mjs';
import { randomBytes, scryptSync } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
process.loadEnvFile('.env.development.local');
const sql=createSql();
const [identity]=await sql.query("SELECT current_database() AS database, current_user AS role, has_database_privilege(current_user,'bee_site','CONNECT') AS production_access, has_schema_privilege(current_user,'public','CREATE') AS ddl, has_table_privilege(current_user,'bee_community_members','INSERT') AS memberships, has_table_privilege(current_user,'bee_community_events','UPDATE') AS rewrite_audit");
assert.equal(identity.database,'bee_site_qa');
assert.equal(identity.production_access,false);assert.equal(identity.ddl,false);assert.equal(identity.memberships,false);assert.equal(identity.rewrite_audit,false);
const password=randomBytes(24).toString('base64url'),salt=randomBytes(16).toString('hex');
const hash=`scrypt$16384$${salt}$${scryptSync(password,salt,64,{N:16384}).toString('hex')}`;
const email='isolated-cms-qa-'+randomBytes(4).toString('hex')+'@community.beeyondtheworld.com';
const [user]=await sql.query('INSERT INTO admin_users(email,password_hash) VALUES($1,$2) RETURNING id',[email,hash]);
const base=process.env.BEE_QA_URL||'http://localhost:3108';let cookie;let journey;let location;
async function request(path,method='GET',data){const r=await fetch(base+path,{method,headers:{'Content-Type':'application/json',Origin:'https://beeyondtheworld.com',...(cookie?{Cookie:cookie}:{})},body:data?JSON.stringify(data):undefined});const b=await r.json();assert(r.status<300,`${path}: ${r.status}: ${JSON.stringify(b)}`);return {r,b};}
try {
 const {r}=await request('/api/admin/auth/login','POST',{email,password});cookie=r.headers.get('set-cookie').split(';')[0];
 const data=await request('/api/admin/journeys');assert(data.b.journeys.length>=8);
 journey=(await request('/api/admin/journeys','POST',{slug:'qa-vps-'+randomBytes(4).toString('hex'),title:'Isolated VPS migration check',published:false})).b.journey;
 assert(journey.id);
 location=(await request(`/api/admin/journeys/${journey.id}/locations`,'POST',{name:'QA place',narrative:'Original draft',published:false})).b.location;
 const updated=(await request(`/api/admin/locations/${location.id}`,'PATCH',{narrative:'Verified transactional edit'})).b.location;
 assert.equal(updated.narrative,'Verified transactional edit');
 const places=(await request(`/api/admin/journeys/${journey.id}/locations`)).b.locations;assert.equal(places[0].narrative,'Verified transactional edit');
 await request(`/api/admin/locations/${location.id}`,'DELETE');location=null;
 const proof={identity,passed:['CMS sign-in','Read existing journeys','Create isolated draft journey','Create location transaction','Update and read location','Delete own test location'],checkedAt:new Date().toISOString()};
 await writeFile('../../outputs/vps-cms-qa.json',JSON.stringify(proof,null,2));console.log(JSON.stringify(proof));
} finally {
 if(location)await sql.query('DELETE FROM locations WHERE id=$1 AND journey_id=$2',[location.id,journey.id]);
 if(journey)await sql.query('DELETE FROM journeys WHERE id=$1',[journey.id]);
 await sql.query('DELETE FROM admin_sessions WHERE admin_user_id=$1',[user.id]);
 await sql.query('DELETE FROM admin_users WHERE id=$1',[user.id]);
 await sql.pool.end();
}
