async function test() {
  const res = await fetch("http://localhost:3000/api/admin/medicos", {
    headers: {
      "Cookie": "" // Wait, no session cookie! So it will return 403 Forbidden!
    }
  });
  console.log(res.status, await res.text());
}
test();
