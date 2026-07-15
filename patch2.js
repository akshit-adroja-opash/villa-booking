const fs = require('fs');

let content = fs.readFileSync('app/admin/reservations/page.tsx', 'utf8');

// Replace the entire footer block
const regex = /\{\/\* Footer \*\/\}[\s\S]*?\{\s*totalPages > 1 && \([\s\S]*?<div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">[\s\S]*?<p className="text-\[13px\] font-medium text-gray-500">[\s\S]*?Showing <span className="font-bold text-\[#1B2A22\]">\{\(currentPage - 1\) \* itemsPerPage \+ 1\}<\/span> to\{' '\}[\s\S]*?<span className="font-bold text-\[#1B2A22\]">\{Math\.min\(currentPage \* itemsPerPage, filteredBookings\.length\)\}<\/span> of\{' '\}[\s\S]*?<span className="font-bold text-\[#1B2A22\]">\{filteredBookings\.length\}<\/span> results[\s\S]*?<\/p>[\s\S]*?<div className="flex items-center gap-2">[\s\S]*?<button[\s\S]*?onClick=\{\(\) => setCurrentPage\(prev => Math\.max\(prev - 1, 1\)\)\}[\s\S]*?disabled=\{currentPage === 1\}[\s\S]*?className="px-3 py-1\.5 text-\[12px\] font-bold text-gray-500 hover:text-\[#002E1E\] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"[\s\S]*?>[\s\S]*?Previous[\s\S]*?<\/button>[\s\S]*?<button[\s\S]*?onClick=\{\(\) => setCurrentPage\(prev => Math\.min\(prev \+ 1, totalPages\)\)\}[\s\S]*?disabled=\{currentPage === totalPages\}[\s\S]*?className="px-3 py-1\.5 text-\[12px\] font-bold text-gray-500 hover:text-\[#002E1E\] disabled:opacity-50 transition-colors bg-gray-50 hover:bg-gray-100 rounded-md"[\s\S]*?>[\s\S]*?Next[\s\S]*?<\/button>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?\)\}/m;

const replacement = `{/* Footer */}
  {totalPages > 1 && (
    <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4">
      <p className="text-[13px] font-medium text-gray-500 hidden sm:block">
        Showing <span className="font-bold text-[#1B2A22]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
        <span className="font-bold text-[#1B2A22]">{Math.min(currentPage * itemsPerPage, filteredBookings.length)}</span> of{' '}
        <span className="font-bold text-[#1B2A22]">{filteredBookings.length}</span> results
      </p>
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
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
      </div>
    </div>
  )}`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('app/admin/reservations/page.tsx', content);
  console.log('Regex replace successful!');
} else {
  console.log('Regex did not match.');
}
