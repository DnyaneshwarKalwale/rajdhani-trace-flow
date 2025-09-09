// Clear localStorage to fix quota exceeded error
(function() {
  // Clear all rajdhani related data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('rajdhani_')) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`Removed: ${key}`);
  });
  
  console.log(`Cleared ${keysToRemove.length} items from localStorage`);
  console.log('localStorage cleared successfully!');
})();
