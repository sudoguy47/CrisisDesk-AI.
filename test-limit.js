// test-limit.js
const testRateLimit = async () => {
  // ⚠️ নিচের ID এবং KEY তোমার নিজেরটা বসিয়ে নিও
  const REPORT_ID =  '6a5473fe86cc47a1f36c436a' ; 
  const ADMIN_KEY = 'sudoguy';

  console.log('Starting rate limit test...\n');

  for (let i = 1; i <= 30; i++) {
    try {
      const res = await fetch(`http://localhost:5000/api/reports/${REPORT_ID}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': ADMIN_KEY
        },
        body: JSON.stringify({ status: 'assigned' })
      });
      
      const data = await res.json();
      
      if (res.status === 429) {
        console.log(`🔴 Request ${i}: Blocked! (Status 429) - ${data.message}`);
      } else {
        console.log(`🟢 Request ${i}: Passed (Status ${res.status})`);
      }
    } catch (err) {
      console.log(`Request ${i}: Failed to connect`);
    }
  }
};

testRateLimit();