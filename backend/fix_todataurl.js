const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace all toDataUrl functions
  const regex = /const\s+toDataUrl\s*=\s*\([^\)]*\)\s*=>\s*\{([\s\S]*?)return\s+`data:\$\{fileObj\.contentType\};base64,\$\{buffer\.toString\(['"]base64['"]\)\}`;?\s*\};?/g;

  content = content.replace(regex, (match) => {
    return `const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return undefined;
      if (typeof fileObj.data === 'string') return \`data:\${fileObj.contentType};base64,\${fileObj.data}\`;
      let buffer;
      if (Buffer.isBuffer(fileObj.data)) {
        buffer = fileObj.data;
      } else if (fileObj.data.type === 'Buffer' && Array.isArray(fileObj.data.data)) {
        buffer = Buffer.from(fileObj.data.data);
      } else {
        buffer = Buffer.from(fileObj.data);
      }
      return \`data:\${fileObj.contentType};base64,\${buffer.toString("base64")}\`;
    };`;
  });

  // Specifically fix auth.js second instance if not matched
  const authRegex2 = /const\s+toDataUrl\s*=\s*\([^\)]*\)\s*=>\s*\{\s*if\s*\(!fileObj\s*\|\|\s*!fileObj\.data\)\s*return\s*undefined;\s*return\s+`data:\$\{fileObj\.contentType\};base64,\$\{fileObj\.data\.toString\(['"]base64['"]\)\}`;?\s*\};?/g;
  content = content.replace(authRegex2, (match) => {
    return `const toDataUrl = (fileObj) => {
      if (!fileObj || !fileObj.data) return undefined;
      if (typeof fileObj.data === 'string') return \`data:\${fileObj.contentType};base64,\${fileObj.data}\`;
      let buffer = Buffer.isBuffer(fileObj.data) ? fileObj.data : Buffer.from(fileObj.data);
      return \`data:\${fileObj.contentType};base64,\${buffer.toString("base64")}\`;
    };`;
  });

  fs.writeFileSync(filePath, content);
}

fixFile('e:/Web_Thue_Xe_Update/backend/routes/auth.js');
fixFile('e:/Web_Thue_Xe_Update/backend/routes/users.js');

// Fix GET /users/:id/avatar in users.js
let usersContent = fs.readFileSync('e:/Web_Thue_Xe_Update/backend/routes/users.js', 'utf8');
const avatarRegex = /let buffer;\s*if\s*\(Buffer\.isBuffer\(avatar\.data\)\)\s*\{\s*buffer\s*=\s*avatar\.data;\s*\}\s*else\s*if\s*\(avatar\.data\.type\s*===\s*'Buffer'\)\s*\{\s*buffer\s*=\s*Buffer\.from\(avatar\.data\.data\);\s*\}\s*else\s*\{\s*buffer\s*=\s*Buffer\.from\(avatar\.data\);\s*\}/;
usersContent = usersContent.replace(avatarRegex, `let buffer;
    if (typeof avatar.data === 'string') {
      buffer = Buffer.from(avatar.data, 'base64');
    } else if (Buffer.isBuffer(avatar.data)) {
      buffer = avatar.data;
    } else if (avatar.data.type === 'Buffer' && Array.isArray(avatar.data.data)) {
      buffer = Buffer.from(avatar.data.data);
    } else {
      buffer = Buffer.from(avatar.data);
    }`);
fs.writeFileSync('e:/Web_Thue_Xe_Update/backend/routes/users.js', usersContent);

console.log("Fixed toDataUrl and avatar buffer");
