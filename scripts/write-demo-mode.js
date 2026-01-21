#!/usr/bin/env node
/**
 * Helper script to write demo_mode.json file
 * This can be called from the frontend or run manually
 */

const fs = require('fs');
const path = require('path');

const DEMO_MODE_FILE = path.join(__dirname, '..', 'demo_mode.json');

function writeDemoMode(enabled) {
  const data = {
    enabled: enabled === true || enabled === 'true',
    updatedAt: new Date().toISOString(),
  };
  
  try {
    fs.writeFileSync(DEMO_MODE_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Demo mode ${data.enabled ? 'enabled' : 'disabled'}`);
    return true;
  } catch (error) {
    console.error('❌ Error writing demo mode file:', error);
    return false;
  }
}

// If run from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  const enabled = args[0] === 'true' || args[0] === '1' || args[0] === 'enable';
  writeDemoMode(enabled);
}

module.exports = { writeDemoMode };
