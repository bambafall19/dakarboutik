// Split migration files without breaking PostgreSQL function bodies or quoted strings.
export function migrationStatements(source) {
 const result=[];let start=0,quote='',dollar='',line=false,block=false;
 for(let i=0;i<source.length;i++){
  const c=source[i],next=source[i+1];
  if(line){if(c==='\n')line=false;continue;}
  if(block){if(c==='*'&&next==='/'){block=false;i++;}continue;}
  if(dollar){if(source.startsWith(dollar,i)){i+=dollar.length-1;dollar='';}continue;}
  if(quote){if(c===quote){if(next===quote)i++;else quote='';}continue;}
  if(c==='-'&&next==='-'){line=true;i++;continue;}
  if(c==='/'&&next==='*'){block=true;i++;continue;}
  if(c==='\''||c==='"'){quote=c;continue;}
  if(c==='$'){const tag=source.slice(i).match(/^\$(?:[a-zA-Z_][\w]*)?\$/)?.[0];if(tag){dollar=tag;i+=tag.length-1;continue;}}
  if(c===';'){result.push(source.slice(start,i).trim());start=i+1;}
 }
 if(quote||dollar||block)throw Error('Migration SQL incomplète.');
 if(source.slice(start).trim())result.push(source.slice(start).trim());
 return result.filter(sql=>{const command=sql.replace(/^\s*(?:--[^\n]*(?:\n|$)\s*)*/,'').trim();return command&&!/^(BEGIN|COMMIT)$/i.test(command);});
}
