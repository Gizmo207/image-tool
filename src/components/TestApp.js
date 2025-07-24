import React from 'react';

function TestApp() {
  console.log('🔥 TEST APP LOADED SUCCESSFULLY!');
  
  return (
    <div style={{ padding: '20px', fontSize: '24px' }}>
      <h1>🧪 Test App Working!</h1>
      <p>If you can see this, the React app is loading correctly.</p>
      <button onClick={() => alert('Button works!')}>
        Click me to test
      </button>
    </div>
  );
}

export default TestApp;
