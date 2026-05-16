import { createServer } from 'http';

async function test() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'tes123', password: 'password123' }) // need a user account
  });
  const loginData = await loginRes.json();
  
  if (!loginData.token) {
     // create user
     await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'tes', username: 'tes123', email: 'tes@example.com', password: 'password123', phone: '123' })
     });
     // login again
     const loginRes2 = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'tes123', password: 'password123' }) // need a user account
    });
    const ld = await loginRes2.json();
    loginData.token = ld.token;
  }
  const token = loginData.token;

  const createRes = await fetch('http://localhost:3000/api/cart', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ menu_id: 1 })
  });
  const text = await createRes.text();
  console.log("Create cart:", createRes.status, text);
}
test();
