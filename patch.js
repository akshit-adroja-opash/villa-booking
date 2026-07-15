const fs = require('fs');

let content = fs.readFileSync('app/admin/reservations/page.tsx', 'utf8');

const target = `      <div className="flex items-center gap-2">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:text-[#002E1E] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
        >
          Previous
        </button>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:text-[#002E1E] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
        >
          Next
        </button>
      </div>`;

// In case line endings are \r\n, handle it
const targetR = target.replace(/\n/g, '\r\n');

const replacement = `      <div className="flex items-center gap-1.5">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:text-[#002E1E] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
        >
          Previous
        </button>
        <div className="flex items-center gap-1 mx-1 hidden sm:flex">
          {Array.from({ length: totalPages }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPage(idx + 1)}
              className={\`w-8 h-8 flex items-center justify-center text-[12px] font-bold rounded-md transition-colors \${
                currentPage === idx + 1
                  ? 'bg-[#00a877] text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-[#1B2A22]'
              }\`}
            >
              {idx + 1}
            </button>
          ))}
        </div>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:text-[#002E1E] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"
        >
          Next
        </button>
      </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('app/admin/reservations/page.tsx', content);
  console.log('Patched using \\n');
} else if (content.includes(targetR)) {
  content = content.replace(targetR, replacement.replace(/\n/g, '\r\n'));
  fs.writeFileSync('app/admin/reservations/page.tsx', content);
  console.log('Patched using \\r\\n');
} else {
  console.log('Could not find target chunk!');
}
