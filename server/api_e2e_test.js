const API_URL = 'https://notesapp-x37n.onrender.com/api';

const testRegistration = async (email, year) => {
  console.log(`[TEST] Registering user ${email} with year "${year}"...`);
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123', year })
  });
  
  if (res.status === 400) {
    console.log(`[WARN] User ${email} already exists, attempting login...`);
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error(loginData.message);
    return loginData.token;
  }
  
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.token;
};

const testUpload = async (token) => {
  console.log(`[TEST] Uploading a test document...`);
  const formData = new FormData();
  formData.append('title', 'API E2E Test Note');
  formData.append('subject', 'E2E Subject');
  formData.append('description', 'This is an end-to-end test document.');
  formData.append('isPublic', 'true');
  
  const blob = new Blob(['This is a sample document content for testing preview only!'], { type: 'application/pdf' });
  formData.append('file', blob, 'sample_document.pdf');

  const res = await fetch(`${API_URL}/notes/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  
  if (!res.ok) throw new Error(await res.text());
  const note = await res.json();
  if (note.fileUrl) throw new Error('Raw file URL leaked after upload.');
  console.log(`[OK] Document uploaded successfully. ID: ${note._id}`);
  return note;
};

const flattenNotes = (data) => Array.isArray(data) ? data : Object.values(data || {}).flat();

const testHomeFeed = async (token, expectedTitle) => {
  console.log(`[TEST] Fetching Home feed (All Notes)...`);
  const res = await fetch(`${API_URL}/notes`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const notes = flattenNotes(await res.json());
  const found = notes.some(n => n.title === expectedTitle);
  if (found) {
    console.log(`[OK] Note "${expectedTitle}" successfully appeared in the Home feed!`);
  } else {
    throw new Error('Note did not appear in Home feed.');
  }
};

const testDashboard = async (token, expectedTitle) => {
  console.log(`[TEST] Fetching Dashboard (My Notes)...`);
  const res = await fetch(`${API_URL}/notes/mine`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const notes = flattenNotes(await res.json());
  const found = notes.some(n => n.title === expectedTitle);
  if (found) {
    console.log(`[OK] Note "${expectedTitle}" appeared in Dashboard.`);
  } else {
    throw new Error('Note did not appear in Dashboard.');
  }
};

const testSearch = async (token, query, expectedTitle) => {
  console.log(`[TEST] Searching for "${query}"...`);
  const res = await fetch(`${API_URL}/notes/search?q=${query}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const notes = flattenNotes(await res.json());
  const found = notes.some(n => n.title === expectedTitle);
  if (found) {
    console.log(`[OK] Search works perfectly!`);
  } else {
    throw new Error('Search failed to find the note.');
  }
};

const testProtectedPreview = async (token, note) => {
  console.log(`[TEST] Testing protected document preview...`);
  const previewInfoRes = await fetch(`${API_URL}/notes/preview-info/${note.noteId || note._id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!previewInfoRes.ok) throw new Error('Preview info route failed.');
  const previewInfo = await previewInfoRes.json();
  if (previewInfo.fileUrl) throw new Error('Raw file URL leaked from preview info.');

  const previewRes = await fetch(`${API_URL}/notes/preview/${note.noteId || note._id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!previewRes.ok) throw new Error('Protected preview route failed.');
  console.log(`[OK] Protected preview is accessible through the backend only.`);
};

const runFullTest = async () => {
  try {
    const timestamp = Date.now();
    const token1 = await testRegistration(`test1_${timestamp}@test.com`, 'Final Year');
    
    const note = await testUpload(token1);
    
    await testHomeFeed(token1, 'API E2E Test Note');
    await testDashboard(token1, 'API E2E Test Note');
    await testSearch(token1, 'E2E', 'API E2E Test Note');
    await testProtectedPreview(token1, note);
    
    console.log('\n[TEST] Logging in as a second user with different case year...');
    const token2 = await testRegistration(`test2_${timestamp}@test.com`, ' final year ');
    
    await testHomeFeed(token2, 'API E2E Test Note');
    
    console.log('\n==========================================');
    console.log('✅ ALL E2E FEATURES WORKING PERFECTLY! ✅');
    console.log('==========================================\n');
  } catch (error) {
    console.error('\n❌ E2E TEST FAILED:', error.message);
  }
};

runFullTest();
