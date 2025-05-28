const testSMS = async () => {
  try {
    const response = await fetch('http://localhost:3456/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Test from Claude: Your SMS notification system is working! 🎉' })
    });
    
    const result = await response.json();
    console.log('SMS Send Result:', result);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

testSMS();