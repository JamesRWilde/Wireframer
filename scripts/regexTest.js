const s = ""use strict";";
console.log('string:', s);
console.log('match? ', /(["'])use strict\\1/.test(s));
console.log('match groups', s.match(/(["'])use strict\\1/));
